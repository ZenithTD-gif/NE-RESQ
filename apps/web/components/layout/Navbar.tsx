'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldAlert, 
  MapPin, 
  Globe, 
  Menu, 
  X, 
  Radio, 
  ChevronDown,
  User,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { NORTHEAST_STATES } from '@shared/northeast-data';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { SupportedLanguage } from '@/lib/i18n/translations';
import { isAuthorizedAdmin } from '@/lib/admin-auth';

export function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage, t, languages } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedStateCode, setSelectedStateCode] = useState<string>('AS');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');
  const [userSession, setUserSession] = useState<any>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('neresq_auth_user');
      if (stored) {
        try {
          setUserSession(JSON.parse(stored));
        } catch {
          setUserSession(null);
        }
      } else {
        setUserSession(null);
      }
    }
  }, [pathname]);

  // Hide public user navigation inside the administrative command center
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { href: '/', label: t('nav.home', 'Home') },
    { href: '/map', label: t('nav.liveMap', 'Live Map') },
    { href: '/alerts', label: t('nav.alerts', 'Alerts') },
    { href: '/monitoring', label: t('nav.monitoring', 'Monitoring') },
    { href: '/shelters', label: t('nav.shelters', 'Shelters') },
    { href: '/evacuation', label: t('nav.evacuation', 'Evacuation') },
    { href: '/reports', label: t('nav.reports', 'Reports') },
    { href: '/assistant', label: t('nav.aiSafety', 'AI Safety') },
    { href: '/preparedness', label: t('nav.preparedness', 'Preparedness') },
    { href: '/about', label: t('nav.about', 'About') }
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-xl border-b border-slate-200/70 shadow-xs">
      
      {/* Ultra-slim Emergency Notice Ticker */}
      <div className="bg-gradient-to-r from-rose-600 via-slate-900 to-rose-600 text-white text-[10px] font-medium py-0.5 px-3 text-center tracking-wide flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
        <span className="truncate">{t('topbar.notice', 'NORTHEAST EMERGENCY DISPATCH NETWORK — 8 STATES ACTIVE SURVEILLANCE')}</span>
        <span className="hidden md:inline text-white/70">| SEOC: 1070 | National: 112</span>
      </div>

      {/* ==================================================================== */}
      {/* UPPER ROW: MINIMALIST STREAMLINED NAVIGATION TABS                   */}
      {/* ==================================================================== */}
      <div className="w-full border-b border-slate-200/50 bg-slate-50/50">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6">
          <nav className="flex items-center justify-center py-1 gap-1 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-800 font-bold border border-cyan-500/30 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* LOWER ROW: BRANDING, ADMIN PORTAL, SELECTORS & QUICK CONTROLS       */}
      {/* ==================================================================== */}
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-13 sm:h-14 gap-2 sm:gap-4 w-full">
          
          {/* LEFT: NE-RESQ LOGO, NAME & ADMIN PORTAL BUTTON */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Logo & Brand */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 rounded-xl liquid-glass-emergency-btn flex items-center justify-center text-white shadow-emergency-glow group-hover:scale-105 transition-transform shrink-0">
                <ShieldAlert className="w-4 h-4 text-white" />
              </div>
              <div className="shrink-0 flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-cyan transition-colors">
                  NE-RESQ
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-700 border border-cyan-200">
                  8-STATE
                </span>
              </div>
            </Link>

            {/* Admin Portal Button — Positioned beside Logo in Lower Row */}
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 text-cyan-400 border border-cyan-500/40 shadow-xs hover:border-cyan-400 hover:scale-102 active:scale-98 transition-all text-[11px] font-bold tracking-wide shrink-0 group"
              title="Super Admin Command Clearance Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span className="font-extrabold whitespace-nowrap">Admin Portal</span>
            </Link>
          </div>

          {/* RIGHT: LOCATION SELECTOR, LANGUAGE SELECTOR, SIGN IN & SOS CONTROLS */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* 8-State Dropdown (Assam location selector) */}
            <div className="relative shrink-0">
              <select
                value={selectedStateCode}
                onChange={(e) => {
                  setSelectedStateCode(e.target.value);
                  setSelectedDistrict('All Districts');
                }}
                className="appearance-none pl-5 pr-5 py-1 rounded-lg text-[11px] font-semibold bg-white/95 border border-slate-200 text-slate-800 shadow-2xs cursor-pointer hover:border-cyan focus:outline-none"
              >
                {NORTHEAST_STATES.map((st) => (
                  <option key={st.code} value={st.code} className="bg-white text-slate-800">
                    {st.name}
                  </option>
                ))}
              </select>
              <MapPin className="w-2.5 h-2.5 text-rose-500 absolute left-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-2.5 h-2.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Language Selector (English / Multilingual) */}
            <div className="relative shrink-0">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="appearance-none pl-5 pr-5 py-1 rounded-lg text-[11px] font-bold bg-white/95 border border-emerald-500/40 text-slate-800 shadow-2xs cursor-pointer hover:border-emerald-600 focus:outline-none"
                aria-label="Select Language"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code} className="bg-white text-slate-800">
                    {l.nativeName}
                  </option>
                ))}
              </select>
              <Globe className="w-2.5 h-2.5 text-emerald-600 absolute left-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-2.5 h-2.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* User Session Pill (Sign In / Profile) */}
            {userSession && isAuthorizedAdmin(userSession.role) ? (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900 text-cyan-400 border border-cyan-500/50 shadow-xs hover:bg-slate-950 transition-colors shrink-0"
              >
                <Lock className="w-3 h-3 text-cyan-400" />
                <span>Admin</span>
              </Link>
            ) : userSession ? (
              <Link
                href="/profile"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 text-slate-800 hover:text-cyan shadow-2xs transition-colors shrink-0"
              >
                <User className="w-3 h-3 text-cyan" />
                <span>Profile</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 text-slate-800 hover:text-cyan shadow-2xs transition-colors shrink-0"
              >
                <User className="w-3 h-3 text-slate-500" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Emergency SOS Button */}
            <Link
              href="/sos"
              className="liquid-glass-emergency-btn text-white px-3 py-1 rounded-lg font-black text-[11px] tracking-wider inline-flex items-center gap-1 shadow-emergency-glow hover:scale-102 active:scale-98 transition-transform shrink-0"
            >
              <Radio className="w-3 h-3 animate-pulse" />
              <span>{t('nav.sos', 'SOS')}</span>
            </Link>

            {/* Mobile / Tablet Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-slate-900" /> : <Menu className="w-4 h-4 text-slate-900" />}
            </button>

          </div>

        </div>
      </div>

      {/* ==================================================================== */}
      {/* MOBILE & TABLET COLLAPSIBLE MENU DRAWER                              */}
      {/* ==================================================================== */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-2xl p-3 space-y-2.5 shadow-lg">
          {/* Quick Admin Portal Callout on Mobile */}
          <div className="p-2.5 rounded-xl bg-slate-950 border border-cyan-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-bold">Official Administration</span>
            </div>
            <Link
              href="/admin/login"
              className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-black hover:bg-cyan-500/30 transition-colors"
            >
              Super Admin Login →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`p-2 rounded-lg font-semibold text-[11px] transition-colors ${
                  pathname === link.href
                    ? 'bg-cyan-50 text-cyan border border-cyan-200 font-bold'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
            {userSession && isAuthorizedAdmin(userSession.role) ? (
              <Link
                href="/admin"
                className="flex-1 text-center py-1.5 rounded-lg bg-slate-900 border border-cyan-500/50 text-xs font-bold text-cyan-400"
              >
                Admin Command
              </Link>
            ) : userSession ? (
              <Link
                href="/profile"
                className="flex-1 text-center py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:border-cyan"
              >
                My Profile
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex-1 text-center py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:border-cyan"
              >
                Sign In
              </Link>
            )}
            <Link
              href="/sos"
              className="flex-1 text-center py-1.5 rounded-lg liquid-glass-emergency-btn text-xs font-black text-white"
            >
              Emergency SOS
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
