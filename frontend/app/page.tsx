'use client';

import { useAuth } from '@clerk/nextjs';
import { LandingView } from '@/components/landing-view';
import { HomeView } from '@/components/home-view';
import { Skeleton } from '@/components/ui/skeleton';

export default function RootPage() {
  const { isSignedIn, isLoaded } = useAuth();

  // When confirmed logged in: Render the LMS Home Page (with sidebar, progress, tracks)
  if (isLoaded && isSignedIn) {
    return <HomeView />;
  }

  // When guest / visitor or initial load: Render the clean ChaiCode-inspired Landing Page
  return <LandingView />;
}
