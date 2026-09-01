'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { LayoutGrid, GraduationCap, Shield, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutGrid },
  { label: 'My Courses', href: '/dashboard', icon: GraduationCap },
  { label: 'Articles', href: '/blog', icon: Newspaper },
];

export function SkillUpSidebar() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'moneymaking24into7@gmail.com').toLowerCase();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  const isAdmin = isLoaded && userEmail === adminEmail;

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col justify-between border-r border-[#23232a] bg-[#0d0d10] p-6 lg:flex">
      {/* Top Section: Logo & Nav */}
      <div className="space-y-8">
        {/* SkillUP Brand Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="grid grid-cols-2 gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#d4f76d]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#f9d8b9]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#bfe2ff]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff9d76]" />
          </div>
          <span className="text-xl font-extrabold tracking-wider text-white">
            SKILLUP
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="space-y-1">
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
                    ? 'bg-[#d4f76d] font-bold text-black shadow-md'
                    : 'text-[#8e8e9c] hover:bg-[#16161a] hover:text-white'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Exclusive Admin Panel Link for moneymaking24into7@gmail.com — Opens dedicated Admin Studio in new tab */}
          {isAdmin && (
            <Link
              href="/admin"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 mt-4 border border-[#23232a]',
                pathname.startsWith('/admin')
                  ? 'bg-[#d4f76d] font-bold text-black shadow-md border-transparent'
                  : 'bg-[#16161a] text-white hover:border-[#d4f76d]'
              )}
            >
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 shrink-0 text-[#d4f76d]" />
                <span>Admin Panel</span>
              </div>
              <span className="rounded-full bg-[#d4f76d]/20 px-2 py-0.5 text-[9px] font-bold text-[#d4f76d]">
                Studio ↗
              </span>
            </Link>
          )}
        </nav>
      </div>
    </aside>
  );
}
