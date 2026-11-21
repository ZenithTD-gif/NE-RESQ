'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { BasemapType } from './DisasterMapInteractive';

interface EvacuationMapProps {
  userLocation: { lat: number; lng: number; label: string } | null;
  destination: { lat: number; lng: number; name: string } | null;
  routeCoordinates?: Array<[number, number]>;
  alternativeCoordinates?: Array<[number, number]>;
}

export default function EvacuationMapInteractive({
  userLocation,
  destination,
  routeCoordinates,
  alternativeCoordinates
}: EvacuationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const activeTileLayerRef = useRef<any>(null);
  const elementsGroupRef = useRef<any>(null);
  const LRef = useRef<any>(null);

  const [activeBasemap, setActiveBasemap] = useState<BasemapType>('satellite');

  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || '';
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

  const createTileLayer = (L: any, type: BasemapType) => {
    if (type === 'satellite') {
      if (mapboxToken) {
        return L.tileLayer(
          `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/256/{z}/{x}/{y}?access_token=${mapboxToken}`,
          {
            attribution: '&copy; Mapbox &copy; Maxar',
            tileSize: 256,
            maxZoom: 19,
          }
        );
      }
      if (maptilerKey) {
        return L.tileLayer(
          `https://api.maptiler.com/maps/hybrid/256/{z}/{x}/{y}.jpg?key=${maptilerKey}`,
          {
            attribution: '&copy; MapTiler &copy; OpenStreetMap',
            tileSize: 256,
            maxZoom: 19,
          }
        );
      }
      return L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: '&copy; Esri', maxZoom: 19 }
      );
    }

    if (mapboxToken) {
      return L.tileLayer(
        `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/256/{z}/{x}/{y}?access_token=${mapboxToken}`,
        {
          attribution: '&copy; Mapbox &copy; OpenStreetMap',
          tileSize: 256,
          maxZoom: 19,
        }
      );
    }

    if (maptilerKey) {
      return L.tileLayer(
        `https://api.maptiler.com/maps/topo-v2/256/{z}/{x}/{y}.png?key=${maptilerKey}`,
        {
          attribution: '&copy; MapTiler &copy; OpenStreetMap',
          tileSize: 256,
          maxZoom: 19,
        }
      );
    }

    return L.tileLayer(
      'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      { attribution: '&copy; OpenTopoMap', subdomains: 'abc', maxZoom: 17 }
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

      const defaultCenter: [number, number] = userLocation 
        ? [userLocation.lat, userLocation.lng] 
        : [26.18, 91.75]; // Guwahati corridor default

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 12,
        minZoom: 6,
        maxZoom: 18,
        zoomControl: false,
      });

      const tileLayer = createTileLayer(L, activeBasemap);
      tileLayer.addTo(map);
      activeTileLayerRef.current = tileLayer;

      L.control.zoom({ position: 'topright' }).addTo(map);

      const group = L.featureGroup().addTo(map);
      elementsGroupRef.current = group;
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

  // Basemap switcher
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = LRef.current;
    if (!map || !L) return;

    if (activeTileLayerRef.current) {
      map.removeLayer(activeTileLayerRef.current);
    }

    const newLayer = createTileLayer(L, activeBasemap);
    newLayer.addTo(map);
    activeTileLayerRef.current = newLayer;

    if (elementsGroupRef.current) {
      elementsGroupRef.current.bringToFront();
    }
  }, [activeBasemap]);

  // Update Route and Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = elementsGroupRef.current;
    const L = LRef.current;
    if (!map || !group || !L) return;

    group.clearLayers();
    const boundsPoints: [number, number][] = [];

    // 1. User Current Location Pin (Pulsing Cyan/Emerald GPS Ring)
    if (userLocation) {
      boundsPoints.push([userLocation.lat, userLocation.lng]);
      const userHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
          <div style="position: absolute; inset: 0; border-radius: 9999px; background: rgba(6, 182, 212, 0.35); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 22px; height: 22px; border-radius: 9999px; background: #06B6D4; border: 3px solid #FFFFFF; box-shadow: 0 0 16px rgba(6, 182, 212, 0.9);">
            <div style="width: 6px; height: 6px; background: #FFFFFF; border-radius: 9999px; margin: 5px auto;"></div>
          </div>
        </div>
      `;
      const userIcon = L.divIcon({
        className: 'user-gps-marker',
        html: userHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; padding: 4px;">
            <strong style="color: #0284C7;">Your Detected Location</strong>
            <div style="color: #475569; margin-top: 2px;">${userLocation.label}</div>
            <div style="color: #64748B; font-size: 10px; margin-top: 4px;">GPS: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}</div>
          </div>
        `);
      userMarker.addTo(group);
    }

    // 2. Destination Shelter Pin (Emerald Shield)
    if (destination) {
      boundsPoints.push([destination.lat, destination.lng]);
      const destHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 9999px; background: #059669; border: 3px solid #FFFFFF; box-shadow: 0 4px 16px rgba(5, 150, 105, 0.6); color: white; font-size: 16px; font-weight: bold;">
          ⛺
        </div>
      `;
      const destIcon = L.divIcon({
        className: 'dest-shelter-marker',
        html: destHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const destMarker = L.marker([destination.lat, destination.lng], { icon: destIcon })
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; padding: 4px;">
            <strong style="color: #059669;">Designated Relief Facility</strong>
            <div style="color: #0F172A; font-weight: 700; margin-top: 2px;">${destination.name}</div>
            <div style="color: #059669; font-size: 10px; font-weight: 800; margin-top: 4px;">VERIFIED SAFE REFUGE</div>
          </div>
        `);
      destMarker.addTo(group);
    }

    // 3. Alternative Route (Dashed Amber)
    if (alternativeCoordinates && alternativeCoordinates.length > 1) {
      const altLine = L.polyline(alternativeCoordinates, {
        color: '#F59E0B',
        weight: 4,
        opacity: 0.75,
        dashArray: '8, 8'
      }).bindPopup('<strong>Alternative Evacuation Corridor</strong><br/>Secondary transit bypass.');
      altLine.addTo(group);
    }

    // 4. Primary Route (Glowing Cyan / Emerald Polyline)
    if (routeCoordinates && routeCoordinates.length > 1) {
      routeCoordinates.forEach(pt => boundsPoints.push(pt));
      
      // Shadow / glow path
      L.polyline(routeCoordinates, {
        color: '#0284C7',
        weight: 8,
        opacity: 0.4
      }).addTo(group);

      // Core crisp path
      const mainLine = L.polyline(routeCoordinates, {
        color: '#10B981',
        weight: 4,
        opacity: 0.95
      }).bindPopup('<strong>Primary Safe Evacuation Corridor</strong><br/>Elevated road with lowest flooding index.');
      mainLine.addTo(group);
    }

    // Auto-fit to route bounds
    if (boundsPoints.length > 0) {
      map.fitBounds(L.latLngBounds(boundsPoints), {
        padding: [45, 45],
        maxZoom: 15,
        animate: true,
        duration: 1
      });
    }
  }, [userLocation, destination, routeCoordinates, alternativeCoordinates]);

  return (
    <div className="relative w-full h-[420px] rounded-3xl overflow-hidden bg-slate-900 border border-sky-200/80 shadow-md">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Style Switcher HUD Top-Left (Satellite & Topographic ONLY) */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1 rounded-full border border-sky-200 shadow-md">
        <button
          type="button"
          onClick={() => setActiveBasemap('satellite')}
          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
            activeBasemap === 'satellite'
              ? 'bg-sky-500 text-white shadow-xs'
              : 'text-charcoal-muted hover:text-charcoal'
          }`}
        >
          <span>🛰️</span>
          <span>Satellite</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveBasemap('topo')}
          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
            activeBasemap === 'topo'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-charcoal-muted hover:text-charcoal'
          }`}
        >
          <span>⛰️</span>
          <span>Topographic</span>
        </button>
      </div>

      {/* Legend Badge Bottom-Left */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-sky-200 shadow-sm text-[10px] font-semibold text-charcoal flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping inline-block" />
          <span>Your GPS</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
          <span>Shelter</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 h-1 bg-emerald-500 inline-block rounded" />
          <span>Primary Route</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 h-1 bg-amber-500 inline-block rounded border-dashed" />
          <span>Alternative</span>
        </div>
      </div>
    </div>
  );
}
