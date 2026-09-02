'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { SkillUpHeader } from '@/components/skillup-header';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Play, GraduationCap, Compass, Search, X } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function StudentDashboardPage() {
  const { getToken } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      setError('');
      try {
        const token = await getToken();
        const res = await fetchApi<any[]>('/enrollment/my-courses', { token });
        if (res.success && Array.isArray(res.data)) {
          setEnrollments(res.data);
        } else {
          setError(res.message || 'Failed to load your courses.');
        }
      } catch {
        setError('Unable to connect to server. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [getToken]);

  const completedCount = enrollments.filter((e) => e.progress === 100).length;
  const inProgressCount = enrollments.filter((e) => e.progress > 0 && e.progress < 100).length;

  const filteredEnrollments = enrollments.filter((item) => {
    const title = item.course?.title?.toLowerCase() || '';
    const desc = item.course?.description?.toLowerCase() || '';
    const cat = item.course?.category?.toLowerCase() || '';
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || title.includes(q) || desc.includes(q) || cat.includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === 'in-progress') {
      return (item.progress ?? 0) > 0 && (item.progress ?? 0) < 100;
    }
    if (statusFilter === 'completed') {
      return (item.progress ?? 0) === 100;
    }
    return true;
  });

  return (
    <div className="flex min-h-screen flex-col bg-app bg-grid-pattern">
      <SkillUpHeader
        title="My Learning Room"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search your enrolled courses..."
      />

      <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
        {/* Stats Row */}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-app bg-card p-5 space-y-1">
              <p className="text-xs font-bold text-muted">Total Tracks Enrolled</p>
              <h3 className="text-3xl font-black text-app">{enrollments.length}</h3>
            </div>
            <div className="rounded-2xl border border-app bg-card p-5 space-y-1">
              <p className="text-xs font-bold text-muted">In Progress</p>
              <h3 className="text-3xl font-black text-[#f97316]">{inProgressCount}</h3>
            </div>
            <div className="rounded-2xl border border-app bg-card p-5 space-y-1">
              <p className="text-xs font-bold text-muted">Completed Tracks</p>
              <h3 className="text-3xl font-black text-[#f59e0b]">{completedCount}</h3>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#f97316]">Active Tracks</p>
            <h2 className="text-xl sm:text-2xl font-black text-app">Your Enrolled Courses</h2>
          </div>
          <Link href="/courses">
            <button className="flex items-center gap-1.5 text-xs font-bold text-[#f97316] hover:underline">
              <Compass className="h-3.5 w-3.5" />
              Explore More Courses
            </button>
          </Link>
        </div>

        {/* Search & Filter Controls for Enrolled Courses */}
        {!loading && !error && enrollments.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter your tracks by title or topic..."
                className="h-10 w-full rounded-xl border border-app bg-card pl-10 pr-9 text-xs text-app placeholder:text-subtle focus:border-[#f97316] focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-muted hover:text-app"
                  title="Clear filter"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Quick Status Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl border border-app bg-card self-start sm:self-auto">
              {(['all', 'in-progress', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs capitalize transition-all ${
                    statusFilter === tab
                      ? 'bg-[#f97316] text-white shadow-sm font-bold'
                      : 'text-muted hover:text-app font-medium'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab === 'in-progress' ? 'In Progress' : 'Completed'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-app bg-card p-4 space-y-3">
                <Skeleton className="aspect-video w-full rounded-xl bg-card-2" />
                <Skeleton className="h-5 w-3/4 bg-card-2" />
                <Skeleton className="h-3 w-full bg-card-2" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-red-800/40 bg-red-950/20 p-12 text-center">
            <p className="text-sm font-semibold text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-card-2 border border-app px-5 py-2 text-xs font-bold text-app hover:border-[#f97316] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State: No courses enrolled */}
        {!loading && !error && enrollments.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-app p-16 text-center bg-card">
            <GraduationCap className="mb-4 h-10 w-10 text-subtle" />
            <h3 className="text-base font-bold text-app">No courses enrolled yet</h3>
            <p className="mt-2 max-w-xs text-xs text-muted">
              Join any of our 100% free computer science tracks and start learning today.
            </p>
            <Link href="/courses" className="mt-6">
              <button className="rounded-full glow-amber-btn px-6 py-2.5 text-xs font-bold text-white">
                Explore Courses
              </button>
            </Link>
          </div>
        )}

        {/* Search Result Empty State: Filter yielded no matches */}
        {!loading && !error && enrollments.length > 0 && filteredEnrollments.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-app p-12 text-center bg-card">
            <BookOpen className="mb-3 h-8 w-8 text-subtle" />
            <h3 className="text-sm font-bold text-app">No enrolled tracks match your search</h3>
            <p className="mt-1 text-xs text-muted">
              No results found for &ldquo;{searchQuery}&rdquo; {statusFilter !== 'all' ? `with status "${statusFilter}"` : ''}.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="mt-4 rounded-full border border-app bg-card-2 px-4 py-2 text-xs font-bold text-app hover:border-[#f97316] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Enrolled Courses Grid */}
        {!loading && !error && filteredEnrollments.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEnrollments.map((item) => {
              const course = item.course;
              if (!course) return null;

              return (
                <div
                  key={item.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-app bg-card p-4 transition-all hover:border-[#f97316]/40 shadow-xl"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-app">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-card-2">
                        <BookOpen className="h-8 w-8 text-subtle" />
                      </div>
                    )}
                    {item.progress === 100 && (
                      <div className="absolute top-2.5 right-2.5">
                        <span className="rounded-md bg-[#f97316] px-2 py-0.5 text-[10px] font-black text-white shadow-md">
                          Completed
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col pt-4">
                    <h3 className="text-sm sm:text-base font-bold text-app line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted">
                      {course._count?.lectures || 0} Lessons &bull; Lifetime Free
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-auto pt-4 space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-muted">
                        <span>Progress</span>
                        <span className="text-[#f97316]">{item.progress ?? 0}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-card-2 border border-app">
                        <div
                          className="h-full bg-gradient-to-r from-[#f97316] to-[#ea580c] transition-all duration-300 rounded-full"
                          style={{ width: `${item.progress ?? 0}%` }}
                        />
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="mt-4 pt-3 border-t border-app">
                      <Link href={`/courses/${course.id}`} className="block">
                        <button className="flex w-full items-center justify-center gap-2 rounded-xl glow-amber-btn py-2.5 text-xs font-bold text-white transition-all">
                          <Play className="h-3.5 w-3.5 fill-current" />
                          {item.progress === 100 ? 'Review Course' : item.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
