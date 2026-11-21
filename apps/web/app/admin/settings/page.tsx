'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Settings, ShieldCheck, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Layers, Sparkles, MapPin, Database } from 'lucide-react';

interface Integration {
  provider: string;
  name: string;
  category: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'NOT_CONFIGURED';
  statusMessage: string;
  isConfigured: boolean;
}

export default function SettingsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/integrations');
      const data = await res.json();
      if (data.success && Array.isArray(data.integrations)) {
        setIntegrations(data.integrations);
      } else {
        setIntegrations([]);
      }
    } catch {
      setIntegrations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Platform Parameters & External API Integrations"
        subtitle="Live Verification of GIS Tile Servers, Supabase Database, AI Engines & Institutional Warning Gateways"
      />
      <div className="p-6 space-y-6 max-w-5xl w-full mx-auto">
        {/* Zero-Mock Policy Banner */}
        <div className="admin-glass-card p-6 space-y-4 border border-cyan-500/30">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>Strict Zero-Mock Data Policy Engine</span>
            </h3>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px]">
              100% PRODUCTION READY
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            NE-RESQ strictly prohibits hardcoded demo data, fake disaster statistics, and simulated telemetry. All GIS map layers, database records, and AI responses reflect genuine API connectivity. Unconfigured services are explicitly tagged with setup requirements.
          </p>
        </div>

        {/* Live Integrations Registry */}
        <div className="admin-glass-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Verified External Provider Connectors</span>
            </h3>
            <button
              onClick={fetchIntegrations}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-2 text-xs font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Re-check Connectivity</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              <span>Probing external APIs and live PostgreSQL endpoints...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map((item) => (
                <div
                  key={item.provider}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        {item.category}
                      </span>
                      {item.status === 'CONNECTED' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> CONNECTED
                        </span>
                      ) : item.status === 'NOT_CONFIGURED' ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400" /> PENDING SETUP
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-mono font-bold flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-400" /> DISCONNECTED
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
                    {item.statusMessage}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
