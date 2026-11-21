'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Database, Bell, User, LogOut, ArrowLeft } from 'lucide-react';
import { isAuthorizedAdmin } from '@/lib/admin-auth';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('neresq_auth_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCurrentUser(parsed);
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('neresq_auth_user');
      sessionStorage.removeItem('neresq_auth_user');
      document.cookie = 'neresq_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    router.push('/admin/login?notice=logged_out');
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-[#111827]/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Supabase Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-300">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>PostgreSQL/PostGIS Active</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
        </div>

        {/* Back to User Site */}
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden md:inline">User Site</span>
        </Link>

        {/* Current User Clearance Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400">
            {currentUser?.full_name ? currentUser.full_name[0] : 'A'}
          </div>
          <div className="hidden md:block text-left text-xs">
            <div className="font-bold text-white leading-tight">
              {currentUser?.full_name || 'Super Administrator'}
            </div>
            <div className="text-[10px] text-cyan-400 font-mono">
              {currentUser?.role || 'SUPER_ADMIN'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
