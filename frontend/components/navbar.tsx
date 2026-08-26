'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Compass, BookOpen, Video, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();

  const navLinks = [
    { href: '/courses', label: 'Explore Courses', icon: Compass },
    { href: '/dashboard', label: 'My Learning', icon: BookOpen },
    { href: '/instructor', label: 'Instructor Studio', icon: Video },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-slate-900 dark:text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-emerald-400 dark:bg-zinc-800 dark:text-emerald-400 shadow-xs">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              Skill<span className="text-emerald-600 dark:text-emerald-400">UP</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-slate-100 font-semibold text-slate-900 dark:bg-zinc-800 dark:text-white'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Auth CTA */}
        <div className="flex items-center gap-3">
          {!isLoaded ? (
            <div className="h-9 w-20 animate-pulse rounded-lg bg-slate-100 dark:bg-zinc-800" />
          ) : isSignedIn ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="hidden sm:inline-flex rounded-lg text-xs font-medium">
                  My Learning
                </Button>
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="text-xs font-medium">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-medium dark:bg-emerald-600 dark:hover:bg-emerald-700">
                  Get Started Free
                </Button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
