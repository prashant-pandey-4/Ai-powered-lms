'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { SkillUpHeader } from '@/components/skillup-header';
import { Search, BookOpen, Play, ArrowRight, X, SlidersHorizontal, Star, Flame } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const LEVELS = ['All Levels', 'beginner', 'intermediate', 'advanced'];

export default function CoursesCatalogPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & filter state
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('All Levels');
  const [showFilters, setShowFilters] = useState(false);

  // Unique categories
  const categories = ['All Categories', ...Array.from(new Set(courses.map((c) => c.category).filter(Boolean)))];
  const [category, setCategory] = useState('All Categories');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadCourses = useCallback(async (q: string, lvl: string) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('search', q.trim());
      if (lvl && lvl !== 'All Levels') params.set('level', lvl);

      const res = await fetchApi<any[]>(`/courses?${params.toString()}`);
      if (res.success && Array.isArray(res.data)) {
        setCourses(res.data);
      } else {
        setError(res.message || 'Failed to load courses.');
      }
    } catch {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses('', 'All Levels');
  }, [loadCourses]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadCourses(value, level);
    }, 350);
  };

  const handleLevelChange = (lvl: string) => {
    setLevel(lvl);
    loadCourses(search, lvl);
  };

  const clearSearch = () => {
    setSearch('');
    setCategory('All Categories');
    setLevel('All Levels');
    loadCourses('', 'All Levels');
  };

  const filteredCourses = category === 'All Categories'
    ? courses
    : courses.filter((c) => c.category === category);

  const hasActiveFilter = search.trim() || level !== 'All Levels' || category !== 'All Categories';

  return (
    <div className="flex min-h-screen flex-col bg-[#060709] bg-grid-pattern">
      <SkillUpHeader title="Course Library" />

      <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
        {/* Top Header & Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#f97316]">Catalog</p>
              <h1 className="text-2xl sm:text-3xl font-black text-white">All Engineering Courses</h1>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters((s) => !s)}
              className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-bold transition-all ${
                showFilters || hasActiveFilter
                  ? 'border-[#f97316] bg-[#f97316]/10 text-[#f97316]'
                  : 'border-[#22232a] bg-[#111217] text-[#9ca3af] hover:text-white'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters{hasActiveFilter ? ' • Active' : ''}
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Search courses by topic (e.g. DSA, React, System Design, Node.js)..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-12 w-full rounded-2xl border border-[#22232a] bg-[#111217] pl-11 pr-10 text-xs sm:text-sm text-white placeholder:text-[#6b7280] focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/50 focus:outline-none transition-all"
            />
            {search && (
              <button
                onClick={clearSearch}
                className="absolute right-3.5 top-3.5 text-[#9ca3af] hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Drawer */}
        {showFilters && (
          <div className="rounded-2xl border border-[#22232a] bg-[#111217] p-6 space-y-5 animate-in fade-in-50 duration-200">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Level Filter */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Difficulty Level</p>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => handleLevelChange(lvl)}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-all ${
                        level === lvl
                          ? 'bg-[#f97316] text-white font-bold shadow-md shadow-[#f97316]/20'
                          : 'border border-[#22232a] bg-[#17181f] text-[#9ca3af] hover:text-white'
                      }`}
                    >
                      {lvl === 'All Levels' ? 'All' : lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Category</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                        category === cat
                          ? 'bg-[#f97316] text-white font-bold shadow-md shadow-[#f97316]/20'
                          : 'border border-[#22232a] bg-[#17181f] text-[#9ca3af] hover:text-white'
                      }`}
                    >
                      {cat === 'All Categories' ? 'All' : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {hasActiveFilter && (
              <button
                onClick={clearSearch}
                className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors pt-2 border-t border-[#22232a]"
              >
                <X className="h-3.5 w-3.5" /> Clear All Active Filters
              </button>
            )}
          </div>
        )}

        {/* Result Count */}
        {!loading && !error && (
          <p className="text-xs text-[#9ca3af] font-medium">
            Showing <span className="text-white font-bold">{filteredCourses.length}</span> curated course{filteredCourses.length !== 1 ? 's' : ''}
            {search && <span className="text-[#f97316]"> for &ldquo;{search}&rdquo;</span>}
          </p>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl border border-[#22232a] bg-[#111217] p-3.5 space-y-3">
                <Skeleton className="aspect-video w-full rounded-xl bg-[#17181f]" />
                <Skeleton className="h-5 w-3/4 bg-[#17181f]" />
                <Skeleton className="h-4 w-1/2 bg-[#17181f]" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-red-800/40 bg-red-950/20 p-12 text-center">
            <p className="text-sm font-semibold text-red-400">{error}</p>
            <button
              onClick={() => loadCourses(search, level)}
              className="mt-4 rounded-full bg-[#17181f] border border-[#22232a] px-5 py-2 text-xs font-bold text-white hover:border-[#f97316] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCourses.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#22232a] p-16 text-center bg-[#111217]">
            <BookOpen className="mb-4 h-10 w-10 text-[#6b7280]" />
            <h3 className="text-base font-bold text-white">
              {hasActiveFilter ? 'No courses match your filters' : 'No courses yet'}
            </h3>
            <p className="mt-2 text-xs text-[#9ca3af]">
              {hasActiveFilter
                ? 'Try adjusting your search or clearing the filters.'
                : 'Check back soon for newly published courses.'}
            </p>
            {hasActiveFilter && (
              <button
                onClick={clearSearch}
                className="mt-5 rounded-full bg-[#17181f] border border-[#22232a] px-5 py-2 text-xs font-bold text-white hover:border-[#f97316] transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Course Grid */}
        {!loading && !error && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course: any) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#22232a] bg-[#111217] p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-[#f97316]/50 hover:shadow-xl hover:shadow-[#f97316]/5"
              >
                {/* 16:9 Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-[#22232a]">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#17181f]">
                      <BookOpen className="h-8 w-8 text-[#6b7280]" />
                    </div>
                  )}

                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f97316] text-white shadow-lg shadow-[#f97316]/40">
                      <Play className="h-5 w-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Badges Overlay */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-bold text-[#f97316] backdrop-blur-md border border-[#f97316]/20">
                      {course.category || 'Engineering'}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col pt-3.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#9ca3af]">
                    <span className="flex items-center gap-1 text-[#f59e0b] font-bold">
                      <Star className="h-3 w-3 fill-current" /> 4.9
                    </span>
                    <span>{course._count?.lectures || 0} Lessons</span>
                    <span className="rounded bg-[#17181f] px-1.5 py-0.5 text-[10px] text-[#9ca3af]">
                      English / Hindi
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-[#f97316] line-clamp-2 transition-colors">
                    {course.title}
                  </h4>

                  <p className="text-xs text-[#9ca3af] line-clamp-2 leading-relaxed">
                    {course.description || 'Master fundamental concepts through high-quality structured video lessons.'}
                  </p>

                  {/* Bottom CTA & Free Badge */}
                  <div className="mt-auto pt-3 flex items-center justify-between border-t border-[#22232a]">
                    <span className="rounded-full bg-[#f97316]/10 px-2.5 py-0.5 text-xs font-extrabold text-[#f97316]">
                      100% Free
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-white group-hover:text-[#f97316] transition-colors">
                      View Details <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
