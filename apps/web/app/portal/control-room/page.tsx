'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Radio, 
  MapPin, 
  ShieldAlert, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Phone,
  Layers,
  Send,
  Database,
  ShieldCheck,
  ServerOff
} from 'lucide-react';
import { LiquidCard } from '@/components/ui/LiquidCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SOSRequest, ExternalProviderStatus } from '@app-types';

export default function ControlRoomPortal() {
  const [sosList, setSosList] = useState<SOSRequest[]>([]);
  const [selectedSOS, setSelectedSOS] = useState<SOSRequest | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [providers, setProviders] = useState<ExternalProviderStatus[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('VERIFIED');
  const [actionNotes, setActionNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    try {
      const [sosRes, teamRes, provRes] = await Promise.all([
        fetch('/api/sos'),
        fetch('/api/rescue/teams'),
        fetch('/api/providers/status')
      ]);

      const sosData = sosRes.ok ? await sosRes.json() : { data: [] };
      const teamData = teamRes.ok ? await teamRes.json() : { data: [] };
      const provData = provRes.ok ? await provRes.json() : { data: { providers: [] } };

      setSosList(sosData.data || []);
      setTeams(teamData.data || []);
      setProviders(provData.data?.providers || []);
      if (sosData.data?.length > 0 && !selectedSOS) {
        setSelectedSOS(sosData.data[0]);
      }
    } catch (err) {
      console.error('Failed to load control room data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSOS) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/sos/${selectedSOS.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusUpdate,
          remarks: actionNotes || `Control room operational update to ${statusUpdate}`,
          assignedTeamId: selectedTeamId || undefined,
          updatedBy: 'Control Room Officer (SEOC Assam)'
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedSOS(updated.data);
        setActionNotes('');
        loadData();
      }
    } catch (err) {
      console.error('Failed to update SOS status', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sky-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emergency/10 border border-emergency/20 text-xs font-bold text-emergency mb-1 shadow-xs">
            <Radio className="w-3 h-3 animate-ping" />
            <span>OPERATIONAL EMERGENCY CONTROL ROOM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight">
            Central Dispatch & Triage Operations
          </h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Real-time emergency call queue, team dispatching, and field status transitions.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/portal/rescue"
            className="px-3.5 py-1.5 rounded-full bg-white border border-sky-200 font-semibold text-charcoal hover:border-cyan transition-colors shadow-xs"
          >
            Rescue Team Portal →
          </Link>
          <Link
            href="/portal/shelter"
            className="px-3.5 py-1.5 rounded-full bg-white border border-sky-200 font-semibold text-charcoal hover:border-cyan transition-colors shadow-xs"
          >
            Shelter Portal →
          </Link>
        </div>
      </div>

      {/* Institutional Integration & Configuration Status Bar */}
      <LiquidCard className="p-4 sm:p-5 border border-sky-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-cyan shadow-xs">
              <Database className="w-5 h-5 text-cyan" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
                <span>External Feed Configuration Monitor</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  Zero-Mock Protocol
                </span>
              </h3>
              <p className="text-xs text-charcoal-muted mt-0.5">
                Official external meteorological & hydrological endpoints requiring institutional authentication.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {providers.map((p) => (
              <div
                key={p.providerName}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 ${
                  p.isConnected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
                title={p.statusMessage}
              >
                {p.isConnected ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                ) : (
                  <ServerOff className="w-3 h-3 text-amber-600" />
                )}
                <span>{p.displayName.split('(')[0].trim()}: {p.isConnected ? 'Active' : 'Unconfigured'}</span>
              </div>
            ))}
          </div>
        </div>
      </LiquidCard>

      {/* Main 2-Col Operations Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Incoming Emergency Queue */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-charcoal flex items-center gap-2">
              <Radio className="w-4 h-4 text-emergency" />
              <span>Incoming Incidents Queue ({sosList.length})</span>
            </h3>
            <button onClick={loadData} className="p-1 rounded-md text-charcoal-muted hover:text-cyan transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {sosList.length === 0 ? (
            <EmptyState
              title="Incident Queue Clear"
              description="No active emergency requests are currently awaiting triage on the regional network."
            />
          ) : (
            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {sosList.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setSelectedSOS(req)}
                  className={`p-4 rounded-2xl liquid-glass-card border cursor-pointer transition-all ${
                    selectedSOS?.id === req.id
                      ? 'border-emergency ring-2 ring-emergency/20 shadow-emergency-glow bg-white'
                      : 'border-sky-100 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-cyan">{req.trackingId}</span>
                    <StatusBadge status={req.status} size="sm" />
                  </div>
                  <h4 className="font-bold text-xs text-charcoal truncate">{req.category.replace(/_/g, ' ')}</h4>
                  <p className="text-[11px] text-charcoal-muted truncate mt-0.5">{req.locationAddress}</p>
                  <div className="flex items-center justify-between text-[10px] text-charcoal-muted mt-2 pt-2 border-t border-sky-100">
                    <span>{req.citizenName} ({req.contactPhone})</span>
                    <span>{new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Triage & Team Dispatch Panel */}
        <div className="lg:col-span-2 space-y-6">
          {selectedSOS ? (
            <LiquidCard className="p-6 sm:p-8 space-y-6 border border-sky-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-sky-100">
                <div>
                  <span className="text-[10px] font-bold text-charcoal-muted uppercase">Incident Case</span>
                  <h2 className="text-xl font-extrabold text-charcoal font-mono">{selectedSOS.trackingId}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedSOS.status} size="md" />
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedSOS.priorityLevel === 'CRITICAL_LIFE_THREATENING'
                      ? 'bg-emergency/10 text-emergency border border-emergency/30 shadow-xs'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {selectedSOS.priorityLevel.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Citizen & Location Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-white border border-sky-100">
                  <span className="text-charcoal-muted block text-[11px] mb-1">Citizen & Distress Category</span>
                  <div className="font-bold text-charcoal text-sm">{selectedSOS.citizenName}</div>
                  <div className="text-charcoal-muted mt-0.5">Phone: <span className="font-mono text-cyan font-bold">{selectedSOS.contactPhone}</span></div>
                  <div className="text-charcoal-muted mt-0.5">Category: {selectedSOS.category.replace(/_/g, ' ')}</div>
                  <div className="text-charcoal-muted mt-0.5">Affected Persons: <span className="font-bold text-charcoal">{selectedSOS.affectedCount}</span></div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-sky-100">
                  <span className="text-charcoal-muted block text-[11px] mb-1">Location Coordinates & Jurisdiction</span>
                  <div className="font-bold text-charcoal">{selectedSOS.state} • {selectedSOS.district}</div>
                  <div className="text-charcoal-muted mt-0.5 truncate">{selectedSOS.locationAddress}</div>
                  <div className="font-mono text-cyan mt-1 flex items-center gap-1 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-emergency" />
                    <span>GPS: {selectedSOS.latitude.toFixed(4)}, {selectedSOS.longitude.toFixed(4)}</span>
                  </div>
                </div>
              </div>

              {/* Trauma & Vulnerability Alerts */}
              {(selectedSOS.hasMedicalEmergency || selectedSOS.hasAccessibilityNeeds) && (
                <div className="p-3.5 rounded-xl bg-emergency/10 border border-emergency/30 text-xs space-y-1">
                  <div className="font-bold text-emergency flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>CRITICAL OPERATIONAL FLAGS:</span>
                  </div>
                  {selectedSOS.hasMedicalEmergency && (
                    <div className="text-charcoal">
                      • Medical Trauma Flagged: <span className="text-emergency font-semibold">{selectedSOS.medicalDetails || 'Immediate medical aid needed'}</span>
                    </div>
                  )}
                  {selectedSOS.hasAccessibilityNeeds && (
                    <div className="text-charcoal">
                      • Vulnerability / Mobility Needs: <span className="text-amber-700 font-semibold">{selectedSOS.accessibilityDetails || 'Elderly / infant / disabled'}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Status Update & Dispatch Form */}
              <form onSubmit={handleUpdateStatus} className="pt-4 border-t border-sky-100 space-y-4">
                <h4 className="font-bold text-sm text-charcoal">Disaster Triage Actions</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-muted mb-1">Transition Incident Status</label>
                    <select
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value)}
                      className="w-full text-xs font-semibold p-2.5 rounded-xl border border-sky-200 bg-white text-charcoal"
                    >
                      <option value="VERIFIED">VERIFIED (Valid Emergency Call)</option>
                      <option value="ASSIGNED">ASSIGNED (Dispatching Rescue Unit)</option>
                      <option value="RESCUE_IN_PROGRESS">RESCUE IN PROGRESS (Team En Route)</option>
                      <option value="ASSISTANCE_PROVIDED">ASSISTANCE PROVIDED (Relief Delivered)</option>
                      <option value="CLOSED">CLOSED (Resolved Safely)</option>
                      <option value="CANCELLED">CANCELLED (Duplicate / Invalid)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-muted mb-1">Assign Operational Rescue Unit</label>
                    <select
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                      className="w-full text-xs font-semibold p-2.5 rounded-xl border border-sky-200 bg-white text-charcoal"
                    >
                      <option value="">Unassigned / Awaiting Deployment</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.state} - {t.teamType})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-muted mb-1">Audit Log / Operational Remarks</label>
                  <textarea
                    rows={2}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Enter dispatch notes, boat ID, or field report..."
                    className="w-full text-xs p-2.5 rounded-xl border border-sky-200 bg-white text-charcoal"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-charcoal-muted">
                    Signed Authority: <span className="font-semibold text-charcoal">SEOC Regional Dispatcher</span>
                  </span>
                  <button
                    type="submit"
                    disabled={updating}
                    className="liquid-glass-cyan-btn px-5 py-2.5 rounded-full text-xs font-black text-white flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{updating ? 'Recording...' : 'Commit Status & Dispatch'}</span>
                  </button>
                </div>
              </form>

            </LiquidCard>
          ) : (
            <EmptyState
              title="No Incident Selected"
              description="Select an incident from the queue on the left to review coordinates, trauma flags, and dispatch rescue units."
            />
          )}
        </div>

      </div>

    </div>
  );
}
