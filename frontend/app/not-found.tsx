import Link from 'next/link';
import { Flame, ArrowLeft, BookOpen, Newspaper, GraduationCap, Compass, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-app bg-grid-pattern relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-[#f97316]/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full space-y-8">
        {/* Brand Logo & 404 Badge */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white shadow-xl shadow-[#f97316]/30 animate-pulse">
            <Flame className="h-7 w-7 fill-current" />
          </div>
          <span className="rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-3.5 py-1 text-xs font-black tracking-widest text-[#f97316] uppercase">
            Error 404 &middot; Page Not Found
          </span>
        </div>

        {/* Big Glitch / Number */}
        <div className="space-y-2">
          <h1 className="text-7xl sm:text-8xl font-black tracking-tight gradient-text-orange select-none">
            404
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-app">
            Lost in the Codebase?
          </h2>
          <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
            The page or lecture you are looking for doesn&apos;t exist, was moved, or requires different permissions.
          </p>
        </div>

        {/* Quick Route Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <Link
            href="/"
            className="group flex flex-col justify-between rounded-xl border border-app bg-card p-3.5 hover:border-[#f97316]/50 hover:bg-card-2 transition-all"
          >
            <Compass className="h-4 w-4 text-[#f97316] mb-2 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-xs font-bold text-app">Explore Home</p>
              <p className="text-[10px] text-muted">Curated tracks</p>
            </div>
          </Link>

          <Link
            href="/courses"
            className="group flex flex-col justify-between rounded-xl border border-app bg-card p-3.5 hover:border-[#f97316]/50 hover:bg-card-2 transition-all"
          >
            <BookOpen className="h-4 w-4 text-[#f59e0b] mb-2 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-xs font-bold text-app">All Courses</p>
              <p className="text-[10px] text-muted">Video syllabus</p>
            </div>
          </Link>

          <Link
            href="/blog"
            className="group flex flex-col justify-between rounded-xl border border-app bg-card p-3.5 hover:border-[#f97316]/50 hover:bg-card-2 transition-all"
          >
            <Newspaper className="h-4 w-4 text-[#38bdf8] mb-2 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-xs font-bold text-app">Knowledge Hub</p>
              <p className="text-[10px] text-muted">Docs & articles</p>
            </div>
          </Link>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full glow-amber-btn px-6 py-3 text-xs sm:text-sm font-bold text-white transition-all">
              <ArrowLeft className="h-4 w-4" />
              Return to Safe Harbor
            </button>
          </Link>
          <Link href="/courses" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-app bg-card-2 px-6 py-3 text-xs sm:text-sm font-bold text-app hover:border-[#f97316]/60 transition-colors">
              <Search className="h-4 w-4" />
              Browse Catalog
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
