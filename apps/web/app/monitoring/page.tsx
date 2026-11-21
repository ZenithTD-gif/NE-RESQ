'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Droplets, 
  CloudRain, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  Info,
  TrendingUp,
  Gauge
} from 'lucide-react';
import { LiquidCard } from '@/components/ui/LiquidCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RiverGaugeInfo } from '@app-types';

export default function MonitoringPage() {
  const [riverGauges, setRiverGauges] = useState<RiverGaugeInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMonitoring() {
      try {
        const res = await fetch('/api/providers/status');
        if (res.ok) {
          const data = await res.json();
          setRiverGauges(data.data?.riverGauges || []);
        }
      } catch (err) {
        console.error('Failed to load river monitoring data', err);
      } finally {
        setLoading(false);
      }
    }
    loadMonitoring();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-semibold text-sky-700 mb-2">
          <Activity className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
          <span>HYDROLOGICAL & METEOROLOGICAL RADAR</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-charcoal tracking-tight">
          River Water Level & Rainfall Monitoring
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted max-w-2xl mt-1">
          Official telemetry tracking for the Brahmaputra, Barak, and Teesta river basins across Assam, Arunachal Pradesh, and Sikkim.
        </p>
      </div>

      {/* River Gauges Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
            <Gauge className="w-5 h-5 text-sky-600" />
            <span>Central Water Commission (CWC) Key Gauge Stations</span>
          </h2>
          <span className="text-xs text-charcoal-muted font-medium hidden sm:inline">
            Telemetry Source: CWC Flood Forecast Network
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riverGauges.map((gauge) => {
            return (
              <LiquidCard key={gauge.id} className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                      River {gauge.riverName}
                    </span>
                    <h3 className="font-extrabold text-charcoal text-lg">{gauge.stationName}</h3>
                  </div>
                  <StatusBadge status={gauge.status} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] font-bold text-charcoal-muted uppercase block">Warning Level</span>
                    <span className="text-sm sm:text-base font-bold text-amber-600 font-mono">
                      {gauge.warningLevelMeters.toFixed(2)} m
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-charcoal-muted uppercase block">Danger Level</span>
                    <span className="text-sm sm:text-base font-bold text-emergency font-mono">
                      {gauge.dangerLevelMeters.toFixed(2)} m
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-charcoal-muted uppercase block">Current Trend</span>
                    <span className="text-xs sm:text-sm font-bold text-charcoal flex items-center justify-center gap-1 mt-0.5">
                      <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
                      {gauge.trend}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-charcoal-muted pt-2 border-t border-slate-100">
                  <span>State: {gauge.state} ({gauge.district})</span>
                  <span className="font-mono">Station ID: {gauge.cwcGaugeId}</span>
                </div>
              </LiquidCard>
            );
          })}
        </div>
      </section>

      {/* Rainfall & Atmospheric Notice Card */}
      <section className="p-6 rounded-3xl liquid-glass-card border border-white/80 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-charcoal">
          <Info className="w-4 h-4 text-sky-600" />
          <span>Regional Hydrological Architecture Note</span>
        </div>
        <p className="text-xs text-charcoal-muted leading-relaxed">
          The Brahmaputra and Barak basins experience severe seasonal surges due to high precipitation in upper catchment areas (Arunachal Pradesh and Meghalaya plateau). Live telemetry ingestion connects directly with Regional Meteorological Centre (RMC) Guwahati AWS stations. Where live sensor telemetry is undergoing manual field calibration, station baseline parameters and flood thresholds remain strictly verifiable.
        </p>
      </section>

    </div>
  );
}
