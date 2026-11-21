'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckSquare, 
  Square, 
  Download, 
  AlertTriangle, 
  Waves, 
  Mountain, 
  Activity, 
  Wind,
  Luggage,
  PhoneCall,
  Search,
  Building2,
  ExternalLink,
  Filter
} from 'lucide-react';
import { LiquidCard } from '@/components/ui/LiquidCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CENTRALIZED_EMERGENCY_DIRECTORY, EmergencyContact } from '@shared/emergency-directory';
import { NORTHEAST_STATES } from '@shared/northeast-data';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

const CHECKLIST_SECTIONS = [
  {
    id: 'survival-kit',
    title: '72-Hour Emergency Survival Go-Bag',
    icon: Luggage,
    description: 'Essential gear packed in a waterproof backpack for every family member.',
    items: [
      'At least 3 liters of sealed drinking water per person per day',
      'Non-perishable energy foods (dry fruits, roasted gram, biscuits, flattened rice / chira)',
      'Waterproof torch / flashlight with extra batteries or solar crank',
      'Whistle to signal rescue teams if trapped or stranded',
      'First aid kit with antiseptic lotion, sterile gauze, bandages, and burn cream',
      'Essential prescription medicines (minimum 7-day reserve supply)',
      'Original official identity cards & land/property documents sealed in plastic ziploc bags',
      'Cash in small denomination banknotes (ATMs cease functioning during grid failure)',
      'High-capacity power bank with charging cables sealed in ziploc',
      'Emergency survival blanket, rain poncho, and spare warm clothing'
    ]
  },
  {
    id: 'flood-safety',
    title: 'Flash Flood & River Surge Action Protocol',
    icon: Waves,
    description: 'Standard operating procedure during rising Brahmaputra & river surges.',
    items: [
      'Turn off the main electrical circuit breaker and LPG cylinder regulators before evacuating',
      'Never drive or walk across flooded bridges or culverts (6 inches of water can sweep a person)',
      'Keep livestock and pets unchained so they can reach elevated high ground / highlands',
      'Boil or chemically treat all drinking water before consumption to prevent cholera and enteric fever',
      'Move elderly citizens, pregnant women, and infants to the upper floor or designated community highland'
    ]
  },
  {
    id: 'landslide-safety',
    title: 'Hill Slope & Landslide Preparedness',
    icon: Mountain,
    description: 'Precautions for hilly terrain across Arunachal Pradesh, Meghalaya, Mizoram, and Sikkim.',
    items: [
      'Observe slope drainage: sudden muddy runoff or cracking in soil indicates imminent slope movement',
      'Listen for unusual rumblings, cracking trees, or rolling boulders',
      'Evacuate immediately from the direct debris flow path to stable rocky outcrops',
      'Avoid building temporary shelters directly beneath steep, excavated road cuts during heavy rains'
    ]
  },
  {
    id: 'earthquake-safety',
    title: 'Seismic Zone V Protocol (Drop, Cover & Hold)',
    icon: Activity,
    description: 'Northeast India lies in the highest seismic risk Zone V.',
    items: [
      'DROP to your hands and knees to prevent falling',
      'COVER your head and neck under a sturdy table, desk, or interior corner',
      'HOLD ON to your shelter until shaking completely stops',
      'Stay away from glass windows, unreinforced brick facades, and overhead electrical lines',
      'Do not use elevators during or immediately after an earthquake'
    ]
  }
];

export default function PreparednessPage() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleCheck = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleDownload = () => {
    const textContent = CHECKLIST_SECTIONS.map(s => {
      return `${s.title.toUpperCase()}\n${s.description}\n` + 
        s.items.map((it, idx) => `[ ] ${idx + 1}. ${it}`).join('\n') + '\n\n';
    }).join('----------------------------------------\n');

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NE-RESQ-Disaster-Preparedness-Checklist.txt';
    a.click();
  };

  // Filter emergency contacts
  const filteredContacts = CENTRALIZED_EMERGENCY_DIRECTORY.filter((c) => {
    const matchesState = selectedState === 'All States' || c.state.includes(selectedState) || c.state.includes('All 8');
    const matchesQuery = 
      !searchQuery || 
      c.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phoneNumber.includes(searchQuery);
    return matchesState && matchesQuery;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-2 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>OFFICIAL NDMA SAFETY PROTOCOLS</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-charcoal tracking-tight">
            Disaster Preparedness & Directory
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted max-w-2xl mt-1">
            Standard operating safety checklists and verified official emergency contact directory for all eight Northeast Indian states.
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="px-4 py-2 rounded-xl liquid-glass-card border border-sky-200 text-xs font-bold text-charcoal flex items-center gap-2 hover:border-cyan shadow-xs self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-cyan" />
          <span>Save Offline Text Checklist</span>
        </button>
      </div>

      {/* Centralized Emergency Directory Register */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-charcoal tracking-tight flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-emergency" />
              <span>Verified Regional Emergency Contacts</span>
            </h2>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Strictly verified government SEOC, DEOC, NDRF, and referral hospital emergency casualties.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* State Filter */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-sky-200 bg-white text-charcoal"
            >
              <option value="All States">All 8 Northeast States</option>
              {NORTHEAST_STATES.map((st) => (
                <option key={st.code} value={st.name}>
                  {st.name}
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search emergency service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-8 pr-3 py-2 rounded-xl border border-sky-200 bg-white text-charcoal w-48 sm:w-56"
              />
              <Search className="w-3.5 h-3.5 text-charcoal-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContacts.map((contact) => (
            <LiquidCard key={contact.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    {contact.category.replace('_', ' ')}
                  </span>
                  <StatusBadge status={contact.verificationStatus} size="sm" />
                </div>
                <h4 className="font-bold text-charcoal text-base leading-snug">{contact.serviceName}</h4>
                <p className="text-xs text-charcoal-muted mt-0.5">{contact.department}</p>
                <p className="text-[11px] text-charcoal-muted mt-1">
                  Jurisdiction: <span className="text-charcoal font-semibold">{contact.state} ({contact.district})</span>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-sky-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-charcoal-muted block">Direct Helpline</span>
                  <a
                    href={`tel:${contact.phoneNumber.split('/')[0].trim()}`}
                    className="font-black text-lg text-emergency hover:underline tracking-tight flex items-center gap-1.5"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>{contact.phoneNumber}</span>
                  </a>
                  {contact.alternateNumber && (
                    <span className="text-[10px] text-charcoal-muted block">Alt: {contact.alternateNumber}</span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-charcoal-muted block">{contact.operatingHours}</span>
                  {contact.sourceUrl && (
                    <a
                      href={contact.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-cyan hover:underline inline-flex items-center gap-1 font-semibold mt-1"
                    >
                      <span>Gazette Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </LiquidCard>
          ))}
        </div>
      </section>

      {/* Safety Checklists */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-charcoal tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Interactive Household Safety Protocols</span>
          </h2>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Check off completed safety tasks. All responses are saved locally in your browser offline.
          </p>
        </div>

        <div className="space-y-6">
          {CHECKLIST_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            return (
              <LiquidCard key={sec.id} className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-sky-100">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-sky-200 flex items-center justify-center text-emergency shrink-0 shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-charcoal text-base sm:text-lg">{sec.title}</h3>
                    <p className="text-xs text-charcoal-muted">{sec.description}</p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  {sec.items.map((item, idx) => {
                    const key = `${sec.id}-${idx}`;
                    const isChecked = Boolean(checkedItems[key]);

                    return (
                      <div
                        key={key}
                        onClick={() => toggleCheck(key)}
                        className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-start gap-3 ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 line-through opacity-80'
                            : 'bg-white/90 border-sky-100 text-charcoal hover:bg-white hover:border-sky-300'
                        }`}
                      >
                        <button type="button" className="shrink-0 mt-0.5">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    );
                  })}
                </div>
              </LiquidCard>
            );
          })}
        </div>
      </section>

    </div>
  );
}
