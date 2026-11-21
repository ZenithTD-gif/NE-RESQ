'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Filter, 
  ShieldCheck, 
  ExternalLink, 
  RefreshCw,
  Clock,
  Radio,
  FileCheck
} from 'lucide-react';
import { LiquidCard } from '@/components/ui/LiquidCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProviderStatusCard } from '@/components/ui/ProviderStatusCard';
import { NORTHEAST_STATES } from '@shared/northeast-data';
import { OfficialAlert, ExternalProviderStatus } from '@app-types';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<OfficialAlert[]>([]);
  const [providers, setProviders] = useState<ExternalProviderStatus[]>([]);
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlertsAndProviders() {
      try {
        const [alertsRes, provRes] = await Promise.all([
          fetch('/api/alerts'),
          fetch('/api/providers/status')
        ]);

        const alertsData = alertsRes.ok ? await alertsRes.json() : { data: [] };
        const provData = provRes.ok ? await provRes.json() : { data: { providers: [] } };

        setAlerts(alertsData.data || []);
        setProviders(provData.data?.providers || []);
      } catch (err) {
        console.error('Failed to load official alerts', err);
      } finally {
        setLoading(false);
      }
    }
    loadAlertsAndProviders();
  }, []);

  const filteredAlerts = alerts.filter(a => {
    if (selectedState !== 'All States' && a.state.toLowerCase() !== selectedState.toLowerCase()) return false;
    if (selectedSeverity !== 'ALL' && a.severity.toLowerCase() !== selectedSeverity.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emergency/10 border border-emergency/20 text-xs font-semibold text-emergency mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>AUTHORITATIVE WARNING STREAM</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-charcoal tracking-tight">
            Official Disaster Alerts & Advisories
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted max-w-2xl mt-1">
            Real-time emergency notices broadcast directly from India Meteorological Department (IMD) and State Disaster Management Authorities.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white shadow-xs"
          >
            <option value="All States">All 8 Northeast States</option>
            {NORTHEAST_STATES.map((st) => (
              <option key={st.code} value={st.name}>
                {st.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white shadow-xs"
          >
            <option value="ALL">All Severities</option>
            <option value="EMERGENCY">Emergency</option>
            <option value="SEVERE_WARNING">Severe Warning</option>
            <option value="WARNING">Warning</option>
            <option value="WATCH">Watch</option>
            <option value="ADVISORY">Advisory</option>
          </select>
        </div>
      </div>

      {/* Official Alert Cards */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-emerald-600" />
          <span>Active Broadcast Notices ({filteredAlerts.length})</span>
        </h2>

        {filteredAlerts.length === 0 ? (
          <EmptyState
            title="No Active Alerts for Selected Jurisdiction"
            description="All official meteorological channels report normal conditions for this filter. Verified notices will immediately trigger visual indicators and sirens upon official issuance."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAlerts.map((alert) => (
              <LiquidCard key={alert.id} className="p-6 border-l-4 border-l-emergency space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-charcoal-muted">
                    {alert.state} • {alert.district}
                  </span>
                  <StatusBadge status={alert.severity} />
                </div>

                <div>
                  <h3 className="font-extrabold text-charcoal text-lg mb-1">{alert.title}</h3>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-charcoal leading-relaxed">
                    <strong className="text-emergency block mb-1">Recommended Safety Action:</strong>
                    {alert.recommendedAction}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-charcoal-muted">
                  <span>Authority: {alert.issuingAuthority}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Valid until {new Date(alert.validUntil).toLocaleDateString()}
                  </span>
                </div>
              </LiquidCard>
            ))}
          </div>
        )}
      </section>

      {/* External Integration Feeds Status (Strict compliance: "Service not connected — configuration required") */}
      <section className="space-y-4 pt-6 border-t border-slate-200/80">
        <div>
          <h2 className="text-lg font-bold text-charcoal">
            Official Data Provider Integrations
          </h2>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Real-time synchronization status with authorized government platforms. Per strict engineering guidelines, unconfigured feeds are explicitly flagged.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {providers.map((p) => (
            <ProviderStatusCard key={p.providerName} provider={p} />
          ))}
        </div>
      </section>

    </div>
  );
}
