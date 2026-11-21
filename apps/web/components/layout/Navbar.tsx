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
  Lock,
  Home,
  Map,
  Bell,
  Activity,
  Compass,
  FileText,
  Sparkles,
  LifeBuoy,
  Info
} from 'lucide-react';
import { NORTHEAST_STATES } from '@shared/northeast-data';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { SupportedLanguage } from '@/lib/i18n/translations';
import { isAuthorizedAdmin } from '@/lib/admin-auth';

export function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage, t, languages } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedStateCode, setSelectedStateCode] = useState<string>('AS');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');
  const [userSession, setUserSession] = useState<any>(null);

  useEffect(() => {
    setMenuOpen(false);
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
    { href: '/', label: t('nav.home', 'Home'), icon: Home, desc: 'Overview & Highlights' },
    { href: '/map', label: t('nav.liveMap', 'Live Map'), icon: Map, desc: '3D Terrain & Basins' },
    { href: '/alerts', label: t('nav.alerts', 'Alerts'), icon: Bell, desc: 'Official Warnings' },
    { href: '/monitoring', label: t('nav.monitoring', 'Monitoring'), icon: Activity, desc: 'River & Weather' },
    { href: '/shelters', label: t('nav.shelters', 'Shelters'), icon: LifeBuoy, desc: 'Relief Camps' },
    { href: '/evacuation', label: t('nav.evacuation', 'Evacuation'), icon: Compass, desc: 'GPS Safe Routes' },
    { href: '/reports', label: t('nav.reports', 'Reports'), icon: FileText, desc: 'Community Hazard' },
    { href: '/preparedness', label: t('nav.preparedness', 'Preparedness'), icon: ShieldCheck, desc: 'Disaster Checklists' },
    { href: '/about', label: t('nav.about', 'About'), icon: Info, desc: 'Platform Directorate' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xs">
      
      {/* Top Emergency Notice Ticker */}
      <div className="bg-gradient-to-r from-rose-600 via-slate-900 to-rose-600 text-white text-[10px] font-medium py-0.5 px-3 text-center tracking-wide flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
        <span className="truncate">{t('topbar.notice', 'NORTHEAST EMERGENCY DISPATCH NETWORK — 8 STATES ACTIVE SURVEILLANCE')}</span>
        <span className="hidden md:inline text-white/70">| SEOC: 1070 | National: 112</span>
      </div>

      {/* ==================================================================== */}
      {/* MAIN NAVBAR ROW: ZERO OVERLAY, STRICTLY ISOLATED LEFT & RIGHT ZONES  */}
      {/* ==================================================================== */}
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3 w-full">
          
          {/* ZONE 1 (LEFT): LOGO, BRAND & ADMIN PORTAL BUTTON */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            {/* Logo & Brand */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl liquid-glass-emergency-btn flex items-center justify-center text-white shadow-emergency-glow group-hover:scale-105 transition-transform shrink-0">
                <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="shrink-0 flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-cyan transition-colors">
                  NE-RESQ
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200">
                  8-STATE
                </span>
              </div>
            </Link>

            {/* Admin Portal Button */}
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-950 text-cyan-400 border border-cyan-500/40 shadow-xs hover:border-cyan-400 hover:scale-102 active:scale-98 transition-all text-xs font-bold tracking-wide shrink-0 group"
              title="Super Admin Command Clearance Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span className="font-extrabold whitespace-nowrap">Admin Portal</span>
            </Link>
          </div>

          {/* ZONE 2 (RIGHT): CONTROLS & 3-LINE MENU TOGGLE */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* 8-State Dropdown (Assam location selector) - hidden on small mobile, available in menu */}
            <div className="relative shrink-0 hidden md:block">
              <select
                value={selectedStateCode}
                onChange={(e) => {
                  setSelectedStateCode(e.target.value);
                  setSelectedDistrict('All Districts');
                }}
                className="appearance-none pl-5 pr-5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-800 shadow-2xs cursor-pointer hover:border-cyan focus:outline-none"
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

            {/* Language Selector (English / Multilingual) - hidden on small mobile, available in menu */}
            <div className="relative shrink-0 hidden sm:block">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="appearance-none pl-5 pr-5 py-1.5 rounded-lg text-xs font-bold bg-white border border-emerald-500/40 text-slate-800 shadow-2xs cursor-pointer hover:border-emerald-600 focus:outline-none"
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
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-cyan-400 border border-cyan-500/50 shadow-xs hover:bg-slate-950 transition-colors shrink-0"
              >
                <Lock className="w-3 h-3 text-cyan-400" />
                <span>Admin</span>
              </Link>
            ) : userSession ? (
              <Link
                href="/profile"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-800 hover:text-cyan shadow-2xs transition-colors shrink-0"
              >
                <User className="w-3 h-3 text-cyan" />
                <span>Profile</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-800 hover:text-cyan shadow-2xs transition-colors shrink-0"
              >
                <User className="w-3 h-3 text-slate-500" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Emergency SOS Button */}
            <Link
              href="/sos"
              className="liquid-glass-emergency-btn text-white px-3 py-1.5 rounded-lg font-black text-xs tracking-wider inline-flex items-center gap-1 shadow-emergency-glow hover:scale-102 active:scale-98 transition-transform shrink-0"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>{t('nav.sos', 'SOS')}</span>
            </Link>

            {/* 3-LINE MENU HAMBURGER BUTTON */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs border shrink-0 ${
                menuOpen
                  ? 'bg-slate-950 text-white border-slate-950'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
              }`}
              aria-label="Toggle Navigation Menu"
              title="Navigation Menu"
            >
              {menuOpen ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4 text-slate-800" />}
              <span className="hidden sm:inline">Menu</span>
            </button>

          </div>

        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3-LINE MENU DRAWER: FULL NAVIGATION PORTAL DESK                      */}
      {/* ==================================================================== */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white/98 backdrop-blur-2xl shadow-2xl transition-all">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 space-y-4">
            
            {/* Mobile Controls (when hidden on mobile viewports) */}
            <div className="md:hidden grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
              <div className="relative">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">State</label>
                <select
                  value={selectedStateCode}
                  onChange={(e) => {
                    setSelectedStateCode(e.target.value);
                    setSelectedDistrict('All Districts');
                  }}
                  className="w-full pl-5 pr-5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-800"
                >
                  {NORTHEAST_STATES.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.name}
                    </option>
                  ))}
                </select>
                <MapPin className="w-3 h-3 text-rose-500 absolute left-1.5 top-7 pointer-events-none" />
              </div>

              <div className="relative">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="w-full pl-5 pr-5 py-1.5 rounded-lg text-xs font-bold bg-white border border-emerald-500/40 text-slate-800"
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.nativeName}
                    </option>
                  ))}
                </select>
                <Globe className="w-3 h-3 text-emerald-600 absolute left-1.5 top-7 pointer-events-none" />
              </div>
            </div>

            {/* Header info */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="font-extrabold uppercase tracking-wider text-slate-500 text-[11px]">
                  All Navigation Modules
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                10 Regional Disaster &amp; Safety Portals
              </span>
            </div>

            {/* Grid of All 10 Navigation Links with Icons & Descriptions */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const IconComponent = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`p-3 rounded-xl flex items-center gap-3 transition-all ${
                      isActive
                        ? 'bg-cyan-50 border border-cyan-300 text-cyan-900 font-bold shadow-xs'
                        : 'bg-slate-50/90 hover:bg-white border border-slate-200/80 text-slate-700 hover:text-slate-950 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-cyan-500 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200/80'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{link.label}</div>
                      <div className="text-[10px] text-slate-400 truncate">{link.desc}</div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Footer Quick Access Strip */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <Link
                  href="/admin/login"
                  onClick={() => setMenuOpen(false)}
                  className="font-bold text-cyan-700 hover:underline flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Official Super Admin Directorate &rarr;</span>
                </Link>
                <Link
                  href="/sos"
                  onClick={() => setMenuOpen(false)}
                  className="font-bold text-rose-600 hover:underline flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5 text-rose-500" />
                  <span>Emergency SOS Dispatch &rarr;</span>
                </Link>
              </div>
              <div className="text-[11px] text-slate-400">
                Toll-Free Emergency: <strong className="text-slate-700 font-bold">1070</strong> (SEOC) &bull; <strong className="text-slate-700 font-bold">112</strong> (National)
              </div>
            </div>

          </div>
        </div>
      )}

    </header>
  );
}
