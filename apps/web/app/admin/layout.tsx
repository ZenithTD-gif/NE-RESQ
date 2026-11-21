'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { isAuthorizedAdmin } from '@/lib/admin-auth';
import { ShieldCheck } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // If accessing the Super Admin login form, bypass the dashboard auth check
    if (isLoginPage) {
      setAuthorized(true);
      return;
    }

    // Verify Super Admin clearance from browser session
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('neresq_auth_user');
      if (!stored) {
        setAuthorized(false);
        router.replace('/admin/login?error=admin_clearance_required');
        return;
      }

      try {
        const user = JSON.parse(stored);
        if (isAuthorizedAdmin(user.role) && user.status === 'APPROVED') {
          setAuthorized(true);
        } else {
          setAuthorized(false);
          router.replace('/admin/login?error=unauthorized_role');
        }
      } catch {
        setAuthorized(false);
        router.replace('/admin/login?error=invalid_session');
      }
    }
  }, [pathname, isLoginPage, router]);

  // When visiting the dedicated Super Admin login page, render children directly without sidebar
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col">
        {children}
      </div>
    );
  }

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-4">
        <div className="admin-glass-card p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 animate-pulse">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-base font-bold text-white">Verifying Super Admin Credentials</h2>
          <p className="text-xs text-slate-400">Connecting to centralized Supabase security cluster...</p>
        </div>
      </div>
    );
  }

  if (authorized === false) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex">
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
