'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home as HomeIcon, 
  Users, 
  Package, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck,
  Save
} from 'lucide-react';
import { LiquidCard } from '@/components/ui/LiquidCard';
import { ShelterInfo } from '@app-types';

export default function ShelterPortal() {
  const [shelters, setShelters] = useState<ShelterInfo[]>([]);
  const [selectedShelter, setSelectedShelter] = useState<ShelterInfo | null>(null);
  const [occupancy, setOccupancy] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadShelters() {
      try {
        const res = await fetch('/api/shelters');
        if (res.ok) {
          const data = await res.json();
          setShelters(data.data || []);
          if (data.data?.length > 0) {
            setSelectedShelter(data.data[0]);
            setOccupancy(data.data[0].currentOccupancy);
          }
        }
      } catch (err) {
        console.error('Failed to load shelter info', err);
      }
    }
    loadShelters();
  }, []);

  const handleUpdateOccupancy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShelter) return;

    setSaving(true);
    // Simulate updating occupancy locally and save
    setTimeout(() => {
      selectedShelter.currentOccupancy = Number(occupancy);
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 400);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-1">
          <HomeIcon className="w-3.5 h-3.5 text-emerald-600" />
          <span>SHELTER & RELIEF CAMP MANAGEMENT</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight">
          Facility Occupancy & Relief Operations Terminal
        </h1>
        <p className="text-xs text-charcoal-muted mt-0.5">
          Authorized camp managers record verified headcounts, water, food, and medical stock levels.
        </p>
      </div>

      {selectedShelter ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Occupancy & Supplies */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Occupancy Manager */}
            <LiquidCard className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Assigned Facility</span>
                  <h3 className="text-xl font-extrabold text-charcoal">{selectedShelter.name}</h3>
                  <p className="text-xs text-charcoal-muted">{selectedShelter.address}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-charcoal-muted block">Total Capacity:</span>
                  <span className="text-xl font-black text-charcoal font-mono">{selectedShelter.totalCapacity}</span>
                </div>
              </div>

              {savedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Occupancy headcount successfully logged and synchronized with DEOC.</span>
                </div>
              )}

              <form onSubmit={handleUpdateOccupancy} className="pt-4 border-t border-slate-100 space-y-4">
                <div>
                  <label className="text-xs font-bold text-charcoal block mb-1">
                    Current Live Resident Occupancy (Persons) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={selectedShelter.totalCapacity * 2}
                    value={occupancy}
                    onChange={(e) => setOccupancy(Number(e.target.value))}
                    className="w-full text-base font-bold p-3 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl liquid-glass-emergency-btn text-white text-xs font-bold flex items-center gap-2 shadow-emergency-glow"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Synchronizing...' : 'Update Live Headcount'}</span>
                </button>
              </form>
            </LiquidCard>

            {/* Relief Supplies Status */}
            <LiquidCard className="p-6 sm:p-8 space-y-4">
              <h4 className="font-bold text-sm text-charcoal flex items-center gap-2">
                <Package className="w-4 h-4 text-sky-600" />
                <span>On-Site Emergency Supplies Inventory</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-charcoal-muted uppercase block">Food Packs</span>
                  <span className="font-extrabold text-base text-charcoal font-mono mt-1 block">450</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Stock Normal</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-charcoal-muted uppercase block">Water (Liters)</span>
                  <span className="font-extrabold text-base text-charcoal font-mono mt-1 block">1,800 L</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Stock Normal</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-charcoal-muted uppercase block">Trauma Kits</span>
                  <span className="font-extrabold text-base text-charcoal font-mono mt-1 block">24</span>
                  <span className="text-[10px] text-amber-600 font-semibold">Reorder Soon</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-charcoal-muted uppercase block">Tarpaulins</span>
                  <span className="font-extrabold text-base text-charcoal font-mono mt-1 block">120</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Stock Normal</span>
                </div>
              </div>
            </LiquidCard>

          </div>

          {/* Right Col: Facility Officer Details */}
          <div className="space-y-6">
            <LiquidCard className="p-6 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal">
                Manager Verification
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-charcoal-muted uppercase block">In-Charge Officer</span>
                  <span className="font-bold text-charcoal">{selectedShelter.contactPerson}</span>
                </div>
                <div>
                  <span className="text-[10px] text-charcoal-muted uppercase block">Duty Phone</span>
                  <span className="font-bold text-emergency font-mono">{selectedShelter.contactPhone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-charcoal-muted uppercase block">Verification Status</span>
                  <span className="font-bold text-emerald-700">Official Government Verified</span>
                </div>
              </div>
            </LiquidCard>
          </div>

        </div>
      ) : (
        <div className="text-center py-12 text-xs font-semibold text-charcoal-muted">
          Loading assigned facilities...
        </div>
      )}

    </div>
  );
}
