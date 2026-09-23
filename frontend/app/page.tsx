'use client';

import { useAuth } from '@clerk/nextjs';
import { LandingView } from '@/components/landing-view';
import { HomeView } from '@/components/home-view';
import { Skeleton } from '@/components/ui/skeleton';

export default function RootPage() {
  const { isSignedIn, isLoaded } = useAuth();

  // Loading state while Clerk initializes
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-app p-8 space-y-6">
        <Skeleton className="h-14 w-full rounded-2xl bg-card" />
        <Skeleton className="h-72 w-full rounded-3xl bg-card" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Skeleton className="h-44 rounded-2xl bg-card" />
          <Skeleton className="h-44 rounded-2xl bg-card" />
          <Skeleton className="h-44 rounded-2xl bg-card" />
        </div>
      </div>
    );
  }

  // When logged in: Render the LMS Home Page (with sidebar, progress, tracks)
  if (isSignedIn) {
    return <HomeView />;
  }

  // When guest / visitor: Render the clean ChaiCode-inspired Landing Page
  return <LandingView />;
}
