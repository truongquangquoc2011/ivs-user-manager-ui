'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import PageTransition from '@/src/components/PageTransition';
import { AuthProvider, useAuth } from '@/src/hook/useAuth';

const NAV_ITEMS = [
  { href: '/dashboard/user', label: 'Người dùng', feature: 'USER_MANAGEMENT', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  { href: '/dashboard/group', label: 'Nhóm', feature: 'GROUP_MANAGEMENT', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
  { href: '/dashboard/permission', label: 'Phân quyền', feature: 'PERMISSION_MANAGEMENT', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { href: '/dashboard/profile', label: 'Hồ sơ', feature: 'PROFILE', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, hasPermission } = useAuth();

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const visibleNav = NAV_ITEMS.filter(item => {
    if (item.feature === 'PROFILE') return true;
    return hasPermission(item.feature, 'canView');
  });

  return (
    <aside
      className="w-[220px] flex-shrink-0 flex flex-col h-screen sticky top-0"
      style={{ background: 'var(--bg-sidebar)' }}
    >
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-2.5 border-b" style={{ borderColor: '#1e1e1c' }}>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-semibold text-xs flex-shrink-0"
          style={{ background: 'var(--accent)' }}
        >
          IV
        </div>
        <span className="text-sm font-medium tracking-wide" style={{ color: '#f0efe8' }}>
          IVS Manager
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleNav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: active ? 'var(--bg-sidebar-active)' : 'transparent',
                color: active ? 'var(--text-sidebar-active)' : 'var(--text-sidebar)',
              }}
            >
              <NavIcon d={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-3 pb-4 border-t pt-4" style={{ borderColor: '#1e1e1c' }}>
        {profile && (
          <div className="px-3 py-2.5 mb-2">
            <p className="text-xs font-medium truncate" style={{ color: '#f0efe8' }}>
              {profile.fullname || profile.email}
            </p>
            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-sidebar)' }}>
              {profile.groups.map(g => g.name).join(', ')}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
          style={{ color: '#666660' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}

function DashboardInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { loading } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) router.push('/');
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto" style={{ background: 'var(--bg)' }}>
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardInner>{children}</DashboardInner>
    </AuthProvider>
  );
}