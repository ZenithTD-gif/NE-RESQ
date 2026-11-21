'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Hotel, Plus, Search, Trash2, CheckCircle2, Phone, MapPin, RefreshCw } from 'lucide-react';
import { NORTHEAST_STATES } from '@shared/northeast-data';

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [facilityType, setFacilityType] = useState('DISTRICT_CIVIL_HOSPITAL');
  const [stateName, setStateName] = useState('Assam');
  const [districtName, setDistrictName] = useState('Kamrup Metropolitan');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [totalBeds, setTotalBeds] = useState(150);
  const [icuBeds, setIcuBeds] = useState(15);
  const [hasBloodBank, setHasBloodBank] = useState(true);
  const [hasOxygenPlant, setHasOxygenPlant] = useState(true);

  const loadHospitals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/hospitals');
      if (res.ok) {
        const json = await res.json();
        setHospitals(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load hospitals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  const handleSaveHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Please provide facility name and emergency phone number.');
      return;
    }

    try {
      const res = await fetch('/api/admin/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          facility_type: facilityType,
          state: stateName,
          district: districtName.trim(),
          address: address.trim() || 'Civil Hospital Campus',
          emergency_contact: phone.trim(),
          total_beds: Number(totalBeds),
          icu_beds: Number(icuBeds),
          has_blood_bank: hasBloodBank,
          has_emergency_ot: true,
          has_oxygen_plant: hasOxygenPlant,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setName('');
        setAddress('');
        setPhone('');
        loadHospitals();
      } else {
        const errJson = await res.json();
        alert('Failed to register hospital: ' + (errJson.error || 'Server error'));
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string, hospitalName: string) => {
    if (!confirm(`Are you sure you want to remove "${hospitalName}" from the database?`)) return;
    try {
      await fetch(`/api/admin/hospitals?id=${id}`, { method: 'DELETE' });
      loadHospitals();
    } catch (err) {
      console.error('Failed to delete hospital', err);
    }
  };

  const filtered = hospitals.filter(h => {
    const hospitalState = h.state_name || h.state || '';
    const matchesSearch = !searchQuery || 
      (h.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (h.district_name || h.district || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedState === 'ALL' || hospitalState.toLowerCase().includes(selectedState.toLowerCase());
    return matchesSearch && matchesState;
  });

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader 
        title="Healthcare & Hospital Management" 
        subtitle="Manage Regional Referral Centers, Level 1 Trauma Units & Emergency Casualty Phone Lines" 
      />

      <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        <div className="admin-glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search hospitals by name or district..."
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
              onClick={loadHospitals}
              title="Refresh Records"
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="neon-emerald-btn px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Register Hospital</span>
            </button>
          </div>
        </div>

        {/* Hospital Cards or Clean Empty State */}
        {filtered.length === 0 ? (
          <div className="admin-glass-card p-12 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500">
              <Hotel className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">No healthcare facilities registered in database</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                No hospital or trauma facilities have been registered yet. Add civil hospitals or emergency referral centers to monitor ICU beds and blood availability.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="neon-emerald-btn px-5 py-2.5 rounded-xl text-xs font-black inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Register Hospital</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((h) => (
              <div key={h.id} className="admin-glass-card p-5 space-y-3 border border-slate-800 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-cyan-400 font-bold">
                      {h.facility_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Verified
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{h.name}</h4>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{h.address} ({h.district_name || h.district}, {h.state_name || h.state})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Total Beds:</span>
                      <strong className="text-white text-sm font-mono">{h.total_beds}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">ICU Capacity:</span>
                      <strong className="text-emerald-400 text-sm font-mono">{h.icu_beds}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <a 
                    href={`tel:${(h.emergency_contact || '').split('/')[0].trim()}`} 
                    className="font-mono text-cyan-400 font-bold text-xs flex items-center gap-1.5 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{h.emergency_contact}</span>
                  </a>
                  <button
                    onClick={() => handleDelete(h.id, h.name)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 transition-colors"
                    title="Delete Facility"
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
          <div className="admin-glass-card border border-emerald-500/40 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Hotel className="w-5 h-5 text-emerald-400" />
                <span>Register Healthcare Facility</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveHospital} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Hospital Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gauhati Medical College & Hospital (GMCH)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Facility Tier</label>
                  <select
                    value={facilityType}
                    onChange={(e) => setFacilityType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white"
                  >
                    <option value="LEVEL_1_TRAUMA">Level 1 Trauma Center</option>
                    <option value="REGIONAL_REFERRAL">Regional Referral Hospital</option>
                    <option value="MEDICAL_COLLEGE">Medical College Hospital</option>
                    <option value="DISTRICT_CIVIL_HOSPITAL">District Civil Hospital</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Emergency Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0361-2529457"
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
                  placeholder="e.g. Narakasur Hilltop, Bhangagarh, Guwahati"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Total Beds</label>
                  <input
                    type="number"
                    value={totalBeds}
                    onChange={(e) => setTotalBeds(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">ICU Capacity</label>
                  <input
                    type="number"
                    value={icuBeds}
                    onChange={(e) => setIcuBeds(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasBloodBank}
                    onChange={(e) => setHasBloodBank(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                  />
                  <span>Blood Bank Available</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasOxygenPlant}
                    onChange={(e) => setHasOxygenPlant(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                  />
                  <span>On-site Oxygen Plant</span>
                </label>
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
                  className="neon-emerald-btn px-5 py-2 rounded-xl text-xs font-black"
                >
                  Save Hospital to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
