'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Search } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface SkillUpHeaderProps {
  title?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export function SkillUpHeader({
  title = 'Explore & Learn',
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search DSA, React, System Design...',
}: SkillUpHeaderProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [localQuery, setLocalQuery] = useState('');

  const currentQuery = onSearchChange ? (searchValue ?? '') : localQuery;

  const handleQueryChange = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setLocalQuery(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange) return;
    if (currentQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(currentQuery.trim())}`);
    } else {
      router.push('/courses');
    }
  };

  return (
    <header
      className="sticky top-0 z-30 flex h-20 w-full items-center justify-between px-6 backdrop-blur-xl lg:px-8"
      style={{
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'color-mix(in srgb, var(--bg) 90%, transparent)',
      }}
    >
      {/* Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-black tracking-tight sm:text-2xl" style={{ color: 'var(--text)' }}>
          {title}
        </h1>
      </div>

      {/* Capsule Search Bar */}
      <form onSubmit={handleSubmit} className="hidden md:flex relative w-80 lg:w-96 items-center">
        <Search className="absolute left-4 h-4 w-4 pointer-events-none" style={{ color: 'var(--text-subtle)' }} />
        <input
          type="text"
          value={currentQuery}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder={searchPlaceholder}
          style={{
            height: '2.75rem',
            width: '100%',
            borderRadius: '9999px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-card)',
            paddingLeft: '2.75rem',
            paddingRight: currentQuery ? '2.5rem' : '1rem',
            fontSize: '0.75rem',
            color: 'var(--text)',
            outline: 'none',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
        />
        {currentQuery && (
          <button
            type="button"
            onClick={() => handleQueryChange('')}
            className="absolute right-3.5 flex h-4 w-4 items-center justify-center rounded-full text-xs transition-colors"
            style={{ color: 'var(--text-subtle)' }}
            title="Clear search"
          >
            &times;
          </button>
        )}
      </form>

      {/* Right User Area & Theme Toggle */}
      <div className="flex items-center gap-3">
        {/* Dark/Light Theme Toggle */}
        <ThemeToggle />

        {!isLoaded ? (
          <div className="h-10 w-28 animate-pulse rounded-full" style={{ backgroundColor: 'var(--bg-card)' }} />
        ) : isSignedIn ? (
          <div className="flex items-center gap-3">
            {/* User Profile Pill */}
            <div
              className="flex items-center gap-2.5 rounded-full p-1.5 pr-4"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <img
                src={user?.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                alt={user?.fullName || 'User'}
                className="h-7 w-7 rounded-full object-cover"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold leading-none" style={{ color: 'var(--text)' }}>
                  {user?.fullName || 'Student'}
                </p>
                <p className="text-[10px] leading-none mt-1 font-semibold" style={{ color: 'var(--primary)' }}>
                  Free Student
                </p>
              </div>
            </div>

            <div className="ml-1">
              <UserButton />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <SignInButton mode="modal">
              <button className="rounded-full px-4 py-2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-full glow-amber-btn px-5 py-2 text-xs font-bold text-white transition-all">
                Get Started Free
              </button>
            </SignUpButton>
          </div>
        )}
      </div>
    </header>
  );
}
