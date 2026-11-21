'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Phone, Mail, MapPin, ShieldCheck, LogOut, Radio, ArrowRight, ShieldAlert, Clock, Layers, Loader2 } from 'lucide-react';
import { isAuthorizedAdmin } from '@/lib/admin-auth';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function verifyAndLoadSession() {
      if (typeof window === 'undefined') return;

      const stored = localStorage.getItem('neresq_auth_user');
      if (!stored) {
        router.replace('/login?error=auth_required');
        return;
      }

      try {
        const parsed = JSON.parse(stored);
        if (!parsed || !parsed.email) {
          localStorage.removeItem('neresq_auth_user');
          document.cookie = 'neresq_role=; path=/; max-age=0';
          router.replace('/login?error=auth_required');
          return;
        }

        // Verify session live against Supabase database
        const res = await fetch(`/api/auth?action=verify&email=${encodeURIComponent(parsed.email)}&role=${parsed.role || 'CITIZEN'}`);
        const data = await res.json();

        if (!data.success || !data.user) {
          localStorage.removeItem('neresq_auth_user');
          document.cookie = 'neresq_role=; path=/; max-age=0';
          router.replace('/login?error=invalid_session');
          return;
        }

        if (isMounted) {
          // Update with live database profile
          setUser(data.user);
          localStorage.setItem('neresq_auth_user', JSON.stringify(data.user));
          setLoading(false);
        }
      } catch (err) {
        console.error('Session verification error:', err);
        localStorage.removeItem('neresq_auth_user');
        router.replace('/login?error=invalid_session');
      }
    }

    verifyAndLoadSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('neresq_auth_user');
      sessionStorage.removeItem('neresq_auth_user');
      document.cookie = 'neresq_role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    router.push('/login?notice=logged_out');
  };

  const isAdmin = user && isAuthorizedAdmin(user.role);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4">
        <div className="liquid-glass-card p-8 max-w-sm w-full text-center space-y-4">
          <Loader2 className="w-8 h-8 text-cyan animate-spin mx-auto" />
          <h2 className="text-sm font-bold text-charcoal">Verifying Account Security</h2>
          <p className="text-xs text-charcoal-muted">Checking Supabase authentication credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Profile Header Card */}
      <div className="liquid-glass-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan to-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-md">
            {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-charcoal">{user?.full_name || 'Citizen User'}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isAdmin ? 'bg-cyan-100 text-cyan-800 border border-cyan-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {user?.role || 'CITIZEN'}
              </span>
            </div>
            <p className="text-xs text-charcoal-muted mt-0.5">{user?.department || 'Citizen Safety Account'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-2 transition-colors self-end sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Admin Quick Entry if authorized */}
      {isAdmin && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0B0F19] to-slate-900 border border-cyan-500/40 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-black text-white flex items-center gap-2">
                <span>Official Administrator Command Portal</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                  CLEARANCE ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Manage emergency helplines, broadcast disaster alerts, verify shelters & audit actions.
              </p>
            </div>
          </div>
          <Link
            href="/admin/dashboard"
            className="neon-cyan-btn px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <span>ENTER ADMIN PORTAL</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Account Information Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="liquid-glass-card p-5 space-y-4">
          <h3 className="font-extrabold text-sm text-charcoal flex items-center gap-2">
            <User className="w-4 h-4 text-cyan" />
            <span>Profile Information</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-sky-100">
              <span className="text-charcoal-muted">Official Email</span>
              <span className="font-bold text-charcoal">{user?.email}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-sky-100">
              <span className="text-charcoal-muted">Phone Number</span>
              <span className="font-bold text-charcoal">{user?.phone || 'Not configured'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-sky-100">
              <span className="text-charcoal-muted">Jurisdiction State</span>
              <span className="font-bold text-charcoal">{user?.state || 'Assam'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-charcoal-muted">District</span>
              <span className="font-bold text-charcoal">{user?.district || 'Kamrup Metropolitan'}</span>
            </div>
          </div>
        </div>

        <div className="liquid-glass-card p-5 space-y-4">
          <h3 className="font-extrabold text-sm text-charcoal flex items-center gap-2">
            <Radio className="w-4 h-4 text-emergency" />
            <span>Emergency Operations</span>
          </h3>
          <p className="text-xs text-charcoal-muted">
            Quick links to report disasters, track active emergency rescue requests, and check shelters.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link
              href="/sos"
              className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold hover:bg-rose-100 transition-colors text-center"
            >
              Broadcast SOS
            </Link>
            <Link
              href="/shelters"
              className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold hover:bg-sky-100 transition-colors text-center"
            >
              Nearby Shelters
            </Link>
            <Link
              href="/evacuation"
              className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors text-center"
            >
              Evacuation Route
            </Link>
            <Link
              href="/portal/citizen"
              className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-charcoal text-xs font-bold hover:bg-slate-200 transition-colors text-center"
            >
              SOS Tracking
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
