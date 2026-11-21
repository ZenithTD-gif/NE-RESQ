'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, User, Mail, Lock, Phone, Building2, MapPin, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { registerUser, ADMIN_ROLES, AdminRole } from '@/lib/admin-auth';
import { NORTHEAST_STATES, NORTHEAST_DISTRICTS } from '@shared/northeast-data';

export default function RegisterPage() {
  const router = useRouter();
  const [isAdminRequest, setIsAdminRequest] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedState, setSelectedState] = useState('Assam');
  const [selectedDistrict, setSelectedDistrict] = useState('Kamrup Metropolitan');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [requestedRole, setRequestedRole] = useState<AdminRole>('STATE_ADMIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableDistricts = NORTHEAST_DISTRICTS.filter(
    (d) => d.stateName.toLowerCase() === selectedState.toLowerCase()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email,
          password,
          full_name: fullName,
          phone,
          is_admin_request: isAdminRequest,
          department: isAdminRequest ? department : 'Citizen',
          designation: isAdminRequest ? designation : 'Resident',
          role: requestedRole,
          state_id: selectedState,
          district_id: selectedDistrict,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        setError(result.error || 'Registration failed.');
        setLoading(false);
        return;
      }

      if (isAdminRequest) {
        router.push('/login?notice=pending_approval');
      } else {
        if (typeof window !== 'undefined' && result.user) {
          localStorage.setItem('neresq_auth_user', JSON.stringify(result.user));
          document.cookie = `neresq_role=CITIZEN; path=/; max-age=86400`;
        }
        router.push('/profile');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl liquid-glass-emergency-btn flex items-center justify-center text-white shadow-emergency-glow">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-charcoal tracking-tight">
            Create an Account
          </h1>
          <p className="text-xs text-charcoal-muted">
            Join the Northeast Regional Emergency & Disaster Resilience Network
          </p>
        </div>

        {/* Account Type Selector Toggle */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-white/80 border border-sky-200 text-xs font-bold shadow-xs">
          <button
            type="button"
            onClick={() => setIsAdminRequest(false)}
            className={`py-2.5 rounded-xl transition-all ${
              !isAdminRequest
                ? 'bg-charcoal text-white shadow-xs'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            Citizen Resident
          </button>
          <button
            type="button"
            onClick={() => setIsAdminRequest(true)}
            className={`py-2.5 rounded-xl transition-all ${
              isAdminRequest
                ? 'bg-charcoal text-white shadow-xs'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            Official Staff / Admin Clearance
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 shadow-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Card */}
        <div className="liquid-glass-card p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Goswami"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs font-semibold p-3 pl-9 rounded-xl border border-sky-200 bg-white/90 text-charcoal outline-none focus:border-cyan"
                />
                <User className="w-4 h-4 text-charcoal-muted absolute left-3 top-3.5" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder={isAdminRequest ? 'officer@sdma.gov.in' : 'name@example.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs font-semibold p-3 pl-9 rounded-xl border border-sky-200 bg-white/90 text-charcoal outline-none focus:border-cyan"
                  />
                  <Mail className="w-4 h-4 text-charcoal-muted absolute left-3 top-3.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal">Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="+91 9435000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs font-semibold p-3 pl-9 rounded-xl border border-sky-200 bg-white/90 text-charcoal outline-none focus:border-cyan"
                  />
                  <Phone className="w-4 h-4 text-charcoal-muted absolute left-3 top-3.5" />
                </div>
              </div>
            </div>

            {/* Admin-Specific Fields */}
            {isAdminRequest && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Administrative Clearance Application (Requires Super Admin Approval)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-charcoal">Department / Agency</label>
                    <input
                      type="text"
                      required={isAdminRequest}
                      placeholder="e.g. ASDMA / Fire & Emergency"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full text-xs font-semibold p-2.5 rounded-xl border border-sky-200 bg-white text-charcoal"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-charcoal">Official Designation</label>
                    <input
                      type="text"
                      required={isAdminRequest}
                      placeholder="e.g. Field Officer / Project Officer"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full text-xs font-semibold p-2.5 rounded-xl border border-sky-200 bg-white text-charcoal"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-charcoal">Requested Role Scope</label>
                  <select
                    value={requestedRole}
                    onChange={(e) => setRequestedRole(e.target.value as AdminRole)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-sky-200 bg-white text-charcoal"
                  >
                    {ADMIN_ROLES.filter((r) => r.code !== 'SUPER_ADMIN').map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal">Jurisdiction State</label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                  }}
                  className="w-full text-xs font-semibold p-3 rounded-xl border border-sky-200 bg-white/90 text-charcoal"
                >
                  {NORTHEAST_STATES.map((s) => (
                    <option key={s.code} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal">District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full text-xs font-semibold p-3 rounded-xl border border-sky-200 bg-white/90 text-charcoal"
                >
                  {availableDistricts.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal">Password</label>
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

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal">Confirm Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-xs font-semibold p-3 pl-9 rounded-xl border border-sky-200 bg-white/90 text-charcoal outline-none focus:border-cyan"
                  />
                  <Lock className="w-4 h-4 text-charcoal-muted absolute left-3 top-3.5" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-charcoal hover:bg-slate-900 text-white font-extrabold text-xs tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md disabled:opacity-50"
            >
              {loading ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>{isAdminRequest ? 'SUBMIT ADMIN APPLICATION' : 'REGISTER ACCOUNT'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-charcoal-muted">
            Already registered?{' '}
            <Link href="/login" className="font-bold text-cyan hover:underline">
              Sign in to your account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
