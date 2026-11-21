'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  KeyRound,
  Server,
  Database,
  RefreshCw,
  Info
} from 'lucide-react';

function SuperAdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const noticeParam = searchParams.get('notice');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const [errorMessage, setErrorMessage] = useState(
    errorParam === 'admin_clearance_required'
      ? 'Security Protocol Enforced: Super Administrator clearance is required to enter the Command Directorate.'
      : errorParam === 'unauthorized_role'
      ? 'Access Denied: Your account does not have Super Administrator clearance.'
      : errorParam === 'invalid_session'
      ? 'Administrative session expired. Please authenticate again.'
      : ''
  );

  const [successNotice, setSuccessNotice] = useState(
    noticeParam === 'logged_out'
      ? 'You have safely signed out of the Super Administrator Command Portal.'
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
        body: JSON.stringify({
          action: 'login',
          email,
          password,
          super_admin_only: true,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed. Please verify your official administrator credentials.');
        setLoading(false);
        return;
      }

      if (typeof window !== 'undefined' && result.user) {
        localStorage.setItem('neresq_auth_user', JSON.stringify(result.user));
        document.cookie = `neresq_role=${result.user.role}; path=/; max-age=86400`;
      }

      // Route to Super Admin dashboard
      const target = result.redirectUrl || '/admin/dashboard';
      router.push(target);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred while connecting to Supabase security cluster.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col justify-between relative overflow-hidden text-slate-100">
      
      {/* Background Neon Glow Orbs */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      {/* Top Navigation Bar */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-7xl w-full mx-auto relative z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Public Portal</span>
        </Link>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Supabase Zero-Trust Gate</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="max-w-md w-full space-y-6">
          
          {/* Header & Logo */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-emerald-400 p-0.5 shadow-cyan-glow">
              <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center text-cyan-400">
                <ShieldCheck className="w-8 h-8" />
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest inline-block">
                Authoritative Directorate Clearance
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Super Admin Login
              </h1>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Secure access gateway for Northeast Emergency Incident Directors &amp; SDMA Super Administrators
              </p>
            </div>
          </div>

          {/* Notices */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-3 shadow-lg">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-3 shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Login Form Card */}
          <div className="admin-glass-card p-6 sm:p-8 space-y-5 border border-slate-800 shadow-2xl relative">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Official Directorate Email</span>
                  <span className="text-[10px] text-cyan-400 font-mono">GOV.IN REQUIRED</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="superadmin@neresq.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs font-semibold p-3 pl-10 rounded-xl border border-slate-700 bg-slate-900/90 text-white placeholder:text-slate-500 outline-none focus:border-cyan-400 transition-colors"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Administrative Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs font-semibold p-3 pl-10 pr-10 rounded-xl border border-slate-700 bg-slate-900/90 text-white placeholder:text-slate-500 outline-none focus:border-cyan-400 transition-colors font-mono"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-cyan-glow hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Verifying Super Admin Authorization...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>AUTHORIZE &amp; ENTER COMMAND PORTAL</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Strict Zero-Trust Authorization: All sign-in attempts are cryptographically timestamped in Supabase audit logs.</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-[11px] text-slate-500 relative z-10">
        Northeast Emergency Response &amp; Safety Platform (NE-RESQ) &bull; Official Incident Directorate
      </footer>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="admin-glass-card max-w-md w-full p-6 space-y-4 border border-cyan-500/30">
            <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-sm pb-3 border-b border-slate-800">
              <Info className="w-5 h-5 text-cyan-400" />
              <span>Super Administrator Credential Recovery</span>
            </div>
            
            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <p>
                Due to strict regional security protocols, Super Administrator clearance cannot be reset through public self-service links.
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <div className="text-cyan-400 font-bold">Standard Recovery Protocol:</div>
                <div>1. Contact SDMA State Headquarters or NDMA Directorate.</div>
                <div>2. Direct Supabase PostgreSQL Master Reset via encrypted CLI.</div>
                <div>3. Gazette verification of the Incident Commander.</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="neon-emerald-btn px-4 py-2 rounded-xl text-xs font-bold"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function SuperAdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070B14] flex items-center justify-center text-xs font-mono text-cyan-400">
        Loading Super Admin Security Gate...
      </div>
    }>
      <SuperAdminLoginForm />
    </Suspense>
  );
}
