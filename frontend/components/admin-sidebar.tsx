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
  ArrowLeft,
  Settings,
  Sparkles,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col justify-between border-r border-[#23232a] bg-[#0d0d10] p-6 lg:flex">
      {/* Top Section: Studio Brand & Nav */}
      <div className="space-y-8">
        {/* Admin Brand Logo */}
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d4f76d] text-black shadow-lg shadow-[#d4f76d]/10">
              <Shield className="h-5 w-5 fill-current" />
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-wider text-white flex items-center gap-1.5">
                SKILLUP <span className="rounded bg-[#d4f76d]/20 px-1.5 py-0.5 text-[9px] font-extrabold text-[#d4f76d]">STUDIO</span>
              </span>
              <p className="text-[10px] text-[#8e8e9c]">Master Admin Portal</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="space-y-1">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#6c6c7a]">
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
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-[#d4f76d] font-bold text-black shadow-md'
                      : 'text-[#8e8e9c] hover:bg-[#16161a] hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section: Admin User & Back link */}
      <div className="space-y-3 pt-6 border-t border-[#23232a]">
        <div className="rounded-xl border border-[#23232a] bg-[#16161a] p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d4f76d]/20 text-[#d4f76d] text-xs font-bold">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Super Admin'}</p>
              <p className="text-[10px] text-[#8e8e9c] truncate">{userEmail}</p>
            </div>
          </div>
        </div>

        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-center gap-2 rounded-xl border border-[#23232a] bg-[#0d0d10] py-2.5 text-xs font-bold text-[#8e8e9c] hover:border-[#d4f76d] hover:text-[#d4f76d] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Open Student App</span>
        </Link>
      </div>
    </aside>
  );
}
