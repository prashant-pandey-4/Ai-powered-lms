'use client';

import Link from 'next/link';
import { useAuth, useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Search, Bell } from 'lucide-react';

export function SkillUpHeader({ title = 'Dashboard' }: { title?: string }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-[#23232a] bg-[#0d0d10]/95 px-6 backdrop-blur-md lg:px-8">
      {/* Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {title}
        </h1>
      </div>

      {/* Capsule Search Bar */}
      <div className="hidden md:flex relative w-80 lg:w-96 items-center">
        <Search className="absolute left-4 h-4 w-4 text-[#8e8e9c]" />
        <input
          type="text"
          placeholder="Course, theme, author"
          className="h-11 w-full rounded-full border border-[#23232a] bg-[#16161a] pl-11 pr-4 text-xs text-white placeholder:text-[#6c6c7a] focus:border-[#d4f76d] focus:outline-none transition-colors"
        />
      </div>

      {/* Right User Area */}
      <div className="flex items-center gap-4">
        {!isLoaded ? (
          <div className="h-10 w-28 animate-pulse rounded-full bg-[#16161a]" />
        ) : isSignedIn ? (
          <div className="flex items-center gap-3">
            {/* User Profile Pill */}
            <div className="flex items-center gap-3 rounded-full bg-[#16161a] p-1.5 pr-4 border border-[#23232a]">
              <img
                src={user?.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                alt={user?.fullName || 'User'}
                className="h-8 w-8 rounded-full object-cover"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white leading-none">
                  {user?.fullName || 'Esther Howard'}
                </p>
                <p className="text-[10px] text-[#8e8e9c] leading-none mt-1">
                  UX/UI Designer
                </p>
              </div>
            </div>

            {/* Notification Bell in Lime */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d4f76d] text-black cursor-pointer shadow-sm hover:scale-105 transition-transform">
              <Bell className="h-4 w-4 fill-current" />
            </div>

            {/* Clerk User Button */}
            <div className="ml-1">
              <UserButton />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <SignInButton mode="modal">
              <button className="rounded-full px-4 py-2 text-xs font-semibold text-white hover:bg-[#16161a]">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-full bg-[#d4f76d] px-4 py-2 text-xs font-bold text-black hover:bg-[#c6ec5c] transition-all">
                Get Started
              </button>
            </SignUpButton>
          </div>
        )}
      </div>
    </header>
  );
}
