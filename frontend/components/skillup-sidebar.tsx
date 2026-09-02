'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { LayoutGrid, GraduationCap, Shield, Newspaper, Flame, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Explore & Home', href: '/', icon: LayoutGrid },
  { label: 'All Courses', href: '/courses', icon: BookOpen },
  { label: 'My Learning', href: '/dashboard', icon: GraduationCap },
  { label: 'Knowledge Hub', href: '/blog', icon: Newspaper },
];

export function SkillUpSidebar() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'moneymaking24into7@gmail.com').toLowerCase();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  const isAdmin = isLoaded && userEmail === adminEmail;

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col justify-between border-r border-[#22232a] bg-[#090a0f] p-6 lg:flex">
      {/* Top Section: Logo & Nav */}
      <div className="space-y-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white shadow-lg shadow-[#f97316]/20 transition-transform group-hover:scale-105">
            <Flame className="h-5 w-5 fill-current" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
              Skill<span className="text-[#f97316]">UP</span>
            </span>
            <p className="text-[10px] font-semibold text-[#9ca3af]">Open-Source Academy</p>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-gradient-to-r from-[#f97316] to-[#ea580c] font-bold text-white shadow-lg shadow-[#f97316]/25'
                    : 'text-[#9ca3af] hover:bg-[#15161d] hover:text-white'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Exclusive Admin Studio Link */}
          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-[#22232a]">
              <Link
                href="/admin"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 border border-[#22232a]',
                  pathname.startsWith('/admin')
                    ? 'bg-[#f97316] font-bold text-white shadow-md border-transparent'
                    : 'bg-[#121318] text-white hover:border-[#f97316]/60'
                )}
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 shrink-0 text-[#f97316]" />
                  <span>Admin Studio</span>
                </div>
                <span className="rounded-full bg-[#f97316]/20 px-2 py-0.5 text-[9px] font-bold text-[#f97316]">
                  Studio ↗
                </span>
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Bottom Profile Info */}
      {user && (
        <div className="pt-4 border-t border-[#22232a] flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#f97316] to-[#f59e0b] flex items-center justify-center text-xs font-bold text-white shadow-md">
            {(user.firstName || user.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{user.fullName || user.username}</p>
            <p className="text-[10px] text-[#9ca3af] truncate">Pro Student</p>
          </div>
        </div>
      )}
    </aside>
  );
}
