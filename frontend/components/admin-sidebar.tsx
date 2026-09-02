'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { LayoutDashboard, BookOpen, Newspaper, PlusCircle, Shield, ArrowLeft, Flame } from 'lucide-react';

const adminNavItems = [
  { label: 'Studio Overview', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Create Course', href: '/admin/courses/new', icon: PlusCircle },
  { label: 'Articles & Blogs', href: '/admin/blogs', icon: Newspaper },
  { label: 'Write Article', href: '/admin/blogs/new', icon: PlusCircle },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const userEmail = user?.primaryEmailAddress?.emailAddress || 'Admin';

  return (
    <aside
      className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col justify-between p-6 lg:flex"
      style={{ borderRight: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}
    >
      {/* Top Section */}
      <div className="space-y-8">
        {/* Admin Brand */}
        <Link href="/admin" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white shadow-lg shadow-[#f97316]/20">
            <Shield className="h-5 w-5 fill-current" />
          </div>
          <div>
            <span className="text-sm font-black tracking-tight flex items-center gap-1.5" style={{ color: 'var(--text)' }}>
              SKILLUP{' '}
              <span
                className="rounded px-1.5 py-0.5 text-[9px] font-extrabold"
                style={{ backgroundColor: 'rgba(249,115,22,0.15)', color: '#f97316' }}
              >
                STUDIO
              </span>
            </span>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Master Admin Portal</p>
          </div>
        </Link>

        {/* Navigation */}
        <div className="space-y-1.5">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>
            Studio Controls
          </p>
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150"
                  style={
                    isActive
                      ? {
                          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                          color: '#ffffff',
                          fontWeight: 700,
                          boxShadow: '0 4px 15px -2px rgba(249, 115, 22, 0.35)',
                        }
                      : {
                          color: 'var(--text-muted)',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-card-2)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--text)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                    }
                  }}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="space-y-3 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="rounded-2xl p-3" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card-2)' }}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-[#f97316]"
              style={{ backgroundColor: 'rgba(249,115,22,0.15)' }}>
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate" style={{ color: 'var(--text)' }}>
                {user?.fullName || 'Super Admin'}
              </p>
              <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{userEmail}</p>
            </div>
          </div>
        </div>

        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-colors"
          style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--bg)' }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Open Student App</span>
        </Link>
      </div>
    </aside>
  );
}
