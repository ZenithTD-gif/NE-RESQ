import React from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  MapPin, 
  PhoneCall, 
  ExternalLink, 
  Layers, 
  HeartHandshake, 
  Cpu, 
  Compass,
  CheckCircle2
} from 'lucide-react';
import { LiquidCard } from '@/components/ui/LiquidCard';
import { NORTHEAST_STATES, OFFICIAL_EMERGENCY_HELPLINES } from '@shared/northeast-data';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emergency/10 border border-emergency/20 text-xs font-bold text-emergency">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>ABOUT NE-RESQ PLATFORM</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-charcoal tracking-tight">
          One Region. One Network. <br />
          <span className="text-emergency">One Mission — Saving Lives.</span>
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
          NE-RESQ is an advanced emergency response, disaster intelligence, and public safety management platform engineered specifically for the unique geographical and ecological vulnerabilities of all eight Northeast Indian states.
        </p>
      </div>

      {/* Core Architectural Tenets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LiquidCard className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-emergency flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-charcoal text-base">Zero-Mock Integrity</h3>
          <p className="text-xs text-charcoal-muted leading-relaxed">
            No synthetic alerts or simulated live data. Integrations with IMD, CWC, and NDMA are either legitimately connected or explicitly marked as requiring configuration.
          </p>
        </LiquidCard>

        <LiquidCard className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-charcoal text-base">Geospatial Intelligence</h3>
          <p className="text-xs text-charcoal-muted leading-relaxed">
            Real PostGIS coordinates for all 124 Northeast districts, official CWC river gauge thresholds on Brahmaputra & Barak basins, and verified relief shelter locations.
          </p>
        </LiquidCard>

        <LiquidCard className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-charcoal text-base">Offline-First Resilience</h3>
          <p className="text-xs text-charcoal-muted leading-relaxed">
            PWA service workers ensure emergency safety instructions and offline SOS submissions persist locally on device, syncing automatically once cellular signals restore.
          </p>
        </LiquidCard>
      </div>

      {/* 8 States Vulnerability Profiles */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal tracking-tight">
            Northeast India Geographic Coverage (8 States)
          </h2>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Key disaster profiles, designated SEOC helplines, and headquarters
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {NORTHEAST_STATES.map((st) => (
            <LiquidCard key={st.code} className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-charcoal">
                  {st.code}
                </span>
                <span className="text-[10px] text-charcoal-muted font-bold">
                  {st.districtsCount} Districts
                </span>
              </div>
              <h4 className="font-extrabold text-charcoal text-base">{st.name}</h4>
              <p className="text-xs text-charcoal-muted">Capital: {st.capital}</p>
              <div className="pt-2 border-t border-slate-100 text-xs">
                <span className="text-[10px] text-charcoal-muted uppercase block">SEOC Helpline</span>
                <span className="font-bold text-emergency">{st.eocHelpline}</span>
              </div>
            </LiquidCard>
          ))}
        </div>
      </section>

      {/* Official Emergency Contact Directory */}
      <section className="p-6 sm:p-8 rounded-3xl liquid-glass-card border border-white/80 space-y-4">
        <h3 className="font-bold text-base text-charcoal flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-emergency" />
          <span>Verified Government Emergency Directory</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {OFFICIAL_EMERGENCY_HELPLINES.map((h, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-charcoal block">{h.agency}</span>
                <span className="text-[10px] text-charcoal-muted">{h.coverage}</span>
              </div>
              <a href={`tel:${h.number.split('/')[0].trim()}`} className="font-mono font-bold text-emergency hover:underline shrink-0">
                {h.number}
              </a>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
