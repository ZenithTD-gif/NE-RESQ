'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PhoneCall, 
  Radio, 
  ShieldAlert, 
  MapPin, 
  Search, 
  ExternalLink, 
  CheckCircle, 
  ArrowRight,
  Clock,
  Building2
} from 'lucide-react';
import { NORTHEAST_STATES, OFFICIAL_EMERGENCY_HELPLINES } from '@shared/northeast-data';
import { EmergencyContact } from '@shared/emergency-directory';

export default function EmergencyAssistancePage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [selectedState, setSelectedState] = useState('All States');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContacts() {
      try {
        const res = await fetch('/api/contacts');
        if (res.ok) {
          const data = await res.json();
          setContacts(data.data || []);
        }
      } catch (err) {
        console.error('Failed to load emergency contacts', err);
      } finally {
        setLoading(false);
      }
    }
    loadContacts();
  }, []);

  const filtered = contacts.filter((c) => {
    const matchesState =
      selectedState === 'All States' ||
      c.state.toLowerCase().includes(selectedState.toLowerCase()) ||
      c.state.includes('All');
    const matchesSearch =
      !search ||
      c.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase()) ||
      c.phoneNumber.includes(search);
    return matchesState && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Hero Header */}
      <div className="liquid-glass-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 mb-2">
            <Radio className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>24x7 EMERGENCY ASSISTANCE DIRECTORY</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-charcoal tracking-tight">
            Emergency Help & Rescue Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1 max-w-2xl">
            Official verified helplines for State Disaster Management Authorities (SDMA), District Emergency Operations Centres (DEOC 1077), Police, Fire, SDRF & NDRF Battalions across all 8 Northeast states.
          </p>
        </div>

        <Link
          href="/sos"
          className="liquid-glass-emergency-btn text-white px-6 py-3 rounded-2xl font-black text-sm tracking-wider flex items-center gap-2 shadow-emergency-glow shrink-0 hover:scale-105 transition-transform"
        >
          <Radio className="w-4 h-4 animate-pulse" />
          <span>BROADCAST EMERGENCY SOS</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Critical National Helplines Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {OFFICIAL_EMERGENCY_HELPLINES.slice(0, 4).map((h, i) => (
          <div key={i} className="liquid-glass-card p-4 space-y-1">
            <div className="text-[10px] font-bold text-charcoal-muted uppercase">{h.agency}</div>
            <a
              href={`tel:${h.number.split('/')[0].trim()}`}
              className="text-lg sm:text-xl font-black text-emergency hover:underline block"
            >
              {h.number}
            </a>
            <div className="text-[10px] text-charcoal-muted flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-600" />
              <span>{h.coverage || '24x7 Toll Free'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="liquid-glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search service, authority, or emergency number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-semibold p-3 pl-9 rounded-xl border border-sky-200 bg-white/90 text-charcoal outline-none focus:border-cyan"
          />
          <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-3.5" />
        </div>
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="text-xs font-semibold p-3 rounded-xl border border-sky-200 bg-white/90 text-charcoal"
        >
          <option value="All States">All 8 Northeast States</option>
          {NORTHEAST_STATES.map((s) => (
            <option key={s.code} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-charcoal-muted font-semibold">
            Loading official emergency directory...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-charcoal-muted font-semibold">
            No emergency contacts match your search query.
          </div>
        ) : (
          filtered.map((c) => (
            <div key={c.id} className="liquid-glass-card p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan border border-cyan-200 uppercase">
                    {c.category}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-charcoal">{c.serviceName}</h3>
                <p className="text-xs text-charcoal-muted">{c.department}</p>
                <div className="text-[11px] text-charcoal-muted flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emergency" />
                  <span>{c.district}, {c.state}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-sky-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-charcoal-muted block">Direct Helpline</span>
                  <a
                    href={`tel:${c.phoneNumber.split('/')[0].trim()}`}
                    className="font-mono font-black text-sm text-emergency hover:underline"
                  >
                    {c.phoneNumber}
                  </a>
                </div>
                <a
                  href={`tel:${c.phoneNumber.split('/')[0].trim()}`}
                  className="px-3 py-1.5 rounded-xl bg-emergency text-white text-xs font-bold hover:bg-rose-600 transition-colors flex items-center gap-1 shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
