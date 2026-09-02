'use client';

import Link from 'next/link';
import { useAuth, useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Search, Bell, Sparkles } from 'lucide-react';

export function SkillUpHeader({ title = 'Explore & Learn' }: { title?: string }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-[#22232a] bg-[#060709]/90 px-6 backdrop-blur-xl lg:px-8">
      {/* Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl flex items-center gap-2">
          {title}
        </h1>
      </div>

      {/* Capsule Search Bar */}
      <div className="hidden md:flex relative w-80 lg:w-96 items-center">
        <Search className="absolute left-4 h-4 w-4 text-[#9ca3af]" />
        <input
          type="text"
          placeholder="Search DSA, React, System Design..."
          className="h-11 w-full rounded-full border border-[#22232a] bg-[#111217] pl-11 pr-4 text-xs text-white placeholder:text-[#6b7280] focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/50 focus:outline-none transition-all"
        />
      </div>

      {/* Right User Area */}
      <div className="flex items-center gap-3">
        {!isLoaded ? (
          <div className="h-10 w-28 animate-pulse rounded-full bg-[#111217]" />
        ) : isSignedIn ? (
          <div className="flex items-center gap-3">
            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 rounded-full bg-[#111217] p-1.5 pr-4 border border-[#22232a]">
              <img
                src={user?.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                alt={user?.fullName || 'User'}
                className="h-7 w-7 rounded-full object-cover"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white leading-none">
                  {user?.fullName || 'Student'}
                </p>
                <p className="text-[10px] text-[#f97316] leading-none mt-1 font-semibold">
                  Free Student
                </p>
              </div>
            </div>

            {/* Clerk User Button */}
            <div className="ml-1">
              <UserButton />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <SignInButton mode="modal">
              <button className="rounded-full px-4 py-2 text-xs font-semibold text-[#9ca3af] hover:text-white transition-colors">
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
