'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  ShieldAlert, 
  Radio, 
  MapPin, 
  Home as HomeIcon, 
  Compass, 
  Layers, 
  AlertTriangle, 
  Activity, 
  ArrowRight,
  LifeBuoy,
  FileText,
  PhoneCall,
  CheckCircle2,
  Bell
} from 'lucide-react';
import { LiquidCard } from '@/components/ui/LiquidCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { NORTHEAST_STATES } from '@shared/northeast-data';
import { OfficialAlert } from '@app-types';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Dynamically import 3D Hero to preserve performance and avoid SSR issues
const TerrainHero3D = dynamic(() => import('@/components/3d/TerrainHero3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[460px] md:h-[540px] rounded-3xl liquid-glass-card flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-charcoal-muted">
        <div className="w-8 h-8 rounded-full border-2 border-emergency border-t-transparent animate-spin" />
        <span className="text-xs font-semibold">Initializing Northeast Regional 3D Radar...</span>
      </div>
    </div>
  )
});

export default function HomePage() {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<OfficialAlert[]>([]);
  const [stats, setStats] = useState({
    activeAlerts: 0,
    totalShelters: 0,
    activeRiverStations: 4,
    registeredSOS: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [alertsRes, sheltersRes, sosRes] = await Promise.all([
          fetch('/api/alerts'),
          fetch('/api/shelters'),
          fetch('/api/sos')
        ]);

        const alertsData = alertsRes.ok ? await alertsRes.json() : { data: [] };
        const sheltersData = sheltersRes.ok ? await sheltersRes.json() : { data: [] };
        const sosData = sosRes.ok ? await sosRes.json() : { data: [] };

        setAlerts(alertsData.data || []);
        setStats({
          activeAlerts: (alertsData.data || []).length,
          totalShelters: (sheltersData.data || []).length,
          activeRiverStations: 4,
          registeredSOS: (sosData.data || []).length
        });
      } catch (e) {
        console.error('Failed to fetch home page operational statistics', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12">
      
      {/* Hero Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-sky-200 shadow-xs text-xs font-bold text-sky-700 mb-3">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <span>{t('hero.badge', 'NORTHEAST INDIA REGIONAL SURVEILLANCE & RESCUE DISPATCH')}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-charcoal tracking-tight leading-tight">
              {t('hero.tagline1', 'One Region. One Network.')} <br />
              <span className="text-emergency">{t('hero.tagline2', 'One Mission — Saving Lives.')}</span>
            </h1>
            <p className="text-xs sm:text-base text-charcoal-muted max-w-2xl mt-2 leading-relaxed">
              {t('hero.desc', 'Integrated disaster intelligence, Brahmaputra & Barak river water monitoring, verified safe shelters, and emergency rescue management for all eight Northeast Indian states.')}
            </p>
          </div>

          {/* Quick SOS Trigger Button */}
          <div className="shrink-0 flex items-center gap-3">
            <Link
              href="/sos"
              className="liquid-glass-emergency-btn text-white font-extrabold text-sm sm:text-base px-6 py-3.5 rounded-full flex items-center gap-2 shadow-emergency-glow"
            >
              <Radio className="w-5 h-5 animate-pulse" />
              <span>{t('hero.sosButton', 'DISPATCH EMERGENCY SOS')}</span>
            </Link>
          </div>
        </div>

        {/* 3D Interactive Terrain Elevation Map Hero */}
        <TerrainHero3D />
      </section>

      {/* Real-time KPI Statistics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <LiquidCard className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-charcoal-muted uppercase">{t('kpi.activeAlerts', 'Active Alerts')}</span>
            <AlertTriangle className="w-4 h-4 text-emergency" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-charcoal">
            {loading ? '...' : stats.activeAlerts}
          </div>
          <p className="text-[11px] text-charcoal-muted mt-1">{t('kpi.alertsDesc', 'Official IMD / SDMA verified notices')}</p>
        </LiquidCard>

        <LiquidCard className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-charcoal-muted uppercase">{t('kpi.verifiedShelters', 'Verified Shelters')}</span>
            <HomeIcon className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-charcoal">
            {loading ? '...' : stats.totalShelters}
          </div>
          <p className="text-[11px] text-charcoal-muted mt-1">{t('kpi.sheltersDesc', 'Designated relief & medical camps')}</p>
        </LiquidCard>

        <LiquidCard className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-charcoal-muted uppercase">{t('kpi.riverStations', 'River Stations')}</span>
            <Activity className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-charcoal">
            {stats.activeRiverStations}
          </div>
          <p className="text-[11px] text-charcoal-muted mt-1">{t('kpi.stationsDesc', 'Brahmaputra & Barak CWC gauges')}</p>
        </LiquidCard>

        <LiquidCard className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-charcoal-muted uppercase">{t('kpi.registeredSOS', 'Registered SOS')}</span>
            <Radio className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-charcoal">
            {loading ? '...' : stats.registeredSOS}
          </div>
          <p className="text-[11px] text-charcoal-muted mt-1">{t('kpi.sosDesc', 'Tracked on regional dispatch ledger')}</p>
        </LiquidCard>
      </section>

      {/* Official Alerts Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-charcoal tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-emergency" />
              <span>{t('sec.alertsTitle', 'Official Broadcast Alerts')}</span>
            </h2>
            <p className="text-xs text-charcoal-muted mt-0.5">
              {t('sec.alertsSubtitle', 'Verified advisories from India Meteorological Department (IMD) & State Authorities')}
            </p>
          </div>
          <Link
            href="/alerts"
            className="text-xs font-bold text-emergency hover:underline flex items-center gap-1"
          >
            <span>{t('sec.viewAllAlerts', 'View All Official Alerts')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {alerts.length === 0 ? (
          <EmptyState
            title={t('empty.title', 'No Active Official Alerts Currently Broadcast')}
            description={t('empty.desc', 'All official district channels are normal. When IMD or State Disaster Management Authorities issue warnings, they will appear here with strict cryptographic verification.')}
            actionText={t('sec.viewAllAlerts', 'View External Feed Status')}
            onAction={() => window.location.href = '/alerts'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => (
              <LiquidCard key={alert.id} className="p-5 border-l-4 border-l-emergency">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-charcoal-muted">{alert.state} • {alert.district}</span>
                  <StatusBadge status={alert.severity} />
                </div>
                <h4 className="font-bold text-charcoal text-base mb-1">{alert.title}</h4>
                <p className="text-xs text-charcoal-muted mb-3 line-clamp-2">{alert.recommendedAction}</p>
                <div className="flex items-center justify-between text-[11px] text-charcoal-muted pt-2 border-t border-slate-100">
                  <span>Source: {alert.issuingAuthority}</span>
                  <span>Valid: {new Date(alert.validUntil).toLocaleDateString()}</span>
                </div>
              </LiquidCard>
            ))}
          </div>
        )}
      </section>

      {/* 8 Northeast States Emergency Grid */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal tracking-tight">
            {t('sec.statesTitle', 'Northeast State Disaster Management Network')}
          </h2>
          <p className="text-xs text-charcoal-muted mt-0.5">
            {t('sec.statesSubtitle', 'Click on any state to inspect verified district emergency hotlines and local shelter directories')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {NORTHEAST_STATES.map((st) => (
            <LiquidCard key={st.code} interactive className="p-5 group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-charcoal">
                  {st.code}
                </span>
                <span className="text-[10px] text-charcoal-muted font-medium">
                  {st.districtsCount} Districts
                </span>
              </div>
              <h3 className="font-bold text-charcoal text-base group-hover:text-emergency transition-colors">
                {st.name}
              </h3>
              <p className="text-xs text-charcoal-muted mt-0.5">Capital: {st.capital}</p>
              
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-charcoal-muted text-[11px]">EOC Helpline:</span>
                <span className="font-bold text-emergency">{st.eocHelpline.split('/')[0].trim()}</span>
              </div>
            </LiquidCard>
          ))}
        </div>
      </section>

      {/* Quick Action Portals Banner */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/shelters" className="group">
          <LiquidCard className="p-6 h-full flex flex-col justify-between hover:border-emerald-500/40">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <HomeIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-charcoal text-base mb-1">{t('sec.sheltersCardTitle', 'Find Verified Shelters')}</h3>
              <p className="text-xs text-charcoal-muted">
                {t('sec.sheltersCardDesc', 'Inspect relief camps, government facilities, capacity, and available medical stations.')}
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 mt-4 inline-flex items-center gap-1">
              {t('action.searchFacilities', 'Search Facilities →')}
            </span>
          </LiquidCard>
        </Link>

        <Link href="/evacuation" className="group">
          <LiquidCard className="p-6 h-full flex flex-col justify-between hover:border-sky-500/40">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-charcoal text-base mb-1">{t('sec.evacuationCardTitle', 'Evacuation Route Guidance')}</h3>
              <p className="text-xs text-charcoal-muted">
                {t('sec.evacuationCardDesc', 'Calculate safe routes avoiding verified flooded roads and landslide-blocked highways.')}
              </p>
            </div>
            <span className="text-xs font-bold text-sky-700 mt-4 inline-flex items-center gap-1">
              {t('action.planEvacuation', 'Plan Evacuation →')}
            </span>
          </LiquidCard>
        </Link>

        <Link href="/alerts" className="group">
          <LiquidCard className="p-6 h-full flex flex-col justify-between hover:border-rose-500/40">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-charcoal text-base mb-1">{t('sec.alertsCardTitle', 'Official Disaster Alerts')}</h3>
              <p className="text-xs text-charcoal-muted">
                {t('sec.alertsCardDesc', 'Real-time verified meteorological warnings, flash flood advisories, and landslide risk bulletins.')}
              </p>
            </div>
            <span className="text-xs font-bold text-rose-700 mt-4 inline-flex items-center gap-1">
              {t('action.viewAlerts', 'View Alerts →')}
            </span>
          </LiquidCard>
        </Link>
      </section>

    </div>
  );
}
