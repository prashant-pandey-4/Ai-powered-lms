'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { SkillUpHeader } from '@/components/skillup-header';
import { Search, BookOpen, Play, ArrowRight, X, SlidersHorizontal } from 'lucide-react';
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

  // Derived: unique categories from loaded courses
  const categories = ['All Categories', ...Array.from(new Set(courses.map((c) => c.category).filter(Boolean)))];
  const [category, setCategory] = useState('All Categories');

  // Debounce ref — prevents API hammering on every keystroke
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

  // Initial load
  useEffect(() => {
    loadCourses('', 'All Levels');
  }, [loadCourses]);

  // Debounced search — fires 350ms after user stops typing
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

  // Client-side category filter (categories come from already-fetched data)
  const filteredCourses = category === 'All Categories'
    ? courses
    : courses.filter((c) => c.category === category);

  const hasActiveFilter = search.trim() || level !== 'All Levels' || category !== 'All Categories';

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0d10]">
      <SkillUpHeader title="Course Library" />

      <div className="p-6 lg:p-8 space-y-6">

        {/* Search Bar + Filter Toggle */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#8e8e9c]" />
            <input
              type="text"
              placeholder="Search courses by title, topic or category..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-10 w-full rounded-full border border-[#23232a] bg-[#16161a] pl-10 pr-9 text-xs text-white placeholder:text-[#6c6c7a] focus:border-[#d4f76d] focus:outline-none transition-colors"
            />
            {search && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-2.5 text-[#8e8e9c] hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
              showFilters || hasActiveFilter
                ? 'border-[#d4f76d] bg-[#d4f76d]/10 text-[#d4f76d]'
                : 'border-[#23232a] bg-[#16161a] text-[#8e8e9c] hover:text-white'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters{hasActiveFilter ? ' •' : ''}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Level Filter */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8e8e9c]">Difficulty Level</p>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => handleLevelChange(lvl)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-all ${
                        level === lvl
                          ? 'bg-[#d4f76d] text-black font-bold'
                          : 'border border-[#23232a] bg-[#0d0d10] text-[#8e8e9c] hover:text-white'
                      }`}
                    >
                      {lvl === 'All Levels' ? 'All' : lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8e8e9c]">Category</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                        category === cat
                          ? 'bg-[#d4f76d] text-black font-bold'
                          : 'border border-[#23232a] bg-[#0d0d10] text-[#8e8e9c] hover:text-white'
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
                className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="h-3.5 w-3.5" /> Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Result Count */}
        {!loading && !error && (
          <p className="text-xs text-[#8e8e9c]">
            {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
            {search && <span className="text-[#d4f76d]"> for "{search}"</span>}
          </p>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl border border-[#23232a] bg-[#16161a] p-4 space-y-3">
                <Skeleton className="aspect-video w-full rounded-xl bg-[#23232a]" />
                <Skeleton className="h-5 w-3/4 bg-[#23232a]" />
                <Skeleton className="h-4 w-full bg-[#23232a]" />
                <Skeleton className="h-4 w-1/2 bg-[#23232a]" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-800/40 bg-red-950/20 p-12 text-center">
            <p className="text-sm font-semibold text-red-400">{error}</p>
            <button
              onClick={() => loadCourses(search, level)}
              className="mt-4 rounded-full bg-[#16161a] border border-[#23232a] px-5 py-2 text-xs font-bold text-white hover:border-[#d4f76d] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCourses.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#23232a] p-16 text-center">
            <BookOpen className="mb-4 h-10 w-10 text-[#3c3c46]" />
            <h3 className="text-base font-bold text-white">
              {hasActiveFilter ? 'No courses match your filters' : 'No courses yet'}
            </h3>
            <p className="mt-2 text-xs text-[#8e8e9c]">
              {hasActiveFilter
                ? 'Try adjusting your search or clearing the filters.'
                : 'Check back soon for newly published courses.'}
            </p>
            {hasActiveFilter && (
              <button
                onClick={clearSearch}
                className="mt-5 rounded-full bg-[#16161a] border border-[#23232a] px-5 py-2 text-xs font-bold text-white hover:border-[#d4f76d] transition-colors"
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
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#23232a] bg-[#16161a] p-3 transition-all duration-200 hover:-translate-y-1 hover:border-[#34343d]"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#23232a]">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BookOpen className="h-10 w-10 text-[#3c3c46]" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d4f76d] text-black shadow-md">
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    </div>
                  </div>

                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col pt-3">
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {course.level && (
                      <span className="rounded-full bg-[#23232a] px-2.5 py-0.5 text-[10px] font-bold text-[#d4f76d] capitalize">
                        {course.level}
                      </span>
                    )}
                    {course.category && (
                      <span className="rounded-full bg-[#1c1c22] px-2.5 py-0.5 text-[10px] font-semibold text-[#8e8e9c]">
                        {course.category}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-[#d4f76d] line-clamp-2 transition-colors">
                    {course.title}
                  </h4>

                  <p className="mt-1.5 text-xs text-[#8e8e9c] line-clamp-2">
                    {course.description}
                  </p>

                  <div className="mt-auto pt-3 flex items-center justify-between border-t border-[#23232a] mt-4">
                    <span className="text-xs text-[#8e8e9c]">
                      {course._count?.lectures || 0} lessons
                      {course._count?.enrollments ? ` · ${course._count.enrollments} students` : ''}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#8e8e9c] group-hover:text-[#d4f76d] transition-colors">
                      Enroll Free <ArrowRight className="h-3 w-3" />
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
