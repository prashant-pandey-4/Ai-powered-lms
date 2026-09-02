'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded, isSignedIn } = useUser();

  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'moneymaking24into7@gmail.com').toLowerCase();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  const isAdmin = isLoaded && isSignedIn && userEmail === adminEmail;

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen flex-col bg-[#0d0d10] p-8 space-y-6">
        <Skeleton className="h-10 w-48 bg-[#16161a]" />
        <Skeleton className="h-64 w-full rounded-2xl bg-[#16161a]" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d0d10] p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-800/40 bg-red-950/20 text-red-400 mb-5">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-extrabold text-app">403 — Access Restricted</h2>
        <p className="mt-2 max-w-sm text-xs text-[#8e8e9c]">
          This section is exclusively reserved for the platform administrator ({adminEmail}).
        </p>
        <Link href="/" className="mt-6">
          <button className="rounded-full bg-[#d4f76d] px-6 py-2.5 text-xs font-bold text-black hover:bg-[#c4ea5c] transition-all">
            Return to Home
          </button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
