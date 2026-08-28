'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, GraduationCap, BookOpen, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutGrid },
  { label: 'My Courses', href: '/dashboard', icon: GraduationCap },
  { label: 'Library', href: '/courses', icon: BookOpen },
];

export function SkillUpSidebar() {
  const pathname = usePathname();

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
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="pt-6">
        <Link href="/instructor" className="block">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-bold text-black transition-all hover:bg-slate-100">
            <Video className="h-4 w-4" />
            Instructor Studio
          </button>
        </Link>
      </div>
    </aside>
  );
}
