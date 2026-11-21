'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home as HomeIcon, 
  MapPin, 
  PhoneCall, 
  Users, 
  HeartPulse, 
  CheckCircle2, 
  Droplet, 
  Utensils, 
  Accessibility,
  Filter
} from 'lucide-react';
import { LiquidCard } from '@/components/ui/LiquidCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { NORTHEAST_STATES } from '@shared/northeast-data';
import { ShelterInfo } from '@app-types';

export default function SheltersPage() {
  const [shelters, setShelters] = useState<ShelterInfo[]>([]);
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadShelters() {
      try {
        const res = await fetch('/api/shelters');
        if (res.ok) {
          const data = await res.json();
          setShelters(data.data || []);
        }
      } catch (err) {
        console.error('Failed to load shelters', err);
      } finally {
        setLoading(false);
      }
    }
    loadShelters();
  }, []);

  const filteredShelters = shelters.filter(s => {
    if (selectedState !== 'All States' && s.state.toLowerCase() !== selectedState.toLowerCase()) return false;
    if (selectedType !== 'ALL' && s.facilityType !== selectedType) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-2">
            <HomeIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>VERIFIED SAFE RELIEF CAMPS & SHELTERS</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-charcoal tracking-tight">
            Find Designated Safe Locations
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted max-w-2xl mt-1">
            Directory of government relief camps, flood shelters, and emergency medical stations verified by State Disaster Management Authorities.
          </p>
        </div>

        {/* Filters */}
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
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white shadow-xs"
          >
            <option value="ALL">All Shelter Types</option>
            <option value="GOVERNMENT_SHELTER">Government Shelters</option>
            <option value="RELIEF_CAMP">Relief Camps</option>
            <option value="SCHOOL_SHELTER">School Facilities</option>
          </select>
        </div>
      </div>

      {/* Shelter Grid */}
      <section className="space-y-4">
        {filteredShelters.length === 0 ? (
          <EmptyState
            title="No Verified Shelters Registered for this Area"
            description="No active designated shelters are currently recorded for this filter. If you represent a district administration or relief agency, submit facilities through the Shelter Manager Portal."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredShelters.map((shelter) => {
              const occupancyPercent = shelter.totalCapacity > 0 
                ? Math.round((shelter.currentOccupancy / shelter.totalCapacity) * 100)
                : 0;

              return (
                <LiquidCard key={shelter.id} className="p-6 space-y-4 border-l-4 border-l-emerald-500">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-charcoal-muted">
                      {shelter.district}, {shelter.state}
                    </span>
                    <StatusBadge status={shelter.verificationStatus} />
                  </div>

                  <div>
                    <h3 className="font-extrabold text-charcoal text-lg mb-1">{shelter.name}</h3>
                    <p className="text-xs text-charcoal-muted flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emergency shrink-0 mt-0.5" />
                      <span>{shelter.address}</span>
                    </p>
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-charcoal-muted font-medium">Capacity Utilization:</span>
                      <span className="font-bold text-charcoal font-mono">
                        {shelter.currentOccupancy} / {shelter.totalCapacity} ({occupancyPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          occupancyPercent > 85 ? 'bg-emergency' : occupancyPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {shelter.hasMedicalPost && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 font-semibold text-[11px]">
                        <HeartPulse className="w-3 h-3" /> Medical Post
                      </span>
                    )}
                    {shelter.hasCleanWater && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-semibold text-[11px]">
                        <Droplet className="w-3 h-3" /> Potable Water
                      </span>
                    )}
                    {shelter.hasKitchen && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-semibold text-[11px]">
                        <Utensils className="w-3 h-3" /> Hot Meals
                      </span>
                    )}
                    {shelter.isAccessibleDisability && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-semibold text-[11px]">
                        <Accessibility className="w-3 h-3" /> Accessible
                      </span>
                    )}
                  </div>

                  {/* Contact Person */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="truncate pr-2">
                      <span className="text-[10px] text-charcoal-muted uppercase block">Contact Officer</span>
                      <span className="font-semibold text-charcoal">{shelter.contactPerson}</span>
                    </div>
                    <a
                      href={`tel:${shelter.contactPhone.split('/')[0].trim()}`}
                      className="px-3 py-1.5 rounded-full liquid-glass-emergency-btn text-white text-xs font-bold flex items-center gap-1.5 shrink-0"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Call Facility</span>
                    </a>
                  </div>
                </LiquidCard>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
