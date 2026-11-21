'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { ShieldAlert, Phone, Users, CheckCircle2, Plus, Trash2, RefreshCw } from 'lucide-react';
import { NORTHEAST_STATES } from '@shared/northeast-data';

export default function RescuePage() {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [agency, setAgency] = useState('SDRF / Fire & Emergency');
  const [stateName, setStateName] = useState('Assam');
  const [districtName, setDistrictName] = useState('Kamrup Metropolitan');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('112');
  const [boats, setBoats] = useState(4);
  const [personnel, setPersonnel] = useState(25);

  const loadUnits = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/rescue');
      if (res.ok) {
        const json = await res.json();
        setUnits(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load rescue units', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact) {
      alert('Please provide unit name and emergency contact.');
      return;
    }

    try {
      const res = await fetch('/api/admin/rescue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          agency: agency.trim(),
          state: stateName,
          district: districtName.trim(),
          address: address.trim(),
          contact_number: contact.trim(),
          motor_boats_count: Number(boats),
          personnel_count: Number(personnel),
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setName('');
        setAddress('');
        loadUnits();
      } else {
        const errJson = await res.json();
        alert('Failed: ' + (errJson.error || 'Server error'));
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string, unitName: string) => {
    if (!confirm(`Are you sure you want to remove "${unitName}"?`)) return;
    try {
      await fetch(`/api/admin/rescue?id=${id}`, { method: 'DELETE' });
      loadUnits();
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader 
        title="Rescue Units & Operational Readiness" 
        subtitle="Track Regional NDRF, SDRF & Fire Service Deployment Status and Specialized Boat Gear" 
      />

      <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        <div className="admin-glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Operational Rescue Inventory</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[10px] font-mono">
                LIVE POSTGRESQL
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified NDRF battalions, state SDRF divisions, and flood rescue boat stocks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadUnits}
              title="Refresh Units"
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="neon-cyan-btn px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Register Rescue Unit</span>
            </button>
          </div>
        </div>

        {/* Units Grid or Empty State */}
        {units.length === 0 ? (
          <div className="admin-glass-card p-12 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">No registered rescue teams found in database</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                No active NDRF, SDRF, or civil defence units have been registered in the database yet. Add official disaster response teams to coordinate emergency deployments.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="neon-cyan-btn px-5 py-2.5 rounded-xl text-xs font-black inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Register Rescue Unit</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {units.map((u) => (
              <div key={u.id} className="admin-glass-card admin-glass-card-hover p-5 space-y-3 border border-slate-800 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                      {u.agency || 'RESCUE FORCE'}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Operational</span>
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-tight">{u.name}</h4>
                  <p className="text-[11px] text-slate-400">{u.address || `${u.district_name}, ${u.state_name}`}</p>

                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Personnel:</span>
                      <strong className="text-white font-mono">{u.personnel_count || 25}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Inflatable Boats:</span>
                      <strong className="text-cyan-400 font-mono">{u.motor_boats_count || u.inflatable_boats_count || 2} Units</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="font-mono text-cyan-400 font-bold text-xs flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{u.contact_number || '112'}</span>
                  </span>
                  <button
                    onClick={() => handleDelete(u.id, u.name)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="admin-glass-card border border-cyan-500/40 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
                <span>Register Emergency Rescue Unit</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveUnit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Unit / Battalion Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NDRF 1st Bn Flood Rescue Unit"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Agency</label>
                  <select
                    value={agency}
                    onChange={(e) => setAgency(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white"
                  >
                    <option value="NDRF">NDRF</option>
                    <option value="SDRF">SDRF</option>
                    <option value="Fire & Emergency">Fire & Emergency</option>
                    <option value="Civil Defence">Civil Defence</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Emergency Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="0361-2849005"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">State Jurisdiction</label>
                  <select
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white"
                  >
                    {NORTHEAST_STATES.map(s => <option key={s.code} value={s.name}>{s.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">District</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kamrup Rural"
                    value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Motorized / Inflatable Boats</label>
                  <input
                    type="number"
                    value={boats}
                    onChange={(e) => setBoats(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Active Personnel Count</label>
                  <input
                    type="number"
                    value={personnel}
                    onChange={(e) => setPersonnel(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neon-cyan-btn px-5 py-2 rounded-xl text-xs font-black"
                >
                  Save Unit to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
