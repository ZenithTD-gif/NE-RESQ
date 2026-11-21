'use client';

import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Map, Phone, Globe, ShieldCheck } from 'lucide-react';
import { NORTHEAST_STATES } from '@shared/northeast-data';

export default function StatesPage() {
  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="State Jurisdiction Management" subtitle="All 8 Northeast Indian States: SEOC Helplines, Capital Command Desks & SDMA Portals" />
      <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {NORTHEAST_STATES.map((state) => (
            <div key={state.code} className="admin-glass-card admin-glass-card-hover p-5 space-y-3 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center font-mono font-black text-xs text-cyan-400">
                  {state.code}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                  ACTIVE SDMA
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{state.name}</h3>
                <p className="text-xs text-slate-400">Capital: {state.capital}</p>
              </div>
              <div className="pt-2 border-t border-slate-800 space-y-1 text-xs">
                <div className="text-slate-400">SEOC Helpline: <strong className="text-cyan-400 font-mono">{state.eocHelpline}</strong></div>
                <a href={state.sdmaWebsite} target="_blank" rel="noopener noreferrer" className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Visit SDMA Portal
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
