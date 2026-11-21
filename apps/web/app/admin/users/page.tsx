'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { 
  Users, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  UserX,
  Search,
  KeyRound,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { ADMIN_ROLES } from '@/lib/admin-auth';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUpdateStatus = async (user: any, targetStatus: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, status: targetStatus, approved_by: 'Super Administrator' }),
      });
      if (res.ok) {
        loadUsers();
      } else {
        const errJson = await res.json();
        alert('Action failed: ' + (errJson.error || 'Server error'));
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove account for "${name}"?`)) return;
    try {
      await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      loadUsers();
    } catch (err) {
      console.error('Failed to delete user', err);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesStatus = filterStatus === 'ALL' || u.status === filterStatus;
    const matchesSearch = !searchQuery || 
      (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = users.filter(u => u.status === 'PENDING_APPROVAL').length;
  const activeCount = users.filter(u => u.status === 'APPROVED').length;

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader 
        title="Administrator Clearance & Approval Desk" 
        subtitle="Manage State SDMA & District DDMA Credentials, Authorized Roles & Super Admin Approvals" 
      />

      <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        
        {/* Top Security Clearance Policy Banner */}
        <div className="admin-glass-card p-5 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-cyan-glow">
              <KeyRound className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Zero-Trust Admin Clearance Policy</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono">
                  {pendingCount} PENDING
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Public accounts cannot assign administrator privileges. All registration requests remain quarantined in Supabase until authorized.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadUsers}
              title="Refresh Users"
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-glass-card p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search administrators by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold p-3 pl-9 rounded-xl border border-slate-700 bg-slate-900 text-white outline-none focus:border-cyan-400"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-200"
          >
            <option value="ALL">All Statuses ({users.length})</option>
            <option value="PENDING_APPROVAL">Pending Review ({pendingCount})</option>
            <option value="APPROVED">Active ({activeCount})</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Users Table / Empty State */}
        <div className="admin-glass-card overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-white font-mono">
              Displaying {filteredUsers.length} Registered Accounts
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              Live Supabase Table: admin_users
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Administrator</th>
                  <th className="p-3.5">Department & Title</th>
                  <th className="p-3.5">Role Authorization</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Registered</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500">
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-slate-300">No administrative accounts found</div>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                        No administrator accounts match the selected status filter in Supabase.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{u.full_name}</div>
                        <div className="text-[11px] text-cyan-400 font-mono">{u.email}</div>
                        {u.phone && <div className="text-[10px] text-slate-500">{u.phone}</div>}
                      </td>
                      <td className="p-3.5">
                        <div className="text-slate-300 font-semibold">{u.department}</div>
                        <div className="text-[10px] text-slate-500">{u.designation}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800 text-[10px] font-bold font-mono">
                          {u.role || 'STATE_ADMIN'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {u.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                            <CheckCircle className="w-3 h-3 text-emerald-400" /> Active
                          </span>
                        ) : u.status === 'PENDING_APPROVAL' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold animate-pulse">
                            <Clock className="w-3 h-3 text-amber-400" /> Pending Review
                          </span>
                        ) : u.status === 'SUSPENDED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
                            <UserX className="w-3 h-3 text-slate-500" /> Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                            <XCircle className="w-3 h-3 text-rose-400" /> Rejected
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-[11px] text-slate-500 font-mono">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        {u.status === 'PENDING_APPROVAL' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(u, 'APPROVED')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-[11px] font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(u, 'REJECTED')}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 text-[11px] font-bold"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {u.status === 'APPROVED' && u.role !== 'SUPER_ADMIN' && (
                          <button
                            onClick={() => handleUpdateStatus(u, 'SUSPENDED')}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-600 hover:text-white text-slate-400 transition-colors"
                            title="Suspend Access"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {u.status === 'SUSPENDED' && (
                          <button
                            onClick={() => handleUpdateStatus(u, 'APPROVED')}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-400 transition-colors"
                            title="Reactivate Access"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {u.role !== 'SUPER_ADMIN' && (
                          <button
                            onClick={() => handleDelete(u.id, u.full_name)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
