'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { History, Search, Clock, ShieldCheck, RefreshCw, FileText } from 'lucide-react';

interface AuditLog {
  id: string;
  created_at: string;
  admin_email: string;
  action: string;
  target_table: string;
  target_id?: string;
  details?: Record<string, any>;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setLogs(data.data);
      } else {
        setLogs([]);
      }
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter(l => 
    (l.action || '').toLowerCase().includes(search.toLowerCase()) || 
    (l.admin_email || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.target_table || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="System Audit Logs & Security History"
        subtitle="Immutable Append-Only Audit Trail of Administrative Operations, Approvals & Publishing Events in Supabase"
      />
      <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        <div className="admin-glass-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Search audit trail by action, admin email, or table..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs font-semibold p-3 pl-9 rounded-xl border border-slate-700 bg-slate-900 text-white outline-none focus:border-cyan-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-2 text-xs font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Refresh Trail</span>
            </button>
            <div className="text-xs font-mono font-bold text-cyan-400 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              {filtered.length} Recorded Events
            </div>
          </div>
        </div>

        <div className="admin-glass-card overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              <span>Retrieving immutable audit history from Supabase...</span>
            </div>
          ) : filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Action Event</th>
                    <th className="p-3.5">Administrator</th>
                    <th className="p-3.5">Target Entity</th>
                    <th className="p-3.5">Metadata Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300 font-mono text-[11px]">
                  {filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-bold text-cyan-400 whitespace-nowrap">{log.action}</td>
                      <td className="p-3.5 text-white font-sans whitespace-nowrap">{log.admin_email}</td>
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">
                        {log.target_table} {log.target_id ? `(${log.target_id.slice(0, 8)}...)` : ''}
                      </td>
                      <td className="p-3.5 text-slate-500 max-w-xs truncate">
                        {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '{}')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center text-xs text-slate-400 space-y-2">
              <Clock className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-white">No Security Audit Logs Recorded Yet</p>
              <p className="text-slate-500 max-w-md mx-auto">
                Administrative operations (logins, contact approvals, alert broadcasts, facility registrations) will be logged here with cryptographic timestamps.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
