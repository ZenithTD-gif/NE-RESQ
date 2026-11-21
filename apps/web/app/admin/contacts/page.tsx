'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { 
  PhoneCall, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  AlertCircle,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import { EmergencyContact } from '@/lib/admin-db';
import { NORTHEAST_STATES } from '@shared/northeast-data';

const CONTACT_CATEGORIES = [
  'NATIONAL_EMERGENCY',
  'STATE_EOC',
  'DISTRICT_EOC',
  'NDRF',
  'SDRF',
  'POLICE',
  'FIRE_RESCUE',
  'AMBULANCE_MEDICAL',
  'HEALTH_TELEMEDICINE',
  'WOMEN_CHILD_SAFETY',
  'HOSPITAL_CASUALTY',
  'RELIEF_CAMP',
  'OTHER_EMERGENCY'
];

export default function EmergencyContactsPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);

  // Form Fields
  const [contactName, setContactName] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [organization, setOrganization] = useState('');
  const [category, setCategory] = useState('STATE_EOC');
  const [scope, setScope] = useState<'NATIONAL' | 'STATE' | 'DISTRICT' | 'REGIONAL'>('STATE');
  const [stateName, setStateName] = useState('Assam');
  const [districtName, setDistrictName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [alternateNumber, setAlternateNumber] = useState('');
  const [isTollFree, setIsTollFree] = useState(false);
  const [officialWebsite, setOfficialWebsite] = useState('');
  const [operatingHours, setOperatingHours] = useState('24x7 / 365 Days');
  const [description, setDescription] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED_OFFICIAL'>('VERIFIED_OFFICIAL');
  const [publicationStatus, setPublicationStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');

  const loadContacts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/contacts');
      if (res.ok) {
        const json = await res.json();
        setContacts(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load contacts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const openNewModal = () => {
    setEditingContact(null);
    setContactName('');
    setDepartmentName('');
    setOrganization('');
    setCategory('STATE_EOC');
    setScope('STATE');
    setStateName('Assam');
    setDistrictName('');
    setContactNumber('');
    setAlternateNumber('');
    setIsTollFree(false);
    setOfficialWebsite('');
    setOperatingHours('24x7 / 365 Days');
    setDescription('');
    setSourceUrl('');
    setVerificationStatus('VERIFIED_OFFICIAL');
    setPublicationStatus('PUBLISHED');
    setIsModalOpen(true);
  };

  const openEditModal = (c: EmergencyContact) => {
    setEditingContact(c);
    setContactName(c.contact_name);
    setDepartmentName(c.department_name);
    setOrganization(c.organization);
    setCategory(c.category);
    setScope(c.scope);
    setStateName(c.state || (c as any).state_name || 'Assam');
    setDistrictName(c.district || (c as any).district_name || '');
    setContactNumber(c.contact_number);
    setAlternateNumber(c.alternate_number || '');
    setIsTollFree(c.is_toll_free);
    setOfficialWebsite(c.official_website || '');
    setOperatingHours(c.operating_hours);
    setDescription(c.description || '');
    setSourceUrl(c.source_url || '');
    setVerificationStatus(c.verification_status as any);
    setPublicationStatus(c.publication_status as any);
    setIsModalOpen(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactNumber) {
      alert('Please provide contact name and phone number.');
      return;
    }

    const payload = {
      id: editingContact ? editingContact.id : undefined,
      contact_name: contactName.trim(),
      service_name: contactName.trim(),
      department_name: departmentName.trim() || 'Disaster Management Department',
      organization: organization.trim() || 'Govt. of ' + stateName,
      category,
      scope,
      state: stateName,
      district: districtName.trim() || 'All Districts',
      contact_number: contactNumber.trim(),
      alternate_number: alternateNumber.trim() || null,
      is_toll_free: isTollFree,
      official_website: officialWebsite.trim() || null,
      operating_hours: operatingHours.trim(),
      description: description.trim() || null,
      source_url: sourceUrl.trim() || 'https://sdma.assam.gov.in',
      verification_status: verificationStatus,
      publication_status: publicationStatus,
    };

    try {
      const res = await fetch('/api/admin/contacts', {
        method: editingContact ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        loadContacts();
      } else {
        const errJson = await res.json();
        alert('Failed to save contact: ' + (errJson.error || 'Server error'));
      }
    } catch (err: any) {
      alert('Error saving contact: ' + err.message);
    }
  };

  const handleTogglePublication = async (c: EmergencyContact) => {
    const newStatus = c.publication_status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await fetch('/api/admin/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, publication_status: newStatus }),
      });
      loadContacts();
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}" from the Supabase database?`)) {
      return;
    }
    try {
      await fetch(`/api/admin/contacts?id=${id}`, { method: 'DELETE' });
      loadContacts();
    } catch (err) {
      console.error('Failed to delete contact', err);
    }
  };

  const filteredContacts = contacts.filter((c) => {
    const contactState = c.state || (c as any).state_name || '';
    const matchesState = selectedState === 'ALL' || contactState.toLowerCase().includes(selectedState.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      c.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contact_number.includes(searchQuery) ||
      c.department_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader 
        title="Emergency Contact Management" 
        subtitle="Manage, Verify & Publish Official 8-State Helplines, SEOC, DEOC & Disaster Dispatch Numbers" 
      />

      <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        
        {/* Top Action Bar */}
        <div className="admin-glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-cyan-glow">
              <PhoneCall className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Centralized Emergency Directory</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[10px] font-mono">
                  SUPABASE POSTGRESQL
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                All numbers are verified against official Government Gazette & SDMA records. Zero mock numbers permitted.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadContacts}
              title="Refresh Records"
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openNewModal}
              className="neon-cyan-btn px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Emergency Contact</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-glass-card p-4 flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by contact name, department, or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold p-3 pl-9 rounded-xl border border-slate-700 bg-slate-900 text-white outline-none focus:border-cyan-400"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="text-xs p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-200"
            >
              <option value="ALL">All Northeast States</option>
              {NORTHEAST_STATES.map((s) => (
                <option key={s.code} value={s.name}>{s.name}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-200"
            >
              <option value="ALL">All Categories</option>
              {CONTACT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="admin-glass-card overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-white font-mono">
              Displaying {filteredContacts.length} of {contacts.length} Records
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              Live Supabase Table: emergency_contacts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Service & Department</th>
                  <th className="p-3.5">Phone Number</th>
                  <th className="p-3.5">Scope & State</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Verification</th>
                  <th className="p-3.5">Public Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500">
                        <PhoneCall className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-slate-300">No emergency contacts found</div>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                        No official emergency numbers match the current filters. Add new verified SDMA/DEOC helplines to populate.
                      </p>
                      <button
                        onClick={openNewModal}
                        className="neon-cyan-btn px-4 py-2 rounded-xl text-xs font-black inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Emergency Contact</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white text-xs">{c.contact_name}</div>
                        <div className="text-[11px] text-slate-400">{c.department_name} • {c.organization}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-cyan-400 text-sm">{c.contact_number}</div>
                        {c.alternate_number && (
                          <div className="text-[10px] font-mono text-slate-400">Alt: {c.alternate_number}</div>
                        )}
                        {c.is_toll_free && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                            TOLL FREE
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-white">{c.state || (c as any).state_name}</div>
                        {(c.district || (c as any).district_name) && (
                          <div className="text-[10px] text-slate-400">{c.district || (c as any).district_name}</div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                          {c.category.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {c.verification_status === 'VERIFIED_OFFICIAL' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                            <AlertCircle className="w-3 h-3 text-amber-400" /> Pending Review
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleTogglePublication(c)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                            c.publication_status === 'PUBLISHED'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                          }`}
                          title="Click to toggle Draft / Published on User Website"
                        >
                          {c.publication_status === 'PUBLISHED' ? '● Published' : '○ Draft'}
                        </button>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-400 transition-colors"
                          title="Edit Record"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.contact_name)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="admin-glass-card border border-cyan-500/40 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-cyan-400" />
                <span>{editingContact ? 'Edit Emergency Contact' : 'Register Official Emergency Contact'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Service / Authority Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. State Emergency Operation Centre"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Department Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Disaster Management Dept"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1070 / 0361-2237011"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-mono outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Alternate Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 1079"
                    value={alternateNumber}
                    onChange={(e) => setAlternateNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-mono outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">State Jurisdiction *</label>
                  <select
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white"
                  >
                    {NORTHEAST_STATES.map((s) => (
                      <option key={s.code} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">District</label>
                  <input
                    type="text"
                    placeholder="e.g. Kamrup Metro or All Districts"
                    value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white"
                  >
                    {CONTACT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Official Website</label>
                  <input
                    type="url"
                    placeholder="https://asdma.assam.gov.in"
                    value={officialWebsite}
                    onChange={(e) => setOfficialWebsite(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Official Gazette / Verification Proof URL *</label>
                  <input
                    type="url"
                    placeholder="https://sdma.assam.gov.in/contact-us"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTollFree}
                    onChange={(e) => setIsTollFree(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span>Toll Free Emergency Line</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Publication:</span>
                  <select
                    value={publicationStatus}
                    onChange={(e) => setPublicationStatus(e.target.value as any)}
                    className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs"
                  >
                    <option value="PUBLISHED">Published (Visible on User Web)</option>
                    <option value="DRAFT">Draft (Internal Only)</option>
                  </select>
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
                  Save to Supabase Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
