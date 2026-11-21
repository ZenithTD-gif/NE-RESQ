'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Home, Plus, Search, Trash2, CheckCircle2, Phone, MapPin, RefreshCw, Users } from 'lucide-react';
import { NORTHEAST_STATES } from '@shared/northeast-data';

export default function SheltersPage() {
  const [shelters, setShelters] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [facilityType, setFacilityType] = useState('RELIEF_CAMP');
  const [stateName, setStateName] = useState('Assam');
  const [districtName, setDistrictName] = useState('Kamrup Metropolitan');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('1077');
  const [capacity, setCapacity] = useState(500);

  const loadShelters = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/shelters');
      if (res.ok) {
        const json = await res.json();
        setShelters(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load shelters', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShelters();
  }, []);

  const handleSaveShelter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Please provide shelter name and contact phone number.');
      return;
    }

    try {
      const res = await fetch('/api/admin/shelters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          facility_type: facilityType,
          state: stateName,
          district: districtName.trim(),
          address: address.trim() || 'Highland Community Center',
          contact_person: contactPerson.trim() || 'DDMA Relief In-Charge',
          contact_phone: phone.trim(),
          total_capacity: Number(capacity),
          has_medical_post: true,
          has_clean_water: true,
          has_kitchen: true,
          has_sanitation: true,
          is_accessible_disability: true,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setName('');
        setAddress('');
        loadShelters();
      } else {
        const errJson = await res.json();
        alert('Failed to register shelter: ' + (errJson.error || 'Server error'));
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string, shelterName: string) => {
    if (!confirm(`Are you sure you want to remove "${shelterName}" from the database?`)) return;
    try {
      await fetch(`/api/admin/shelters?id=${id}`, { method: 'DELETE' });
      loadShelters();
    } catch (err) {
      console.error('Failed to delete shelter', err);
    }
  };

  const filtered = shelters.filter(s => {
    const shelterState = s.state_name || s.state || '';
    const matchesSearch = !searchQuery || 
      (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (s.district_name || s.district || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedState === 'ALL' || shelterState.toLowerCase().includes(selectedState.toLowerCase());
    return matchesSearch && matchesState;
  });

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader 
        title="Shelter & Relief Camp Management" 
        subtitle="Manage Highland Evacuation Shelters, Capacities, Current Occupancies & Water/Sanitation Readiness" 
      />

      <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        <div className="admin-glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search shelters by name or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold p-3 pl-9 rounded-xl border border-slate-700 bg-slate-900 text-white outline-none focus:border-cyan-400"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="text-xs p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-200"
            >
              <option value="ALL">All States</option>
              {NORTHEAST_STATES.map(s => <option key={s.code} value={s.name}>{s.name}</option>)}
            </select>

            <button
              onClick={loadShelters}
              title="Refresh Records"
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="neon-cyan-btn px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Relief Shelter</span>
            </button>
          </div>
        </div>

        {/* Shelters Grid or Clean Empty State */}
        {filtered.length === 0 ? (
          <div className="admin-glass-card p-12 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500">
              <Home className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">No verified relief camps available in database</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                No emergency relief camps or evacuation centers have been registered yet. Add highland shelters or stadium complexes for emergency flood relocation.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="neon-cyan-btn px-5 py-2.5 rounded-xl text-xs font-black inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Relief Shelter</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((s) => (
              <div key={s.id} className="admin-glass-card p-5 space-y-3 border border-slate-800 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-cyan-400 font-bold">
                      {s.facility_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Verified
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{s.name}</h4>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{s.address} ({s.district_name || s.district}, {s.state_name || s.state})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Total Capacity:</span>
                      <strong className="text-white text-sm font-mono">{s.total_capacity} persons</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Current Occupancy:</span>
                      <strong className="text-cyan-400 text-sm font-mono">{s.current_occupancy || 0}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <a 
                    href={`tel:${(s.contact_phone || '1077').split('/')[0].trim()}`} 
                    className="font-mono text-cyan-400 font-bold text-xs flex items-center gap-1.5 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{s.contact_phone}</span>
                  </a>
                  <button
                    onClick={() => handleDelete(s.id, s.name)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 transition-colors"
                    title="Delete Shelter"
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
          <div className="admin-glass-card border border-cyan-500/40 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Home className="w-5 h-5 text-cyan-400" />
                <span>Register Relief Camp / Shelter</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveShelter} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Shelter / Camp Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarusajai Indoor Stadium Relief Center"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Facility Type</label>
                  <select
                    value={facilityType}
                    onChange={(e) => setFacilityType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white"
                  >
                    <option value="RELIEF_CAMP">Designated Relief Camp</option>
                    <option value="INDOOR_STADIUM">Indoor Stadium Complex</option>
                    <option value="GOVERNMENT_SHELTER">Highland Government Shelter</option>
                    <option value="COMMUNITY_HALL">Community Center</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1077 / 0361-2733052"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="e.g. Kamrup Metropolitan"
                    value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Campus Address</label>
                <input
                  type="text"
                  placeholder="e.g. NH 37, Sarusajai, Guwahati"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Contact Person / In-Charge</label>
                  <input
                    type="text"
                    placeholder="DDMA Relief Officer"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Maximum Capacity (Persons)</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
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
                  Save Shelter to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
