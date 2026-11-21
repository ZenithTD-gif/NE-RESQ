'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  Radio, 
  Clock, 
  MapPin, 
  PhoneCall, 
  ShieldCheck, 
  ArrowRight,
  Bookmark
} from 'lucide-react';
import { LiquidCard } from '@/components/ui/LiquidCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getQueuedSOSRequests } from '@/lib/offline-sync';
import { SOSRequest } from '@app-types';

export default function CitizenPortal() {
  const [mySOS, setMySOS] = useState<SOSRequest[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCitizenData() {
      try {
        const res = await fetch('/api/sos');
        if (res.ok) {
          const data = await res.json();
          setMySOS(data.data || []);
        }
        setOfflineQueue(getQueuedSOSRequests());
      } catch (err) {
        console.error('Failed to load citizen records', err);
      } finally {
        setLoading(false);
      }
    }
    loadCitizenData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-charcoal mb-1">
            <User className="w-3.5 h-3.5 text-emergency" />
            <span>CITIZEN EMERGENCY ACCOUNT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight">
            My Emergency Activity & SOS History
          </h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Track active emergency dispatches, offline submissions, and local district contacts.
          </p>
        </div>

        <Link
          href="/sos"
          className="liquid-glass-emergency-btn text-white text-xs font-bold px-4 py-2 rounded-full self-start sm:self-auto flex items-center gap-1.5 shadow-emergency-glow"
        >
          <Radio className="w-3.5 h-3.5" />
          <span>New SOS Alert</span>
        </Link>
      </div>

      {/* Offline Queue Section if any exist */}
      {offlineQueue.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-bold text-sm text-amber-800">
            Offline Queued Submissions (Device Local Storage)
          </h3>
          <div className="space-y-2">
            {offlineQueue.map((item, idx) => (
              <LiquidCard key={idx} className="p-4 border-l-4 border-l-amber-500 bg-amber-50/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-charcoal">{item.tempId}</span>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    {item.synced ? 'Synced ✓' : 'Pending synchronization — not yet delivered'}
                  </span>
                </div>
                <p className="text-xs text-charcoal-muted mt-1">{item.payload.locationAddress}</p>
              </LiquidCard>
            ))}
          </div>
        </section>
      )}

      {/* Registered SOS List */}
      <section className="space-y-4">
        <h3 className="font-bold text-base text-charcoal">
          Submitted Emergency Requests ({mySOS.length})
        </h3>

        {mySOS.length === 0 ? (
          <EmptyState
            title="No SOS Requests Submitted"
            description="You have not submitted any emergency requests. In a disaster event, use the emergency SOS button to notify rescue forces immediately."
            actionText="Go to Emergency SOS"
            onAction={() => window.location.href = '/sos'}
          />
        ) : (
          <div className="space-y-3">
            {mySOS.map((sos) => (
              <LiquidCard key={sos.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-charcoal">{sos.trackingId}</span>
                    <StatusBadge status={sos.status} size="sm" />
                  </div>
                  <h4 className="font-bold text-sm text-charcoal">{sos.category.replace(/_/g, ' ')}</h4>
                  <p className="text-xs text-charcoal-muted flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emergency shrink-0" />
                    <span>{sos.locationAddress} ({sos.district})</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-charcoal-muted">
                    {new Date(sos.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/sos/track/${sos.trackingId}`}
                    className="px-4 py-2 rounded-xl bg-charcoal text-white text-xs font-bold hover:bg-charcoal-light flex items-center gap-1"
                  >
                    <span>Track Live</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </LiquidCard>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
