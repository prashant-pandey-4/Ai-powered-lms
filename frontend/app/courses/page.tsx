'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SkillUpHeader } from '@/components/skillup-header';
import { Search, BookOpen, Play, ArrowRight } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';

export default function CoursesCatalogPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      setError('');
      try {
        const res = await fetchApi<any[]>('/courses');
        if (res.success && Array.isArray(res.data)) {
          setCourses(res.data);
        } else {
          setError(res.message || 'Failed to load courses.');
        }
      } catch (err: any) {
        setError('Unable to connect to server. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const filteredCourses = courses.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0d10]">
      <SkillUpHeader title="Course Library" />

      <div className="p-6 lg:p-8 space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#8e8e9c]" />
          <input
            type="text"
            placeholder="Search courses by title, topic or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-full border border-[#23232a] bg-[#16161a] pl-10 pr-4 text-xs text-white placeholder:text-[#6c6c7a] focus:border-[#d4f76d] focus:outline-none"
          />
        </div>

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
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-[#16161a] border border-[#23232a] px-5 py-2 text-xs font-bold text-white hover:border-[#d4f76d] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCourses.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#23232a] p-16 text-center">
            <BookOpen className="mb-4 h-10 w-10 text-[#3c3c46]" />
            <h3 className="text-base font-bold text-white">
              {search ? 'No courses found' : 'No courses yet'}
            </h3>
            <p className="mt-2 text-xs text-[#8e8e9c]">
              {search
                ? `No results for "${search}". Try a different keyword.`
                : 'Be the first to publish a course for this community.'}
            </p>
            {!search && (
              <Link href="/instructor/courses/new" className="mt-5">
                <button className="rounded-full bg-[#d4f76d] px-5 py-2.5 text-xs font-bold text-black hover:bg-[#c4ea5c] transition-all">
                  Create First Course
                </button>
              </Link>
            )}
          </div>
        )}

        {/* Course Grid */}
        {!loading && !error && filteredCourses.length > 0 && (
          <>
            <p className="text-xs text-[#8e8e9c]">
              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available
            </p>

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
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-[#d4f76d] line-clamp-2 transition-colors">
                        {course.title}
                      </h4>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      {course.level && (
                        <span className="rounded-full bg-[#23232a] px-2.5 py-0.5 text-[10px] font-bold text-[#d4f76d]">
                          {course.level}
                        </span>
                      )}
                      {course.category && (
                        <span className="rounded-full bg-[#1c1c22] px-2.5 py-0.5 text-[10px] font-semibold text-[#8e8e9c]">
                          {course.category}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-xs text-[#8e8e9c] line-clamp-2">
                      {course.description}
                    </p>

                    <div className="mt-auto pt-3 flex items-center justify-between border-t border-[#23232a] mt-4">
                      <span className="text-sm font-extrabold text-white">
                        {course.price === 0 ? 'Free' : formatPrice(course.price)}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#8e8e9c] group-hover:text-[#d4f76d] transition-colors">
                        View Course <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
