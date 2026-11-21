'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  MapPin, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  Activity, 
  AlertTriangle,
  ArrowRight,
  LifeBuoy
} from 'lucide-react';
import { LiquidCard } from '@/components/ui/LiquidCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SOSRequest } from '@app-types';

export default function RescueTeamPortal() {
  const [missions, setMissions] = useState<SOSRequest[]>([]);
  const [teamStatus, setTeamStatus] = useState<'AVAILABLE' | 'ON_MISSION'>('AVAILABLE');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMissions() {
      try {
        const res = await fetch('/api/sos');
        if (res.ok) {
          const data = await res.json();
          // Filter requests that are assigned, accepted, or in progress
          const active = (data.data || []).filter((r: SOSRequest) => 
            ['ASSIGNED', 'ACCEPTED_BY_TEAM', 'RESCUE_IN_PROGRESS'].includes(r.status)
          );
          setMissions(active);
        }
      } catch (err) {
        console.error('Failed to load rescue missions', err);
      } finally {
        setLoading(false);
      }
    }
    loadMissions();
  }, []);

  const handleUpdateMission = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/sos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          remarks: `Rescue unit transitioned operation to ${newStatus}`,
          updatedBy: 'NDRF 1st Bn Team Leader'
        })
      });

      if (res.ok) {
        // Refresh list
        setMissions(prev => prev.map(m => m.id === id ? { ...m, status: newStatus as any } : m));
      }
    } catch (err) {
      console.error('Failed to update mission', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
            <span>FIELD OPERATIONS & SEARCH/RESCUE TEAMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight">
            Rescue Team Tactical Terminal
          </h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Unit: NDRF 1st Bn (Patgaon, Guwahati) • Team Alpha • Boats: 4 Inflatable Motor Boats (IRBs)
          </p>
        </div>

        {/* Readiness Toggle */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-slate-200 text-xs font-bold">
          <span className="text-charcoal-muted pl-2">Unit Status:</span>
          <button
            onClick={() => setTeamStatus('AVAILABLE')}
            className={`px-3 py-1 rounded-full transition-all ${
              teamStatus === 'AVAILABLE' ? 'bg-emerald-500 text-white shadow-xs' : 'text-charcoal hover:bg-slate-100'
            }`}
          >
            AVAILABLE
          </button>
          <button
            onClick={() => setTeamStatus('ON_MISSION')}
            className={`px-3 py-1 rounded-full transition-all ${
              teamStatus === 'ON_MISSION' ? 'bg-emergency text-white shadow-emergency-glow' : 'text-charcoal hover:bg-slate-100'
            }`}
          >
            DEPLOYED / ON MISSION
          </button>
        </div>
      </div>

      {/* Active Missions Grid */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
          <Activity className="w-5 h-5 text-emergency" />
          <span>Assigned Emergency Missions ({missions.length})</span>
        </h2>

        {missions.length === 0 ? (
          <EmptyState
            title="No Active Missions Assigned"
            description="Your rescue unit is currently on tactical standby at base headquarters. Incoming dispatches from DEOC will ring immediately."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {missions.map((m) => (
              <LiquidCard key={m.id} className="p-6 space-y-4 border-l-4 border-l-emergency">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-charcoal">{m.trackingId}</span>
                  <StatusBadge status={m.status} />
                </div>

                <div>
                  <h3 className="font-extrabold text-charcoal text-base">{m.category.replace(/_/g, ' ')}</h3>
                  <p className="text-xs text-charcoal-muted mt-1 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emergency shrink-0 mt-0.5" />
                    <span>{m.locationAddress} ({m.latitude.toFixed(5)}, {m.longitude.toFixed(5)})</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-charcoal-muted uppercase block">Stranded Citizen</span>
                    <span className="font-bold text-charcoal">{m.citizenName}</span>
                  </div>
                  <a href={`tel:${m.contactPhone}`} className="text-emergency font-mono font-bold hover:underline">
                    {m.contactPhone}
                  </a>
                </div>

                {/* Tactical Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
                  {m.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleUpdateMission(m.id, 'ACCEPTED_BY_TEAM')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                    >
                      Accept Mission
                    </button>
                  )}
                  {m.status === 'ACCEPTED_BY_TEAM' && (
                    <button
                      onClick={() => handleUpdateMission(m.id, 'RESCUE_IN_PROGRESS')}
                      className="px-4 py-2 rounded-xl liquid-glass-emergency-btn text-white font-bold"
                    >
                      Depart On-Site (In Progress)
                    </button>
                  )}
                  {m.status === 'RESCUE_IN_PROGRESS' && (
                    <button
                      onClick={() => handleUpdateMission(m.id, 'ASSISTANCE_PROVIDED')}
                      className="px-4 py-2 rounded-xl bg-charcoal text-white font-bold"
                    >
                      Complete & Mark Safe
                    </button>
                  )}
                </div>
              </LiquidCard>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
