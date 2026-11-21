'use client';

import React from 'react';
import { ShieldAlert, Compass } from 'lucide-react';

interface SceneFallbackProps {
  title?: string;
  subtitle?: string;
  interactiveHint?: string;
}

export default function SceneFallback({
  title = 'Northeast Regional Geographic Elevation',
  subtitle = 'Assam • Arunachal • Meghalaya • Manipur • Mizoram • Nagaland • Tripura • Sikkim',
  interactiveHint = 'Interactive regional safety grid active'
}: SceneFallbackProps) {
  return (
    <div className="relative w-full h-[460px] md:h-[540px] rounded-3xl overflow-hidden liquid-glass-card flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-br from-white/90 via-slate-50/70 to-red-50/20 border border-white/80">
      {/* Background stylized grid pattern */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#20232A 1px, transparent 1px), radial-gradient(#E94B55 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0, 16px 16px'
        }}
      />

      {/* Top Header info */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-sm text-xs font-medium text-charcoal">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Geospatial Radar Mode</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-charcoal-muted font-medium bg-white/60 px-3 py-1.5 rounded-full border border-slate-100">
          <Compass className="w-3.5 h-3.5 text-emergency" />
          <span>8 Northeast State Sectors</span>
        </div>
      </div>

      {/* Central Visual representation */}
      <div className="relative z-10 my-auto text-center py-6">
        <div className="relative inline-flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 rounded-full mb-4">
          <div className="absolute inset-0 rounded-full bg-emergency/10 animate-ping opacity-30" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-emergency/20 via-white/80 to-emergency/5 border border-emergency/30 backdrop-blur-sm" />
          <div className="relative z-10 p-4 rounded-2xl bg-white shadow-glass-md border border-white/90 text-emergency">
            <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-charcoal tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-charcoal-muted mt-1.5 max-w-lg mx-auto">{subtitle}</p>
      </div>

      {/* Bottom State Pill Grid */}
      <div className="relative z-10 grid grid-cols-4 sm:grid-cols-8 gap-2 pt-4 border-t border-slate-200/50">
        {[
          { code: 'AS', name: 'Assam' },
          { code: 'AR', name: 'Arunachal' },
          { code: 'ML', name: 'Meghalaya' },
          { code: 'MN', name: 'Manipur' },
          { code: 'MZ', name: 'Mizoram' },
          { code: 'NL', name: 'Nagaland' },
          { code: 'TR', name: 'Tripura' },
          { code: 'SK', name: 'Sikkim' },
        ].map((st) => (
          <div key={st.code} className="text-center px-2 py-1.5 rounded-xl bg-white/80 border border-slate-200/60 shadow-xs">
            <span className="block text-[10px] font-bold text-charcoal">{st.code}</span>
            <span className="block text-[9px] text-charcoal-muted truncate">{st.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
