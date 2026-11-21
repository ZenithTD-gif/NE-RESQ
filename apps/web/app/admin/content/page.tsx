'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { FileText, Plus, CheckCircle, Pin, Trash2, RefreshCw, X, AlertCircle } from 'lucide-react';

interface WebsiteContent {
  id: string;
  title: string;
  content_type: string;
  category: string;
  language_code: string;
  is_pinned: boolean;
  publication_status: string;
  summary: string;
  content_body: string;
  created_at: string;
}

export default function WebsiteContentPage() {
  const [contentList, setContentList] = useState<WebsiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content_type: 'SAFETY_GUIDELINE',
    category: 'GENERAL',
    language_code: 'en',
    summary: '',
    content_body: '',
    is_pinned: false,
    publication_status: 'PUBLISHED',
  });

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setContentList(data.data);
      } else {
        setContentList([]);
      }
    } catch {
      setContentList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setFormData({
          title: '',
          content_type: 'SAFETY_GUIDELINE',
          category: 'GENERAL',
          language_code: 'en',
          summary: '',
          content_body: '',
          is_pinned: false,
          publication_status: 'PUBLISHED',
        });
        fetchContent();
      } else {
        setErrorMessage(data.error || 'Failed to publish content');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error while publishing content');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content record from Supabase?')) return;
    try {
      const res = await fetch(`/api/admin/content?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setContentList(prev => prev.filter(c => c.id !== id));
      } else {
        alert(data.error || 'Failed to delete record');
      }
    } catch (err: any) {
      alert(err.message || 'Network error during deletion');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Website Content & Advisory Management"
        subtitle="Manage Citizen Safety Guidelines, Announcements, Notices & Preparedness Instructions in Supabase"
      />
      <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={fetchContent}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-2 text-xs font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Refresh</span>
            </button>
            <span className="text-xs font-mono font-bold text-cyan-400 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              {contentList.length} Published Articles
            </span>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="neon-emerald-btn px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New Advisory</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            <span>Fetching website advisories and safety guidelines from Supabase...</span>
          </div>
        ) : contentList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contentList.map((art) => (
              <div
                key={art.id}
                className="admin-glass-card admin-glass-card-hover p-5 space-y-3 border border-slate-800 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 text-[10px] font-mono font-bold">
                      {art.content_type.replace(/_/g, ' ')}
                    </span>
                    {art.is_pinned && (
                      <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                        <Pin className="w-3 h-3 text-amber-400" /> Pinned
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-2">{art.title}</h4>
                  {art.summary && <p className="text-xs text-slate-400 line-clamp-3">{art.summary}</p>}
                </div>

                <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>{art.language_code.toUpperCase()}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-semibold text-[11px]">● {art.publication_status}</span>
                    <button
                      onClick={() => handleDelete(art.id)}
                      className="p-1 rounded hover:bg-rose-500/20 text-rose-400 transition-colors"
                      title="Delete Article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="admin-glass-card p-16 text-center space-y-4">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">No Website Content or Advisories Published Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No articles or disaster safety manuals exist in the Supabase database. Add the first official advisory using the button below.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="neon-emerald-btn px-5 py-2.5 rounded-xl text-xs font-black inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Safety Guideline</span>
            </button>
          </div>
        )}
      </div>

      {/* Publish Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="admin-glass-card max-w-2xl w-full p-6 space-y-4 border border-cyan-500/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Publish Official Website Content / Guideline</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Article Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NDMA Standard 72-Hour Survival Kit Guidelines"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Content Type</label>
                  <select
                    value={formData.content_type}
                    onChange={e => setFormData({ ...formData, content_type: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-cyan-400"
                  >
                    <option value="SAFETY_GUIDELINE">SAFETY GUIDELINE</option>
                    <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
                    <option value="IMPORTANT_NOTICE">IMPORTANT NOTICE</option>
                    <option value="FAQ">FAQ</option>
                    <option value="SURVIVAL_CHECKLIST">SURVIVAL CHECKLIST</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Language Code</label>
                  <select
                    value={formData.language_code}
                    onChange={e => setFormData({ ...formData, language_code: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-cyan-400"
                  >
                    <option value="en">English (en)</option>
                    <option value="as">Assamese (as)</option>
                    <option value="bn">Bengali (bn)</option>
                    <option value="hi">Hindi (hi)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Summary</label>
                <input
                  type="text"
                  placeholder="Short brief of this guideline..."
                  value={formData.summary}
                  onChange={e => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Full Article Body *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Full text of the emergency notice, safety steps or survival checklist..."
                  value={formData.content_body}
                  onChange={e => setFormData({ ...formData, content_body: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.is_pinned}
                    onChange={e => setFormData({ ...formData, is_pinned: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-400 focus:ring-0"
                  />
                  <span>Pin to Top of Website</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="neon-emerald-btn px-5 py-2 rounded-xl font-black disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Save & Publish to Supabase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
