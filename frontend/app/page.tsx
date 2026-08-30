'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SkillUpHeader } from '@/components/skillup-header';
import { BookOpen, ArrowRight, GraduationCap, Play } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchApi<any[]>('/courses');
        if (res.success && Array.isArray(res.data)) {
          setCourses(res.data.slice(0, 6));
        }
      } catch (_) {
        // fail silently — empty state will show
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0d10]">
      <SkillUpHeader title="Dashboard" />

      <div className="p-6 lg:p-8 space-y-10">

        {/* Welcome Hero — renders instantly, no API dependency */}
        <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-white">
                Welcome to <span className="text-[#d4f76d]">SkillUP</span> 👋
              </h1>
              <p className="mt-2 max-w-lg text-sm text-[#8e8e9c]">
                Explore our courses, enroll in what interests you, and track your progress — all in one place.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/dashboard">
                  <button className="flex items-center gap-2 rounded-full bg-[#d4f76d] px-6 py-2.5 text-xs font-bold text-black hover:bg-[#c4ea5c] transition-all">
                    <GraduationCap className="h-4 w-4" />
                    My Courses
                  </button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 shrink-0">
              <div className="rounded-xl border border-[#23232a] bg-[#0d0d10] p-4 text-center">
                <p className="text-2xl font-extrabold text-[#d4f76d]">
                  {loading ? '—' : courses.length}
                </p>
                <p className="text-[11px] font-semibold text-[#8e8e9c] mt-0.5">Courses Available</p>
              </div>
              <div className="rounded-xl border border-[#23232a] bg-[#0d0d10] p-4 text-center">
                <p className="text-2xl font-extrabold text-[#bfe2ff]">Free</p>
                <p className="text-[11px] font-semibold text-[#8e8e9c] mt-0.5">To Get Started</p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Courses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Available Courses</h2>
          </div>

          {/* Loading skeletons — page doesn't blank out */}
          {loading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-2xl border border-[#23232a] bg-[#16161a] p-3 space-y-3">
                  <Skeleton className="aspect-[16/10] w-full rounded-xl bg-[#23232a]" />
                  <Skeleton className="h-5 w-3/4 bg-[#23232a]" />
                  <Skeleton className="h-4 w-1/2 bg-[#23232a]" />
                  <Skeleton className="h-4 w-1/3 bg-[#23232a]" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && courses.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#23232a] p-16 text-center">
              <BookOpen className="mb-4 h-10 w-10 text-[#3c3c46]" />
              <h3 className="text-base font-bold text-white">No courses yet</h3>
              <p className="mt-2 text-xs text-[#8e8e9c]">
                No published courses available right now.
              </p>
            </div>
          )}

          {/* Course cards */}
          {!loading && courses.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course: any) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#23232a] bg-[#16161a] p-3 transition-all duration-200 hover:-translate-y-1 hover:border-[#34343d]"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#23232a]">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <BookOpen className="h-8 w-8 text-[#3c3c46]" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d4f76d] text-black shadow-md">
                        <Play className="h-4 w-4 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col pt-3">
                    <h4 className="text-sm font-bold text-white group-hover:text-[#d4f76d] line-clamp-2 transition-colors">
                      {course.title}
                    </h4>

                    <div className="mt-2 flex flex-wrap gap-1.5">
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

                    <div className="mt-auto pt-3 flex items-center justify-between border-t border-[#23232a] mt-4">
                      <span className="text-sm font-extrabold text-white">
                        {course.price === 0 ? 'Free' : formatPrice(course.price)}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#8e8e9c] group-hover:text-[#d4f76d] transition-colors">
                        View <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
