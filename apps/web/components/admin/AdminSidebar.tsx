'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  PhoneCall, 
  AlertTriangle, 
  Map, 
  Building2, 
  Hotel, 
  Home, 
  ShieldAlert, 
  FileText, 
  Users, 
  CheckCircle, 
  History, 
  Database, 
  Settings, 
  LogOut,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Emergency Contacts', href: '/admin/contacts', icon: PhoneCall },
  { name: 'Disaster Alerts', href: '/admin/alerts', icon: AlertTriangle },
  { name: 'State Management', href: '/admin/states', icon: Map },
  { name: 'District Management', href: '/admin/districts', icon: Building2 },
  { name: 'Hospitals', href: '/admin/hospitals', icon: Hotel },
  { name: 'Shelters', href: '/admin/shelters', icon: Home },
  { name: 'Rescue Teams', href: '/admin/rescue-teams', icon: ShieldAlert },
  { name: 'User & Admin Management', href: '/admin/users', icon: Users },
  { name: 'Website Content', href: '/admin/content', icon: FileText },
  { name: 'Pending Verifications', href: '/admin/verifications', icon: CheckCircle },
  { name: 'Activity Logs', href: '/admin/audit-logs', icon: History },
  { name: 'Database Status', href: '/admin/database-status', icon: Database },
  { name: 'System Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('neresq_auth_user');
      sessionStorage.removeItem('neresq_auth_user');
      document.cookie = 'neresq_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    router.push('/admin/login?notice=logged_out');
  };

  return (
    <aside className="w-64 shrink-0 bg-[#111827]/90 backdrop-blur-xl border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 z-30">
      
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-cyan-glow">
              NE
            </div>
            <div>
              <span className="font-black text-sm tracking-wider text-white block">NE-RESQ</span>
              <span className="text-[10px] font-mono font-bold text-cyan-400 block tracking-widest uppercase">
                ADMIN PORTAL
              </span>
            </div>
          </Link>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Supabase Active" />
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)] text-xs">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/admin' && pathname === '/admin/dashboard') || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950/60">
        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public User Website</span>
          </span>
          <span className="text-[10px] bg-cyan-950/80 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800">
            Live
          </span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Admin Portal</span>
        </button>
      </div>

    </aside>
  );
}
