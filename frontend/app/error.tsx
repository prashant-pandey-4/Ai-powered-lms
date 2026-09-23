'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, Flame } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console or telemetry service
    console.error('SkillUP App Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-app bg-grid-pattern relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[380px] w-[380px] rounded-full bg-red-500/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full space-y-6">
        {/* Error icon badge */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 shadow-xl shadow-red-500/10">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-500 uppercase tracking-wider">
            Something Went Wrong
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-app">
            Unexpected Exception
          </h1>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            {error?.message || 'An unexpected error occurred while rendering this view. Our team has been alerted.'}
          </p>
          {error?.digest && (
            <p className="text-[10px] font-mono text-subtle bg-card-2 p-1.5 rounded-lg border border-app inline-block">
              Digest: {error.digest}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full glow-amber-btn px-6 py-3 text-xs sm:text-sm font-bold text-white transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link href="/" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-app bg-card-2 px-6 py-3 text-xs sm:text-sm font-bold text-app hover:border-[#f97316]/60 transition-colors">
              <Home className="h-4 w-4" />
              Return Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
