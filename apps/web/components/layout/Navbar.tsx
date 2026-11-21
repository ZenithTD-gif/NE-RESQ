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
  Layers,
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
    <header className="sticky top-0 z-50 w-full liquid-glass-navbar">
      {/* Top emergency broadcast notice bar */}
      <div className="bg-gradient-to-r from-emergency via-charcoal to-emergency text-white text-[11px] font-semibold py-1 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
        <span>{t('topbar.notice', 'NORTHEAST EMERGENCY DISPATCH NETWORK — 8 STATES ACTIVE REGIONAL SURVEILLANCE')}</span>
        <span className="hidden md:inline text-white/80">| {t('topbar.helplines', 'SEOC Toll Free: 1070 | National: 112')}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-4 w-full">
          
          {/* LEFT & CENTER GROUP: Logo + Admin Portal Button + Left-Shifted Navigation Menu */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 lg:gap-4 min-w-0">
            {/* Logo & Brand */}
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl liquid-glass-emergency-btn flex items-center justify-center text-white shadow-emergency-glow group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base sm:text-lg lg:text-xl tracking-tight text-charcoal group-hover:text-cyan transition-colors">
                    NE-RESQ
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-cyan-50 text-cyan border border-cyan-200">
                    8-STATE
                  </span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-charcoal-muted -mt-0.5 font-medium hidden sm:block">
                  Northeast Emergency &amp; Disaster Platform
                </p>
              </div>
            </Link>

            {/* Admin Portal Button — Positioned immediately beside the logo */}
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-950/95 text-cyan-400 border border-cyan-500/40 shadow-cyan-glow hover:bg-slate-900 hover:border-cyan-400 hover:scale-105 active:scale-95 transition-all text-[11px] sm:text-xs font-bold tracking-wide shrink-0 group backdrop-blur-md"
              title="Super Admin Command Clearance Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span className="font-extrabold">Admin Portal</span>
            </Link>

            {/* Navigation Menu: Shifted toward left, starts right after Admin Portal and flows naturally */}
            <nav className="hidden xl:flex items-center gap-1 2xl:gap-1.5 text-xs font-semibold text-charcoal pl-1 2xl:pl-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-2.5 2xl:px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-cyan-50 text-cyan font-bold border border-cyan-200 shadow-xs'
                        : 'text-charcoal-muted hover:text-charcoal hover:bg-white/80'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* RIGHT: Controls (State Selector, Language Selector, Sign In/Profile, SOS, Mobile Menu Toggle) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* 8-State Dropdown */}
            <div className="relative hidden md:block">
              <select
                value={selectedStateCode}
                onChange={(e) => {
                  setSelectedStateCode(e.target.value);
                  setSelectedDistrict('All Districts');
                }}
                className="appearance-none pl-7 pr-7 py-1.5 rounded-full text-xs font-semibold bg-white/95 border border-sky-200/90 text-charcoal shadow-xs cursor-pointer hover:border-cyan focus:outline-none"
              >
                {NORTHEAST_STATES.map((st) => (
                  <option key={st.code} value={st.code} className="bg-white text-charcoal">
                    {st.name}
                  </option>
                ))}
              </select>
              <MapPin className="w-3.5 h-3.5 text-emergency absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3 h-3 text-charcoal-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Language Selector */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="appearance-none pl-7 pr-7 py-1.5 rounded-full text-xs font-bold bg-white/95 border border-emerald-500/40 text-charcoal shadow-xs cursor-pointer hover:border-emerald-600 focus:outline-none ring-1 ring-emerald-500/20"
                aria-label="Select Language"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code} className="bg-white text-charcoal">
                    {l.nativeName} ({l.name})
                  </option>
                ))}
              </select>
              <Globe className="w-3.5 h-3.5 text-emerald-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3 h-3 text-charcoal-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* User Session Pill */}
            {userSession && isAuthorizedAdmin(userSession.role) ? (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-900 text-cyan-400 border border-cyan-500/50 shadow-cyan-glow hover:bg-slate-950 transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Admin Command</span>
              </Link>
            ) : userSession ? (
              <Link
                href="/profile"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/90 border border-sky-200 text-charcoal hover:text-cyan shadow-xs transition-colors"
              >
                <User className="w-3.5 h-3.5 text-cyan" />
                <span>Profile</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/90 border border-sky-200 text-charcoal hover:text-cyan shadow-xs transition-colors"
              >
                <User className="w-3.5 h-3.5 text-charcoal-muted" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Emergency SOS Button */}
            <Link
              href="/sos"
              className="liquid-glass-emergency-btn text-white px-3 sm:px-4 py-1.5 rounded-full font-black text-xs tracking-wider flex items-center gap-1.5 shadow-emergency-glow hover:scale-105 active:scale-95 transition-transform"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>{t('nav.sos', 'SOS')}</span>
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-charcoal hover:bg-white/80 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-charcoal" /> : <Menu className="w-6 h-6 text-charcoal" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-sky-200 bg-background/95 backdrop-blur-2xl p-4 space-y-3 shadow-lg">
          {/* Quick Admin Portal Callout on Mobile */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-cyan-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold">Official Administration</span>
            </div>
            <Link
              href="/admin/login"
              className="px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-black hover:bg-cyan-500/30 transition-colors"
            >
              Super Admin Login →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`p-2.5 rounded-xl font-semibold transition-colors ${
                  pathname === link.href
                    ? 'bg-cyan-50 text-cyan border border-cyan-200 font-bold'
                    : 'text-charcoal-muted hover:text-charcoal hover:bg-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-sky-200 flex items-center justify-between gap-2">
            {userSession && isAuthorizedAdmin(userSession.role) ? (
              <Link
                href="/admin"
                className="flex-1 text-center py-2 rounded-xl bg-slate-900 border border-cyan-500/50 text-xs font-bold text-cyan-400"
              >
                Admin Command
              </Link>
            ) : userSession ? (
              <Link
                href="/profile"
                className="flex-1 text-center py-2 rounded-xl bg-white border border-sky-200 text-xs font-bold text-charcoal hover:border-cyan"
              >
                My Profile
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex-1 text-center py-2 rounded-xl bg-white border border-sky-200 text-xs font-bold text-charcoal hover:border-cyan"
              >
                Sign In
              </Link>
            )}
            <Link
              href="/sos"
              className="flex-1 text-center py-2 rounded-xl liquid-glass-emergency-btn text-xs font-black text-white"
            >
              Emergency SOS
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
