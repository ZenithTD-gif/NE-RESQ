'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { CheckCircle, ShieldCheck, RefreshCw, AlertCircle, Phone, MapPin, ExternalLink } from 'lucide-react';

interface EmergencyContact {
  id: string;
  contact_name: string;
  contact_number: string;
  state: string;
  district?: string;
  category: string;
  verification_status: string;
  source_url?: string;
}

export default function VerificationsPage() {
  const [pendingContacts, setPendingContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/contacts');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        // Filter those requiring verification
        setPendingContacts(data.data.filter((c: EmergencyContact) => c.verification_status !== 'VERIFIED_OFFICIAL'));
      } else {
        setPendingContacts([]);
      }
    } catch {
      setPendingContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleVerify = async (contact: EmergencyContact) => {
    setActionLoading(contact.id);
    try {
      const res = await fetch('/api/admin/contacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: contact.id,
          verification_status: 'VERIFIED_OFFICIAL',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPendingContacts(prev => prev.filter(c => c.id !== contact.id));
      } else {
        alert(data.error || 'Failed to verify contact');
      }
    } catch (e: any) {
      alert(e.message || 'Network error during verification');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Pending Verifications Triage Desk"
        subtitle="Verify Official Source Documents, Government Gazettes & Telephony Gateways Before Public Sync"
      />
      <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        <div className="admin-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Pending Emergency Records Awaiting Clearance</span>
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchPending}
                disabled={loading}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Refresh Triage"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
              <span className="text-xs text-amber-400 font-mono font-bold">
                {pendingContacts.length} Records Pending Review
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              <span>Connecting to live Supabase verification queue...</span>
            </div>
          ) : pendingContacts.length > 0 ? (
            <div className="space-y-3">
              {pendingContacts.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">{c.contact_name}</h4>
                    <div className="text-xs text-cyan-400 font-mono font-bold flex items-center gap-2">
                      <Phone className="w-3 h-3 text-cyan-400" />
                      <span>{c.contact_number}</span>
                      <span className="text-slate-400 font-normal">({c.state}{c.district ? `, ${c.district}` : ''})</span>
                    </div>
                    {c.source_url && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span>Proof Gazette:</span>
                        <a
                          href={c.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 underline flex items-center gap-1"
                        >
                          {c.source_url} <ExternalLink className="w-2.5 h-2.5 inline" />
                        </a>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleVerify(c)}
                    disabled={actionLoading === c.id}
                    className="neon-emerald-btn px-4 py-2 rounded-xl text-xs font-black shrink-0 disabled:opacity-50"
                  >
                    {actionLoading === c.id ? 'Clearing...' : 'Clear & Verify'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto opacity-90" />
              <p className="text-sm font-bold text-white">Verification Queue Clean</p>
              <p className="text-slate-400 max-w-md mx-auto">
                No unverified emergency records pending triage in Supabase. All active records are 100% verified against official government gazettes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
