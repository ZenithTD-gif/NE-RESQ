'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  AlertTriangle, 
  FileText, 
  Radio, 
  CheckCircle2, 
  MapPin, 
  Plus, 
  Send
} from 'lucide-react';
import { LiquidCard } from '@/components/ui/LiquidCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { NORTHEAST_STATES, NORTHEAST_DISTRICTS } from '@shared/northeast-data';

export default function DistrictPortal() {
  const [district, setDistrict] = useState('Kamrup Metropolitan');
  const [alertTitle, setAlertTitle] = useState('');
  const [severity, setSeverity] = useState('WARNING');
  const [actionNotice, setActionNotice] = useState('');
  const [submittingAlert, setSubmittingAlert] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const handleBroadcastAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle.trim() || !actionNotice.trim()) return;

    setSubmittingAlert(true);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: alertTitle.trim(),
          category: 'HEAVY_RAINFALL',
          severity,
          state: 'Assam',
          district,
          affectedArea: `${district} Sector`,
          issuingAuthority: `DDMA ${district} Control Room`,
          recommendedAction: actionNotice.trim()
        })
      });

      if (res.ok) {
        setBroadcastSuccess(true);
        setAlertTitle('');
        setActionNotice('');
        setTimeout(() => setBroadcastSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to broadcast alert', err);
    } finally {
      setSubmittingAlert(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-charcoal mb-1">
          <Building2 className="w-3.5 h-3.5 text-emergency" />
          <span>DISTRICT DISASTER MANAGEMENT AUTHORITY (DDMA)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight">
          District Emergency Administrator Terminal
        </h1>
        <p className="text-xs text-charcoal-muted mt-0.5">
          Issue verified district flood advisories, review community reports, and inspect local relief capacities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Broadcast Advisory */}
        <div className="lg:col-span-2 space-y-6">
          <LiquidCard className="p-6 sm:p-8 space-y-4">
            <h3 className="font-bold text-sm text-charcoal flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-emergency" />
              <span>Broadcast Official District Alert</span>
            </h3>

            {broadcastSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Alert broadcast successfully published across NE-RESQ live public channel.</span>
              </div>
            )}

            <form onSubmit={handleBroadcastAlert} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-charcoal block mb-1">District Jurisdiction *</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full font-semibold p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    {NORTHEAST_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.stateName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-charcoal block mb-1">Severity Classification *</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full font-semibold p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="ADVISORY">Advisory (Low / Precautionary)</option>
                    <option value="WATCH">Watch (Moderate / Emerging)</option>
                    <option value="WARNING">Warning (High Surge)</option>
                    <option value="SEVERE_WARNING">Severe Warning (Very High)</option>
                    <option value="EMERGENCY">Emergency (Life-Threatening Surge)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-charcoal block mb-1">Official Alert Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inundation Warning for Low-Lying Wards along Brahmaputra Embankment"
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  className="w-full font-semibold p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-emergency"
                />
              </div>

              <div>
                <label className="font-bold text-charcoal block mb-1">Recommended Citizen Action Protocol *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Mandatory evacuation steps, safe high grounds, emergency helpline..."
                  value={actionNotice}
                  onChange={(e) => setActionNotice(e.target.value)}
                  className="w-full font-semibold p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-emergency leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submittingAlert}
                className="py-3 px-6 rounded-xl liquid-glass-emergency-btn text-white font-bold flex items-center justify-center gap-2 shadow-emergency-glow"
              >
                <Send className="w-4 h-4" />
                <span>{submittingAlert ? 'Broadcasting Notice...' : 'Publish Official Advisory'}</span>
              </button>
            </form>
          </LiquidCard>
        </div>

        {/* Right Col: District Statistics */}
        <div className="space-y-6">
          <LiquidCard className="p-6 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal">
              Jurisdiction Details: {district}
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-charcoal-muted">DEOC Helpline:</span>
                <span className="font-bold text-emergency">1077</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-charcoal-muted">State EOC:</span>
                <span className="font-bold text-charcoal">1070 (Toll Free)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-charcoal-muted">NDRF Deployment:</span>
                <span className="font-bold text-emerald-700">1st Bn Sector 4</span>
              </div>
            </div>
          </LiquidCard>
        </div>

      </div>

    </div>
  );
}
