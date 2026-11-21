'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Radio, 
  MapPin, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Users, 
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Phone
} from 'lucide-react';
import { LiquidCard } from '@/components/ui/LiquidCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SOSRequest } from '@app-types';

export default function TrackSOSPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [sos, setSos] = useState<SOSRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchRecord = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`/api/sos/${id}`);
      if (!res.ok) {
        throw new Error('SOS record not found.');
      }
      const data = await res.json();
      setSos(data.data);
    } catch (err: any) {
      setError(err.message || 'Unable to locate emergency record.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecord();
    const interval = setInterval(fetchRecord, 5000); // 5s polling for state transitions
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-emergency border-t-transparent animate-spin mx-auto" />
        <p className="text-sm font-semibold text-charcoal">Fetching regional dispatch status...</p>
      </div>
    );
  }

  if (error || !sos) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-emergency flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-charcoal">Tracking Record Not Found</h2>
        <p className="text-xs text-charcoal-muted">
          No active emergency request matches ID &apos;{id}&apos;. If you submitted offline, your device will synchronize automatically once reconnected.
        </p>
        <Link
          href="/sos"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-charcoal text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to SOS Portal</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header & Tracking ID */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <Link
            href="/sos"
            className="inline-flex items-center gap-1 text-xs font-semibold text-charcoal-muted hover:text-charcoal mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Emergency Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight">
              Tracking: <span className="text-emergency font-mono">{sos.trackingId}</span>
            </h1>
            <button
              onClick={fetchRecord}
              className={`p-1.5 rounded-full hover:bg-slate-100 text-charcoal-muted ${refreshing ? 'animate-spin' : ''}`}
              title="Refresh status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Registered: {new Date(sos.createdAt).toLocaleString()} | Category: {sos.category.replace(/_/g, ' ')}
          </p>
        </div>

        <div>
          <StatusBadge status={sos.status} size="md" />
        </div>
      </div>

      {/* Main Status & Assigned Team Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Details & Timeline */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Incident Summary Card */}
          <LiquidCard className="p-6 space-y-4">
            <h3 className="font-bold text-sm text-charcoal flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emergency" />
              <span>Location & Citizen Details</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-charcoal-muted uppercase block">Address</span>
                <span className="font-semibold text-charcoal">{sos.locationAddress}</span>
                <span className="block text-charcoal-muted mt-0.5">
                  {sos.district}, {sos.state} (GPS: {sos.latitude.toFixed(5)}, {sos.longitude.toFixed(5)})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-charcoal-muted uppercase block">Citizen Name</span>
                  <span className="font-semibold text-charcoal">{sos.citizenName}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-charcoal-muted uppercase block">Contact Phone</span>
                  <span className="font-semibold text-charcoal font-mono">{sos.contactPhone}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-charcoal-muted">Persons Affected / Stranded:</span>
                <span className="font-bold text-charcoal text-sm">{sos.affectedCount} People</span>
              </div>

              {sos.hasMedicalEmergency && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800">
                  <span className="font-bold block mb-0.5">Medical Trauma Flagged:</span>
                  <span>{sos.medicalDetails || 'Trauma care team notified.'}</span>
                </div>
              )}
            </div>
          </LiquidCard>

          {/* Append-only Status Timeline History */}
          <LiquidCard className="p-6 space-y-4">
            <h3 className="font-bold text-sm text-charcoal flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>Dispatch Verification Timeline</span>
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {sos.statusHistory.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emergency border-2 border-white ring-2 ring-emergency/30" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-charcoal">{step.status.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-charcoal-muted">
                      {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {step.remarks && (
                    <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                      {step.remarks}
                    </p>
                  )}
                  {step.updatedBy && (
                    <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                      Actor: {step.updatedBy}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </LiquidCard>

        </div>

        {/* Right Col: Assigned Rescue Team & Direct Helplines */}
        <div className="space-y-6">
          
          {/* Assigned Team Card */}
          <LiquidCard className="p-6 border-l-4 border-l-emerald-500 space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Assigned Rescue Team</span>
            </div>

            {sos.assignedTeam ? (
              <div className="space-y-3 pt-2">
                <div>
                  <h4 className="font-extrabold text-charcoal text-base">{sos.assignedTeam.name}</h4>
                  <span className="text-xs text-charcoal-muted block">{sos.assignedTeam.agency}</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">Commander Direct Contact</span>
                  <a href={`tel:${sos.assignedTeam.leaderPhone}`} className="font-bold text-sm text-emerald-800 hover:underline font-mono flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{sos.assignedTeam.leaderPhone}</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center space-y-2">
                <span className="text-xs text-charcoal-muted block">
                  Awaiting operational assignment by District Control Room dispatchers.
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Queue Priority: {sos.priorityLevel}
                </span>
              </div>
            )}
          </LiquidCard>

          {/* Emergency Backup Helplines */}
          <LiquidCard className="p-6 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal flex items-center gap-2">
              <PhoneCall className="w-3.5 h-3.5 text-emergency" />
              <span>Immediate Voice Escalation</span>
            </h4>
            <p className="text-xs text-charcoal-muted">
              If life conditions worsen rapidly, dial these numbers directly:
            </p>
            <div className="space-y-2 pt-2 text-xs">
              <a href="tel:112" className="flex items-center justify-between p-2.5 rounded-xl bg-red-50 text-red-900 font-bold hover:bg-red-100">
                <span>National Emergency</span>
                <span className="font-mono text-emergency text-sm">112</span>
              </a>
              <a href="tel:1077" className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-charcoal font-bold hover:bg-slate-100">
                <span>District Disaster Cell (DEOC)</span>
                <span className="font-mono text-sm">1077</span>
              </a>
            </div>
          </LiquidCard>

        </div>

      </div>

    </div>
  );
}
