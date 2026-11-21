'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldAlert, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authenticateUser } from '@/lib/admin-auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const errorParam = searchParams.get('error');
  const noticeParam = searchParams.get('notice');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    errorParam === 'admin_clearance_required'
      ? 'Administrative clearance required. Please log in with an authorized official account.'
      : errorParam === 'invalid_session'
      ? 'Your session has expired. Please sign in again.'
      : ''
  );
  const [successNotice, setSuccessNotice] = useState(
    noticeParam === 'pending_approval'
      ? 'Official registration submitted. Account is pending review by the Super Administrator.'
      : noticeParam === 'logged_out'
      ? 'You have safely signed out of your session.'
      : ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });

      const result = await res.json();

      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
        setLoading(false);
        return;
      }

      if (typeof window !== 'undefined' && result.user) {
        localStorage.setItem('neresq_auth_user', JSON.stringify(result.user));
        document.cookie = `neresq_role=${result.user.role}; path=/; max-age=86400`;
      }

      const target = redirectParam || result.redirectUrl || '/profile';
      router.push(target);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl liquid-glass-emergency-btn flex items-center justify-center text-white shadow-emergency-glow">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-charcoal tracking-tight">
            Sign In to NE-RESQ
          </h1>
          <p className="text-xs text-charcoal-muted">
            Unified access for Citizens, Field Teams & Official Disaster Administrators (Supabase Verified)
          </p>
        </div>

        {/* Notices & Errors */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 shadow-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Login Card */}
        <div className="liquid-glass-card p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal">Official or Personal Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs font-semibold p-3 pl-9 rounded-xl border border-sky-200 bg-white/90 text-charcoal outline-none focus:border-cyan"
                />
                <Mail className="w-4 h-4 text-charcoal-muted absolute left-3 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-charcoal">Password</label>
                <span className="text-[11px] text-cyan hover:underline cursor-pointer">
                  Forgot Password?
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs font-semibold p-3 pl-9 rounded-xl border border-sky-200 bg-white/90 text-charcoal outline-none focus:border-cyan"
                />
                <Lock className="w-4 h-4 text-charcoal-muted absolute left-3 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-charcoal hover:bg-slate-900 text-white font-extrabold text-xs tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying with Supabase...</span>
              ) : (
                <>
                  <span>SIGN IN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Super Admin Directorate Gateway Link */}
          <div className="pt-4 border-t border-sky-100 space-y-2">
            <span className="text-[10px] font-bold text-charcoal-muted uppercase tracking-wider block text-center">
              Official Administration
            </span>
            <Link
              href="/admin/login"
              className="w-full p-2.5 rounded-xl border border-cyan-300 bg-cyan-50/80 hover:bg-cyan-100 text-[11px] font-bold text-cyan-900 transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-600" />
              <span>Super Administrator Directorate Login &rarr;</span>
            </Link>
          </div>

          <div className="text-center text-xs text-charcoal-muted">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-cyan hover:underline">
              Create an account or request admin clearance
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs font-semibold">Loading authentication...</div>}>
      <LoginForm />
    </Suspense>
  );
}
