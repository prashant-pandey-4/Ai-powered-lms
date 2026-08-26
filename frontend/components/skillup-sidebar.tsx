'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  BookOpen,
  GraduationCap,
  CheckSquare,
  Calendar,
  MessageSquare,
  Settings,
  HelpCircle,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function SkillUpSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutGrid },
    { label: 'Library', href: '/courses', icon: BookOpen },
    { label: 'My courses', href: '/dashboard', icon: GraduationCap },
    { label: 'Homework', href: '/dashboard', icon: CheckSquare },
    { label: 'Schedule', href: '/dashboard', icon: Calendar },
    { label: 'Messages', href: '/dashboard', icon: MessageSquare, badge: '2' },
    { label: 'Settings', href: '/dashboard', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col justify-between border-r border-[#23232a] bg-[#0d0d10] p-6 lg:flex">
      {/* Top Section: Logo & Nav */}
      <div className="space-y-8">
        {/* SkillUP Brand Logo with 4 dots */}
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
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              (item.href === '/' && pathname === '/') ||
              (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-[#d4f76d] font-bold text-black shadow-md'
                    : 'text-[#8e8e9c] hover:bg-[#16161a] hover:text-white'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d4f76d] text-[11px] font-bold text-black">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Go to Teacher & Help */}
      <div className="space-y-4 pt-6">
        <Link href="/instructor" className="block">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-bold text-black transition-all hover:bg-slate-200">
            <Video className="h-4 w-4" />
            Go to Teacher
          </button>
        </Link>

        <div className="flex items-center gap-2 px-2 text-xs font-medium text-[#6c6c7a] hover:text-white cursor-pointer">
          <HelpCircle className="h-4 w-4" />
          <span>Help & Support</span>
        </div>
      </div>
    </aside>
  );
}
