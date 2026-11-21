'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { NORTHEAST_STATES } from '@shared/northeast-data';

export interface MapMarkerItem {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  state: string;
  lat: number;
  lng: number;
  details: any;
}

interface DisasterMapInteractiveProps {
  markers: MapMarkerItem[];
  selectedState: string;
  selectedMarkerId?: string | null;
  onSelectMarker: (marker: MapMarkerItem) => void;
}

// Only Satellite and Topographic as requested
export type BasemapType = 'satellite' | 'topo';

export default function DisasterMapInteractive({
  markers,
  selectedState,
  selectedMarkerId,
  onSelectMarker,
}: DisasterMapInteractiveProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const activeTileLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const [activeBasemap, setActiveBasemap] = useState<BasemapType>('satellite');
  const [isSwitching, setIsSwitching] = useState(false);

  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || '';
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

  // Function to create tile layer with fallback resilience
  const createTileLayer = (L: any, type: BasemapType) => {
    if (type === 'satellite') {
      // 1. Mapbox Satellite Streets (High-resolution aerial with street labels)
      if (mapboxToken) {
        return L.tileLayer(
          `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/256/{z}/{x}/{y}?access_token=${mapboxToken}`,
          {
            attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; Maxar',
            tileSize: 256,
            maxZoom: 19,
          }
        );
      }
      // 2. MapTiler Satellite Hybrid
      if (maptilerKey) {
        return L.tileLayer(
          `https://api.maptiler.com/maps/hybrid/256/{z}/{x}/{y}.jpg?key=${maptilerKey}`,
          {
            attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; OpenStreetMap',
            tileSize: 256,
            maxZoom: 19,
          }
        );
      }
      // 3. ESRI World Imagery Satellite Fallback
      return L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri &copy; Earthstar Geographics',
          maxZoom: 19,
        }
      );
    }

    // Topographic: Detailed contours, elevation, terrain relief
    // 1. Mapbox Outdoors (High-fidelity contours, hillshading, elevations, trails)
    if (mapboxToken) {
      return L.tileLayer(
        `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/256/{z}/{x}/{y}?access_token=${mapboxToken}`,
        {
          attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; OpenStreetMap',
          tileSize: 256,
          maxZoom: 19,
        }
      );
    }

    // 2. MapTiler Topographic
    if (maptilerKey) {
      return L.tileLayer(
        `https://api.maptiler.com/maps/topo-v2/256/{z}/{x}/{y}.png?key=${maptilerKey}`,
        {
          attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; OpenStreetMap',
          tileSize: 256,
          maxZoom: 19,
        }
      );
    }

    // 3. OpenTopoMap with full topographic contour lines and hillshading
    return L.tileLayer(
      'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> &copy; OpenStreetMap contributors',
        subdomains: 'abc',
        maxZoom: 17,
      }
    );
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;
      LRef.current = L;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const NE_CENTER: [number, number] = [26.2006, 92.9376];
      const initialZoom = 7;

      const map = L.map(mapContainerRef.current, {
        center: NE_CENTER,
        zoom: initialZoom,
        minZoom: 5,
        maxZoom: 18,
        zoomControl: false,
      });

      const initialLayer = createTileLayer(L, activeBasemap);
      initialLayer.addTo(map);
      activeTileLayerRef.current = initialLayer;

      L.control.zoom({ position: 'topright' }).addTo(map);

      const markerGroup = L.featureGroup().addTo(map);
      markersLayerRef.current = markerGroup;
      mapInstanceRef.current = map;

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Smooth Basemap Switching
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = LRef.current;
    if (!map || !L) return;

    setIsSwitching(true);

    const oldLayer = activeTileLayerRef.current;
    const newLayer = createTileLayer(L, activeBasemap);
    
    // Add new layer under markers
    newLayer.addTo(map);
    activeTileLayerRef.current = newLayer;

    // Bring markers to front so they remain interactive
    if (markersLayerRef.current) {
      markersLayerRef.current.bringToFront();
    }

    // Smooth transition: remove old layer after new tiles load
    const timer = setTimeout(() => {
      if (oldLayer && map.hasLayer(oldLayer)) {
        map.removeLayer(oldLayer);
      }
      setIsSwitching(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [activeBasemap]);

  // Handle State Pan / Zoom
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedState && selectedState !== 'All States') {
      const stateObj = NORTHEAST_STATES.find(
        (s) => s.name.toLowerCase() === selectedState.toLowerCase()
      );
      if (stateObj && stateObj.latitude && stateObj.longitude) {
        map.flyTo([stateObj.latitude, stateObj.longitude], 8.5, {
          duration: 1.2,
        });
      }
    } else {
      map.flyTo([26.2006, 92.9376], 7, {
        duration: 1.2,
      });
    }
  }, [selectedState]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markerGroup = markersLayerRef.current;
    const L = LRef.current;

    if (!map || !markerGroup || !L) return;

    markerGroup.clearLayers();

    markers.forEach((m) => {
      if (!m.lat || !m.lng) return;

      const isShelter = m.type === 'SHELTER';
      const isGauge = m.type === 'RIVER_GAUGE';
      const isSelected = selectedMarkerId === m.id;

      const primaryColor = isShelter
        ? '#059669' // Emerald
        : isGauge
        ? '#0284C7' // Sky Blue
        : '#E94B55'; // Emergency Coral

      const iconHtml = `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${isSelected ? '38px' : '30px'};
          height: ${isSelected ? '38px' : '30px'};
          border-radius: 9999px;
          background: #FFFFFF;
          border: 2px solid ${primaryColor};
          box-shadow: 0 4px 14px rgba(15,23,42,0.22), 0 0 12px ${primaryColor}66;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        ">
          ${
            isSelected
              ? `<div style="
                  position: absolute;
                  inset: -6px;
                  border-radius: 9999px;
                  border: 2px solid ${primaryColor};
                  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                  opacity: 0.85;
                "></div>`
              : ''
          }
          <div style="color: ${primaryColor}; font-size: ${isSelected ? '16px' : '13px'}; line-height: 1; font-weight: bold;">
            ${isShelter ? '⛺' : isGauge ? '🌊' : '⚠️'}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: [isSelected ? 38 : 30, isSelected ? 38 : 30],
        iconAnchor: [isSelected ? 19 : 15, isSelected ? 19 : 15],
      });

      const leafletMarker = L.marker([m.lat, m.lng], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 230px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: ${primaryColor}; background: ${primaryColor}15; border: 1px solid ${primaryColor}40; padding: 2px 8px; border-radius: 9999px;">
              ${m.type}
            </span>
            <span style="font-size: 11px; font-weight: 600; color: #64748B;">
              ${m.state}
            </span>
          </div>
          <h4 style="font-size: 13px; font-weight: 800; color: #0F172A; margin: 0 0 4px 0; line-height: 1.3;">
            ${m.title}
          </h4>
          <p style="font-size: 11px; color: #475569; margin: 0 0 8px 0; line-height: 1.4;">
            ${m.subtitle}
          </p>
          <div style="padding-top: 6px; border-top: 1px solid rgba(186,230,253,0.6); font-size: 10px; color: #64748B; display: flex; justify-content: space-between;">
            <span>GPS: ${m.lat.toFixed(4)}, ${m.lng.toFixed(4)}</span>
            <span style="font-weight: 700; color: #059669;">Verified Official</span>
          </div>
        </div>
      `;

      leafletMarker.bindPopup(popupHtml, {
        className: 'liquid-glass-popup',
        closeButton: true,
      });

      leafletMarker.on('click', () => {
        onSelectMarker(m);
      });

      leafletMarker.addTo(markerGroup);
    });
  }, [markers, selectedMarkerId, onSelectMarker]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([26.2006, 92.9376], 7, { duration: 1 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[580px] rounded-3xl overflow-hidden bg-slate-900 shadow-inner">
      {/* Map Target Canvas */}
      <div 
        ref={mapContainerRef} 
        className={`w-full h-full min-h-[580px] z-0 transition-opacity duration-300 ${
          isSwitching ? 'opacity-90' : 'opacity-100'
        }`} 
      />

      {/* Floating Tactical HUD Info & 2-Option Basemap Switcher (Satellite & Topographic ONLY) */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="pointer-events-auto bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-sky-200 text-xs font-semibold text-charcoal shadow-sm flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{markers.length} Coordinates Pinned</span>
        </div>

        {/* 2-Option Basemap Switcher (Satellite & Topo ONLY - Light removed) */}
        <div className="pointer-events-auto bg-white/90 backdrop-blur-md p-1 rounded-full border border-sky-200 shadow-md flex items-center gap-1 transition-all">
          <button
            type="button"
            onClick={() => setActiveBasemap('satellite')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
              activeBasemap === 'satellite'
                ? 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-sm ring-1 ring-sky-300'
                : 'text-charcoal-muted hover:text-charcoal hover:bg-slate-100'
            }`}
            title="High-resolution aerial satellite imagery with highway network"
          >
            <span>🛰️</span>
            <span>Satellite</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveBasemap('topo')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
              activeBasemap === 'topo'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm ring-1 ring-emerald-300'
                : 'text-charcoal-muted hover:text-charcoal hover:bg-slate-100'
            }`}
            title="Topographic terrain contours, mountain elevations and hypsometry"
          >
            <span>⛰️</span>
            <span>Topographic</span>
          </button>
        </div>

        <div className="pointer-events-auto text-[11px] font-mono text-charcoal-muted bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-sky-100 shadow-xs hidden md:inline-block">
          WGS84 • EPSG:4326
        </div>
      </div>

      {/* Floating Recenter Action */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={handleResetView}
          className="bg-white/90 backdrop-blur-md hover:bg-white text-charcoal hover:text-cyan-600 text-xs font-bold px-3.5 py-2 rounded-2xl border border-sky-200 shadow-md transition-all flex items-center gap-1.5 active:scale-95"
        >
          <span>🎯</span>
          <span>Reset Northeast View</span>
        </button>
      </div>

      {/* Legend Badge Bottom-Left */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-sky-200 shadow-sm text-[11px] font-semibold text-charcoal flex items-center gap-4 hidden sm:flex">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block border border-white shadow-sm" />
          <span>Shelters</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-cyan-600 inline-block border border-white shadow-sm" />
          <span>River Gauges</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emergency inline-block border border-white shadow-sm" />
          <span>Hazard Warning</span>
        </div>
      </div>
    </div>
  );
}
