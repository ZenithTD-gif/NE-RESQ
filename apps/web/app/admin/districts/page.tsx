'use client';

import React, { useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Building2, Search, Phone } from 'lucide-react';
import { NORTHEAST_STATES, NORTHEAST_DISTRICTS } from '@shared/northeast-data';

export default function DistrictsPage() {
  const [selectedState, setSelectedState] = useState('Assam');
  const [search, setSearch] = useState('');

  const filtered = NORTHEAST_DISTRICTS.filter(d => {
    const matchesState = d.stateName.toLowerCase() === selectedState.toLowerCase();
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.headquarters.toLowerCase().includes(search.toLowerCase());
    return matchesState && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="District Jurisdiction Management" subtitle="124 Northeast Districts: DDMA In-Charges, DEOC 1077 Helplines & Headquarters" />
      <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        <div className="admin-glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search district by name or headquarters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs font-semibold p-3 pl-9 rounded-xl border border-slate-700 bg-slate-900 text-white outline-none focus:border-cyan-400"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          </div>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="text-xs p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-200"
          >
            {NORTHEAST_STATES.map(s => <option key={s.code} value={s.name}>{s.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map((dist) => (
            <div key={dist.id} className="admin-glass-card p-4 space-y-2 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-cyan-400 font-bold">{dist.stateCode}-{dist.id}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  dist.vulnerabilityLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' :
                  dist.vulnerabilityLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {dist.vulnerabilityLevel} RISK
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">{dist.name}</h4>
              <div className="text-xs text-slate-400">HQ: {dist.headquarters}</div>
              <div className="pt-2 border-t border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-500">DEOC Helpline:</span>
                <strong className="text-cyan-400 font-mono">{dist.deocHelpline}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
