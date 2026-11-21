'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  Radio,
  FileCheck2
} from 'lucide-react';
import { DisasterAlert } from '@/lib/admin-db';
import { NORTHEAST_STATES } from '@shared/northeast-data';

export default function DisasterAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<any | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'FLOOD' | 'LANDSLIDE' | 'EARTHQUAKE' | 'CYCLONE' | 'HEAVY_RAINFALL' | 'ROAD_BLOCKAGE' | 'OTHER'>('FLOOD');
  const [severity, setSeverity] = useState<'ADVISORY' | 'WATCH' | 'WARNING' | 'SEVERE_WARNING' | 'EMERGENCY'>('WARNING');
  const [urgency, setUrgency] = useState<'IMMEDIATE' | 'EXPECTED' | 'FUTURE'>('EXPECTED');
  const [description, setDescription] = useState('');
  const [safetyInstructions, setSafetyInstructions] = useState('');
  const [selectedState, setSelectedState] = useState('Assam');
  const [districtsInput, setDistrictsInput] = useState('Kamrup Metropolitan, Dibrugarh');
  const [sourceUrl, setSourceUrl] = useState('');
  const [agency, setAgency] = useState('Central Water Commission & ASDMA');
  const [publicationStatus, setPublicationStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/alerts');
      if (res.ok) {
        const json = await res.json();
        setAlerts(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load alerts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const openNewModal = () => {
    setEditingAlert(null);
    setTitle('');
    setCategory('FLOOD');
    setSeverity('WARNING');
    setUrgency('EXPECTED');
    setDescription('');
    setSafetyInstructions('');
    setSelectedState('Assam');
    setDistrictsInput('');
    setSourceUrl('');
    setAgency('State Disaster Management Authority (SDMA)');
    setPublicationStatus('PUBLISHED');
    setIsModalOpen(true);
  };

  const handleSaveAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      alert('Please provide alert headline and description.');
      return;
    }

    const payload = {
      id: editingAlert ? editingAlert.id : undefined,
      title: title.trim(),
      category,
      severity,
      urgency,
      description: description.trim(),
      safety_instructions: safetyInstructions.trim(),
      state: selectedState,
      district: districtsInput.trim() || 'All Districts',
      affected_districts: districtsInput.split(',').map(s => s.trim()).filter(Boolean),
      source_url: sourceUrl.trim() || 'https://ndma.gov.in',
      agency: agency.trim(),
      publication_status: publicationStatus,
    };

    try {
      const res = await fetch('/api/admin/alerts', {
        method: editingAlert ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        loadAlerts();
      } else {
        const errJson = await res.json();
        alert('Failed to save alert: ' + (errJson.error || 'Server error'));
      }
    } catch (err: any) {
      alert('Error saving alert: ' + err.message);
    }
  };

  const handleDelete = async (id: string, alertTitle: string) => {
    if (!confirm(`Are you sure you want to withdraw and delete "${alertTitle}" from the Supabase database?`)) {
      return;
    }
    try {
      await fetch(`/api/admin/alerts?id=${id}`, { method: 'DELETE' });
      loadAlerts();
    } catch (err) {
      console.error('Failed to delete alert', err);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchesSeverity = selectedSeverity === 'ALL' || a.severity === selectedSeverity;
    const matchesSearch = !searchQuery || 
      (a.headline || a.event || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.state_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader 
        title="Disaster Alert Management" 
        subtitle="Broadcast Official CAP-Compliant Weather, Flood, Landslide & Surge Advisories to User Website" 
      />

      <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        
        {/* Top Action Bar */}
        <div className="admin-glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-amber-glow">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Official CAP Alert Broadcast Engine</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono">
                  SUPABASE POSTGRESQL
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Published alerts surface directly on user live map banners and regional siren dispatch channels.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAlerts}
              title="Refresh Alerts"
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openNewModal}
              className="neon-emerald-btn px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Broadcast New Alert</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-glass-card p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search alerts by headline, state, or event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold p-3 pl-9 rounded-xl border border-slate-700 bg-slate-900 text-white outline-none focus:border-cyan-400"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          </div>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="text-xs p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-200"
          >
            <option value="ALL">All Severities</option>
            <option value="EMERGENCY">EMERGENCY</option>
            <option value="SEVERE_WARNING">SEVERE WARNING</option>
            <option value="WARNING">WARNING</option>
            <option value="WATCH">WATCH</option>
            <option value="ADVISORY">ADVISORY</option>
          </select>
        </div>

        {/* Alerts Grid / Empty State */}
        {filteredAlerts.length === 0 ? (
          <div className="admin-glass-card p-12 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">No active disaster alerts available</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                There are currently no active weather warnings or disaster advisories registered in the database.
              </p>
            </div>
            <button
              onClick={openNewModal}
              className="neon-emerald-btn px-5 py-2.5 rounded-xl text-xs font-black inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Broadcast New Alert</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="admin-glass-card p-5 space-y-3 flex flex-col justify-between border border-slate-800">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      alert.severity === 'EMERGENCY' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                      alert.severity === 'SEVERE_WARNING' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                      'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {alert.alert_identifier}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm">{alert.headline || alert.event}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{alert.description}</p>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
                    <span className="font-bold text-white block mb-0.5">Instructions:</span>
                    <span>{alert.instruction || 'Follow official SDMA advisories.'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-[10px] text-slate-400">
                    <span>Jurisdiction: </span>
                    <strong className="text-white">{alert.state_name}</strong>
                  </div>
                  <button
                    onClick={() => handleDelete(alert.id, alert.headline || alert.event)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 transition-colors"
                    title="Withdraw Alert"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Broadcast Alert Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="admin-glass-card border border-emerald-500/40 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-400" />
                <span>Broadcast Official CAP Disaster Alert</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveAlert} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Alert Title / Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brahmaputra Basin Inundation & Flash Flood Warning"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Disaster Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white"
                  >
                    <option value="FLOOD">FLOOD</option>
                    <option value="LANDSLIDE">LANDSLIDE</option>
                    <option value="EARTHQUAKE">EARTHQUAKE</option>
                    <option value="CYCLONE">CYCLONE</option>
                    <option value="HEAVY_RAINFALL">HEAVY RAINFALL</option>
                    <option value="ROAD_BLOCKAGE">ROAD BLOCKAGE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Severity Level</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white"
                  >
                    <option value="EMERGENCY">EMERGENCY (Critical Threat)</option>
                    <option value="SEVERE_WARNING">SEVERE WARNING</option>
                    <option value="WARNING">WARNING</option>
                    <option value="WATCH">WATCH</option>
                    <option value="ADVISORY">ADVISORY</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Urgency</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white"
                  >
                    <option value="IMMEDIATE">IMMEDIATE</option>
                    <option value="EXPECTED">EXPECTED</option>
                    <option value="FUTURE">FUTURE</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Alert Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail meteorological radar observations, water levels, and affected sectors..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Public Safety & Evacuation Instructions *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="List actionable steps for citizens, livestock relocation, and DEOC 1077 dispatch helplines..."
                  value={safetyInstructions}
                  onChange={(e) => setSafetyInstructions(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Primary State Jurisdiction</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white"
                  >
                    {NORTHEAST_STATES.map((s) => (
                      <option key={s.code} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Affected Districts (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Kamrup Metro, Dibrugarh, Dhemaji"
                    value={districtsInput}
                    onChange={(e) => setDistrictsInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white"
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
                  className="neon-emerald-btn px-5 py-2 rounded-xl text-xs font-black"
                >
                  Publish Alert to Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
