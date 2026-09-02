'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  LayoutDashboard,
  BookOpen,
  Newspaper,
  PlusCircle,
  Shield,
  ArrowUpRight,
  Flame,
  Layers,
  Sparkles,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  isExact?: boolean;
}

const mainNavItems: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, isExact: true },
  { label: 'Courses Manager', href: '/admin', icon: BookOpen, isExact: true },
  { label: 'Create New Course', href: '/admin/courses/new', icon: PlusCircle, isExact: true, badge: 'Studio' },
  { label: 'Articles & Blogs', href: '/admin/blogs', icon: Newspaper, isExact: true },
  { label: 'Write New Article', href: '/admin/blogs/new', icon: PlusCircle, isExact: true, badge: 'Editor' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const userEmail = user?.primaryEmailAddress?.emailAddress || 'admin@skillup.dev';

  return (
    <aside
      className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col justify-between p-5 lg:flex backdrop-blur-xl"
      style={{
        borderRight: '1px solid var(--border)',
        backgroundColor: 'color-mix(in srgb, var(--bg-card) 95%, transparent)',
      }}
    >
      {/* Top Section */}
      <div className="space-y-6">
        {/* Sleek Studio Header */}
        <Link href="/admin" className="group flex items-center gap-3 px-1">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white shadow-lg shadow-[#f97316]/25 transition-transform group-hover:scale-105">
            <Flame className="h-5 w-5 fill-current" />
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-app bg-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-app">SkillUP</span>
              <span
                className="rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider"
                style={{
                  backgroundColor: 'rgba(249, 115, 22, 0.15)',
                  color: '#f97316',
                  border: '1px solid rgba(249, 115, 22, 0.25)',
                }}
              >
                STUDIO
              </span>
            </div>
            <p className="text-[10px] font-medium text-muted">Author & Course Engine</p>
          </div>
        </Link>

        {/* Studio Navigation */}
        <div className="space-y-1.5">
          <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
            Management
          </p>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.isExact ? pathname === item.href : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'border border-[#f97316]/30 bg-gradient-to-r from-[#f97316]/15 via-[#f97316]/10 to-transparent text-[#f97316] font-bold shadow-xs'
                      : 'border border-transparent text-muted hover:bg-card-2 hover:text-app'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive ? 'text-[#f97316]' : 'text-subtle group-hover:text-app'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase transition-colors ${
                        isActive
                          ? 'bg-[#f97316] text-white shadow-xs'
                          : 'bg-card-2 text-muted border border-app group-hover:text-app'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Studio Shortcut Tips */}
        <div className="rounded-2xl border border-app bg-card-2/60 p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-app">
            <Sparkles className="h-3.5 w-3.5 text-[#f97316]" />
            <span>Studio Cloudinary Sync</span>
          </div>
          <p className="text-[10px] text-muted leading-relaxed">
            Drag & drop course posters or video links with automated CDN media optimization.
          </p>
        </div>
      </div>

      {/* Bottom Profile & Student App Switcher */}
      <div className="space-y-2.5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5 rounded-xl border border-app bg-card-2/60 p-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-[#f97316] to-[#f59e0b] text-xs font-bold text-white shadow-sm">
            {(user?.firstName || userEmail).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-app truncate leading-tight">
              {user?.fullName || 'Super Administrator'}
            </p>
            <p className="text-[10px] text-muted truncate mt-0.5">
              {userEmail}
            </p>
          </div>
        </div>

        <Link
          href="/"
          target="_blank"
          className="group flex w-full items-center justify-between rounded-xl border border-app bg-card px-3 py-2 text-xs font-semibold text-muted transition-all hover:border-[#f97316]/50 hover:text-app hover:bg-card-2"
        >
          <span className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-subtle group-hover:text-[#f97316]" />
            Student View
          </span>
          <ArrowUpRight className="h-3.5 w-3.5 text-subtle group-hover:text-[#f97316]" />
        </Link>
      </div>
    </aside>
  );
}
