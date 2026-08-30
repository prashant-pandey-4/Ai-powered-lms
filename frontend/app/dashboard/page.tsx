'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { SkillUpHeader } from '@/components/skillup-header';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Play, GraduationCap, CheckCircle2, Compass } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function StudentDashboardPage() {
  const { getToken } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      } catch (err: any) {
        setError('Unable to connect to server. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [getToken]);

  const completedCount = enrollments.filter((e) => e.progress === 100).length;
  const inProgressCount = enrollments.filter((e) => e.progress > 0 && e.progress < 100).length;

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0d10]">
      <SkillUpHeader title="My Courses" />

      <div className="p-6 lg:p-8 space-y-8">

        {/* Stats — only show when data is loaded */}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-5">
              <p className="text-xs font-semibold text-[#8e8e9c]">Enrolled</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">{enrollments.length}</h3>
            </div>
            <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-5">
              <p className="text-xs font-semibold text-[#8e8e9c]">In Progress</p>
              <h3 className="text-2xl font-extrabold text-[#d4f76d] mt-1">{inProgressCount}</h3>
            </div>
            <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-5">
              <p className="text-xs font-semibold text-[#8e8e9c]">Completed</p>
              <h3 className="text-2xl font-extrabold text-[#bfe2ff] mt-1">{completedCount}</h3>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Enrolled Courses</h2>
          <Link href="/">
            <button className="flex items-center gap-1.5 text-xs font-semibold text-[#8e8e9c] hover:text-[#d4f76d] transition-colors">
              <Compass className="h-3.5 w-3.5" />
              Explore Courses
            </button>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-[#23232a] bg-[#16161a] p-4 space-y-3">
                <Skeleton className="aspect-video w-full rounded-xl bg-[#23232a]" />
                <Skeleton className="h-5 w-3/4 bg-[#23232a]" />
                <Skeleton className="h-3 w-full bg-[#23232a]" />
                <Skeleton className="h-8 w-full rounded-xl bg-[#23232a]" />
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
        {!loading && !error && enrollments.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#23232a] p-16 text-center">
            <GraduationCap className="mb-4 h-10 w-10 text-[#3c3c46]" />
            <h3 className="text-base font-bold text-white">No courses yet</h3>
            <p className="mt-2 max-w-xs text-xs text-[#8e8e9c]">
              You haven&apos;t enrolled in any courses. Explore courses and start learning today.
            </p>
            <Link href="/" className="mt-6">
              <button className="rounded-full bg-[#d4f76d] px-6 py-2.5 text-xs font-bold text-black hover:bg-[#c4ea5c] transition-all">
                Explore Courses
              </button>
            </Link>
          </div>
        )}

        {/* Enrolled Courses Grid */}
        {!loading && !error && enrollments.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((item) => {
              const course = item.course;
              if (!course) return null;

              return (
                <div
                  key={item.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-[#23232a] bg-[#16161a] p-4 transition-all hover:border-[#34343d]"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#23232a]">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <BookOpen className="h-8 w-8 text-[#3c3c46]" />
                      </div>
                    )}
                    {item.progress === 100 && (
                      <div className="absolute top-2.5 right-2.5">
                        <span className="rounded-full bg-[#d4f76d] px-2.5 py-1 text-[10px] font-bold text-black">
                          Completed
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col pt-4">
                    <h3 className="text-sm font-bold text-white line-clamp-2">
                      {course.title}
                    </h3>
                    {course.instructor?.name && (
                      <p className="mt-1 text-xs text-[#8e8e9c]">
                        by {course.instructor.name}
                      </p>
                    )}

                    {/* Progress Bar */}
                    <div className="mt-auto pt-4 space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-[#8e8e9c]">
                        <span>Progress</span>
                        <span className="text-[#d4f76d]">{item.progress ?? 0}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#23232a]">
                        <div
                          className="h-full bg-[#d4f76d] transition-all duration-300 rounded-full"
                          style={{ width: `${item.progress ?? 0}%` }}
                        />
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="mt-4 pt-3 border-t border-[#23232a]">
                      <Link href={`/courses/${course.id}`} className="block">
                        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d4f76d] py-2.5 text-xs font-bold text-black transition-all hover:bg-[#c4ea5c]">
                          <Play className="h-3.5 w-3.5 fill-current" />
                          {item.progress === 100 ? 'Review Course' : item.progress > 0 ? 'Continue Learning' : 'Start Course'}
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
