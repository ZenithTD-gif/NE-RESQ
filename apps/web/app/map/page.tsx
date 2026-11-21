'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Layers, 
  MapPin, 
  Filter, 
  Home as HomeIcon, 
  Activity, 
  AlertTriangle,
  Sliders,
  CheckSquare,
  Square
} from 'lucide-react';
import { LiquidCard } from '@/components/ui/LiquidCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { NORTHEAST_STATES } from '@shared/northeast-data';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const TerrainHero3D = dynamic(() => import('@/components/3d/TerrainHero3D'), {
  ssr: false,
  loading: () => <div className="h-full w-full liquid-glass-card flex items-center justify-center text-xs font-semibold">Loading 3D Terrain...</div>
});

const DisasterMapInteractive = dynamic(() => import('@/components/map/DisasterMapInteractive'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full min-h-[580px] liquid-glass-card flex items-center justify-center text-xs font-semibold text-charcoal">
      Loading Tactical Geospatial Map...
    </div>
  )
});

export default function DisasterMapPage() {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [selectedState, setSelectedState] = useState<string>('All States');
  
  // Layer toggles
  const [layers, setLayers] = useState({
    shelters: true,
    riverGauges: true,
    alerts: true,
  });

  const [shelters, setShelters] = useState<any[]>([]);
  const [riverGauges, setRiverGauges] = useState<any[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMapData() {
      try {
        const [sheltersRes, provRes] = await Promise.all([
          fetch('/api/shelters'),
          fetch('/api/providers/status'),
        ]);

        const sheltersData = sheltersRes.ok ? await sheltersRes.json() : { data: [] };
        const provData = provRes.ok ? await provRes.json() : { data: { riverGauges: [] } };

        setShelters(sheltersData.data || []);
        setRiverGauges(provData.data?.riverGauges || []);
      } catch (err) {
        console.error('Failed to load map points', err);
      } finally {
        setLoading(false);
      }
    }
    loadMapData();
  }, []);

  const toggleLayer = (layerKey: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  let markers: Array<{ id: string; type: string; title: string; subtitle: string; state: string; lat: number; lng: number; details: any }> = [];

  if (layers.shelters) {
    shelters.forEach(s => {
      markers.push({
        id: s.id,
        type: 'SHELTER',
        title: s.name,
        subtitle: `Capacity: ${s.totalCapacity} | Occupancy: ${s.currentOccupancy}`,
        state: s.state,
        lat: s.latitude,
        lng: s.longitude,
        details: s
      });
    });
  }

  if (layers.riverGauges) {
    riverGauges.forEach(g => {
      markers.push({
        id: g.id,
        type: 'RIVER_GAUGE',
        title: `${g.riverName} - ${g.stationName}`,
        subtitle: `Danger Level: ${g.dangerLevelMeters}m | Trend: ${g.trend}`,
        state: g.state,
        lat: g.latitude,
        lng: g.longitude,
        details: g
      });
    });
  }

  if (selectedState !== 'All States') {
    markers = markers.filter(m => m.state.toLowerCase() === selectedState.toLowerCase());
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-emergency" />
            <span>{t('map.title', 'Northeast Geospatial Disaster Intelligence Map')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            {t('map.desc', 'Verified postGIS coordinate layers for Brahmaputra & Barak river basins, shelters, and hazard boundaries.')}
          </p>
        </div>

        {/* 2D / 3D Mode Toggle */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-full border border-sky-200 shadow-xs self-start md:self-auto">
          <button
            onClick={() => setViewMode('2D')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              viewMode === '2D' ? 'bg-charcoal text-white shadow-xs' : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            {t('map.mode2d', '2D Tactical Map')}
          </button>
          <button
            onClick={() => setViewMode('3D')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              viewMode === '3D' ? 'bg-emergency text-white shadow-emergency-glow' : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            {t('map.mode3d', '3D Terrain Elevation')}
          </button>
        </div>
      </div>

      {/* Main Map & Filter Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Filter & Layer Sidebar */}
        <div className="space-y-4">
          
          <LiquidCard className="p-5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-charcoal mb-3 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emergency" />
              <span>{t('map.geoFilter', 'Geographic Filter')}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="All States">{t('map.allStates', 'All 8 Northeast States')}</option>
                  {NORTHEAST_STATES.map((st) => (
                    <option key={st.code} value={st.name}>
                      {st.name} ({st.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </LiquidCard>

          {/* Layer Toggles */}
          <LiquidCard className="p-5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-charcoal mb-3 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emergency" />
              <span>{t('map.dataLayers', 'Verified Data Layers')}</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <button
                onClick={() => toggleLayer('shelters')}
                className="w-full flex items-center justify-between py-1 text-left hover:text-emergency"
              >
                <span className="flex items-center gap-2">
                  <HomeIcon className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-charcoal">{t('map.sheltersLayer', 'Designated Shelters')}</span>
                </span>
                {layers.shelters ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-300" />}
              </button>

              <button
                onClick={() => toggleLayer('riverGauges')}
                className="w-full flex items-center justify-between py-1 text-left hover:text-emergency"
              >
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-600" />
                  <span className="font-semibold text-charcoal">{t('map.riverGaugesLayer', 'River Water Gauges')}</span>
                </span>
                {layers.riverGauges ? <CheckSquare className="w-4 h-4 text-sky-600" /> : <Square className="w-4 h-4 text-slate-300" />}
              </button>

              <button
                onClick={() => toggleLayer('alerts')}
                className="w-full flex items-center justify-between py-1 text-left hover:text-emergency"
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-charcoal">{t('map.alertsLayer', 'Official Alerts')}</span>
                </span>
                {layers.alerts ? <CheckSquare className="w-4 h-4 text-amber-600" /> : <Square className="w-4 h-4 text-slate-300" />}
              </button>
            </div>
          </LiquidCard>

          {/* Active Marker Inspector */}
          {selectedMarker && (
            <LiquidCard className="p-5 border-l-4 border-l-emergency animate-in fade-in">
              <div className="flex items-center justify-between mb-2">
                <StatusBadge status={selectedMarker.type} size="sm" />
                <button 
                  onClick={() => setSelectedMarker(null)}
                  className="text-xs text-charcoal-muted hover:text-charcoal"
                >
                  ✕
                </button>
              </div>
              <h4 className="font-bold text-charcoal text-sm">{selectedMarker.title}</h4>
              <p className="text-xs text-charcoal-muted mt-1">{selectedMarker.subtitle}</p>
              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-charcoal-muted flex justify-between">
                <span>Lat: {selectedMarker.lat.toFixed(4)}</span>
                <span>Lng: {selectedMarker.lng.toFixed(4)}</span>
              </div>
            </LiquidCard>
          )}

        </div>

        {/* Right Map Canvas Area */}
        <div className="lg:col-span-3 min-h-[580px] rounded-3xl liquid-glass-card border border-white/80 overflow-hidden relative flex flex-col">
          {viewMode === '3D' ? (
            <div className="w-full h-full min-h-[580px]">
              <TerrainHero3D />
            </div>
          ) : (
            <DisasterMapInteractive
              markers={markers}
              selectedState={selectedState}
              selectedMarkerId={selectedMarker?.id}
              onSelectMarker={(m) => setSelectedMarker(m)}
            />
          )}
        </div>

      </div>

    </div>
  );
}
