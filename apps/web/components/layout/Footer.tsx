'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, PhoneCall, ExternalLink, ShieldCheck, Heart, Lock } from 'lucide-react';
import { OFFICIAL_EMERGENCY_HELPLINES, NORTHEAST_STATES } from '@shared/northeast-data';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function Footer() {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Hide public consumer footer inside administrative command center
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="w-full bg-white/85 backdrop-blur-md border-t border-sky-200/80 pt-12 pb-8 mt-16 text-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-sky-100">
          
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl liquid-glass-emergency-btn flex items-center justify-center text-white shadow-emergency-glow">
                <ShieldAlert className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-lg text-charcoal tracking-tight">NE-RESQ</span>
            </div>
            <p className="text-xs text-charcoal-muted leading-relaxed mb-4">
              {t('hero.desc', 'Northeast Emergency Response, Disaster Intelligence & Safety Platform. Real-time coordinated disaster surveillance and rescue network for all eight Northeast Indian states.')}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-flex shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Strict Zero-Mock Data Policy</span>
            </div>
          </div>

          {/* Quick Helplines */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal mb-3 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-emergency" />
              <span>Critical Emergency Numbers</span>
            </h4>
            <ul className="space-y-2 text-xs">
              {OFFICIAL_EMERGENCY_HELPLINES.slice(0, 5).map((h, i) => (
                <li key={i} className="flex items-center justify-between py-1 border-b border-sky-50">
                  <span className="text-charcoal-muted truncate pr-2">{h.agency}</span>
                  <a href={`tel:${h.number.split('/')[0].trim()}`} className="font-bold text-emergency hover:underline shrink-0">
                    {h.number}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Northeast SDMA Portals */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal mb-3 flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-charcoal-muted" />
              <span>State Authorities (SDMA)</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-charcoal-muted">
              {NORTHEAST_STATES.map((st) => (
                <li key={st.code}>
                  <a 
                    href={st.sdmaWebsite} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-cyan flex items-center justify-between transition-colors"
                  >
                    <span>{st.name} SDMA</span>
                    <span className="text-[10px] text-charcoal-muted">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Portals & Architecture */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal mb-3">
              Operational Portals
            </h4>
            <ul className="space-y-1.5 text-xs text-charcoal-muted mb-4">
              <li>
                <Link href="/portal/control-room" className="hover:text-cyan">
                  State Emergency Operations Centre (SEOC)
                </Link>
              </li>
              <li>
                <Link href="/portal/rescue" className="hover:text-cyan">
                  Rescue Operations & Field Units
                </Link>
              </li>
              <li>
                <Link href="/portal/shelter" className="hover:text-cyan">
                  Relief Camp Logistics Portal
                </Link>
              </li>
              <li>
                <Link href="/portal/district" className="hover:text-cyan">
                  District Disaster Management (DDMA)
                </Link>
              </li>
              <li>
                <Link href="/portal/citizen" className="hover:text-cyan">
                  Citizen Safety Dashboard
                </Link>
              </li>
              <li className="pt-1">
                <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-cyan hover:underline">
                  <Lock className="w-3 h-3 text-cyan" />
                  <span>Admin Command Portal</span>
                </Link>
              </li>
            </ul>

            <div className="text-[11px] text-charcoal-muted bg-white p-3 rounded-2xl border border-sky-200">
              <span className="font-bold text-charcoal block mb-0.5">National Emergency Helpline:</span>
              <span className="text-emergency font-bold text-sm">Dial 112</span>
              <span className="block text-[10px] text-charcoal-muted mt-0.5">24x7 Direct Dispatch for Police, Fire & Medical</span>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Zero-Mock Note */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-muted gap-4">
          <p>
            © {new Date().getFullYear()} NE-RESQ. One Region. One Network. One Mission — Saving Lives.
          </p>
          <p className="flex items-center gap-1 text-[11px]">
            <span>Engineered for 8 Northeast States with</span>
            <Heart className="w-3.5 h-3.5 text-emergency fill-emergency" />
            <span>Guwahati, Assam</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
