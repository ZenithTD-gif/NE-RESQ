'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  MapPin, 
  Camera, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Clock,
  Send
} from 'lucide-react';
import { LiquidCard } from '@/components/ui/LiquidCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { NORTHEAST_STATES } from '@shared/northeast-data';
import { CommunityReport } from '@app-types';

const REPORT_CATEGORIES = [
  { id: 'FLOODING', label: 'Inundation / Rising Floodwater' },
  { id: 'LANDSLIDE', label: 'Landslide / Mud Debris on Road' },
  { id: 'DAMAGED_ROAD', label: 'Road Crack / Embankment Erosion' },
  { id: 'BRIDGE_DAMAGE', label: 'Bridge Damage / Culvert Failure' },
  { id: 'BLOCKED_ROAD', label: 'Fallen Trees / High Tension Wire Blockage' },
  { id: 'STRANDED_RESIDENTS', label: 'Stranded Community in Need of Supplies' },
  { id: 'FOOD_WATER_SHORTAGE', label: 'Drinking Water Contamination' },
  { id: 'OTHER_EMERGENCY', label: 'Other Infrastructure Hazard' }
];

export default function CommunityReportsPage() {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [category, setCategory] = useState('FLOODING');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [state, setState] = useState('Assam');
  const [district, setDistrict] = useState('Kamrup Metropolitan');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successCode, setSuccessCode] = useState('');

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch('/api/reports');
        if (res.ok) {
          const data = await res.json();
          setReports(data.data || []);
        }
      } catch (err) {
        console.error('Failed to load reports', err);
      }
    }
    loadReports();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          reporterName: isAnonymous ? undefined : reporterName,
          reporterPhone: isAnonymous ? undefined : reporterPhone,
          isAnonymous,
          state,
          district,
          locationDescription: description.trim(),
          latitude: 26.1445,
          longitude: 91.7362,
          mediaUrl: mediaUrl || undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessCode(data.data.reportCode);
        setReports(prev => [data.data, ...prev]);
        setDescription('');
        setMediaUrl('');
      }
    } catch (err) {
      console.error('Failed to submit report', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-charcoal mb-2">
          <FileText className="w-3.5 h-3.5 text-emergency" />
          <span>VERIFIED CROWDSOURCED DISASTER INTELLIGENCE</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-charcoal tracking-tight">
          Community Incident Reporting
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted max-w-2xl mt-1">
          Submit observed local flooding, road breaches, and landslides. Every report undergoes automated deduplication and human verification by DEOC analysts before being marked verified.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Submission Form */}
        <div className="lg:col-span-1 space-y-4">
          <LiquidCard className="p-6">
            <h3 className="font-bold text-sm text-charcoal mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4 text-emergency" />
              <span>Submit Incident Report</span>
            </h3>

            {successCode && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 mb-4">
                <strong>Report Registered!</strong> Tracking code: <span className="font-mono font-bold">{successCode}</span>. Under review by district control room.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-charcoal block mb-1">Hazard Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full font-semibold p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {REPORT_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-charcoal block mb-1">State & District *</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full font-semibold p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {NORTHEAST_STATES.map((st) => (
                    <option key={st.code} value={st.name}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-charcoal block mb-1">Incident Description & Location Details *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe location, depth, damages, or landmarks..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full font-semibold p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-emergency"
                />
              </div>

              <div>
                <label className="font-bold text-charcoal block mb-1">Photo / Evidence URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://... photo evidence link"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full font-semibold p-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-charcoal">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-emergency"
                  />
                  <span>Submit as Anonymous Citizen</span>
                </label>
              </div>

              {!isAnonymous && (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full font-semibold p-2 rounded-xl border border-slate-200 bg-white"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    className="w-full font-semibold p-2 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl liquid-glass-emergency-btn text-white font-bold flex items-center justify-center gap-2 shadow-emergency-glow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Registering...' : 'Submit Incident Report'}</span>
              </button>
            </form>
          </LiquidCard>
        </div>

        {/* Right Col: Reports Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-charcoal">
              Recent Verified & Moderated Reports ({reports.length})
            </h3>
            <span className="text-xs text-charcoal-muted">
              Live Crowd Intelligence Pipeline
            </span>
          </div>

          {reports.length === 0 ? (
            <EmptyState
              title="No Community Incidents Reported"
              description="Citizens have not reported any active road or flood breaches for this period. Use the form on the left to submit ground observations."
            />
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <LiquidCard key={rep.id} className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-charcoal-muted">
                      {rep.state} • {rep.district}
                    </span>
                    <StatusBadge status={rep.status} />
                  </div>

                  <div>
                    <span className="text-xs font-bold text-emergency block mb-1">
                      {rep.category.replace(/_/g, ' ')}
                    </span>
                    <p className="text-xs text-charcoal leading-relaxed">
                      {rep.locationDescription}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-charcoal-muted">
                    <span className="font-mono">Code: {rep.reportCode}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(rep.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </LiquidCard>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
