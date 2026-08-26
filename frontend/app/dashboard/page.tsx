'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth, useUser } from '@clerk/nextjs';
import { SkillUpHeader } from '@/components/skillup-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, CheckCircle2, Play, Compass, Award } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function StudentDashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const token = await getToken();
        const res = await fetchApi<any[]>('/enrollment/my-courses', { token });
        if (res.success && res.data && res.data.length > 0) {
          setEnrollments(res.data);
        } else {
          // Curated sample enrolled course if new
          setEnrollments([
            {
              id: 'enrolled-1',
              progress: 25,
              course: {
                id: 'course-1',
                title: 'Start in Web Design: Typography & Wireframing',
                thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
                instructor: { name: 'Esther Howard' },
              },
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to load enrollments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [getToken]);

  const completedCount = enrollments.filter((e) => e.progress === 100).length;

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0d10]">
      <SkillUpHeader title="My Courses" />

      <div className="p-6 lg:p-8 space-y-8">
        {/* Top 3 Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-5">
            <p className="text-xs font-semibold text-[#8e8e9c]">Enrolled Courses</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              {loading ? '...' : enrollments.length}
            </h3>
          </div>

          <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-5">
            <p className="text-xs font-semibold text-[#8e8e9c]">Completed Courses</p>
            <h3 className="text-2xl font-extrabold text-[#d4f76d] mt-1">
              {loading ? '...' : completedCount}
            </h3>
          </div>

          <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-5">
            <p className="text-xs font-semibold text-[#8e8e9c]">Certificates Earned</p>
            <h3 className="text-2xl font-extrabold text-[#bfe2ff] mt-1">
              {loading ? '...' : completedCount}
            </h3>
          </div>
        </div>

        {/* Enrolled Courses Grid */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-white">In Progress & Enrolled</h2>
            <Link href="/courses">
              <button className="flex items-center gap-1.5 text-xs font-semibold text-[#8e8e9c] hover:text-[#d4f76d] transition-colors">
                <Compass className="h-3.5 w-3.5" />
                Browse Catalog
              </button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-[#23232a] bg-[#16161a] p-4 space-y-3">
                  <Skeleton className="aspect-video w-full rounded-xl bg-[#23232a]" />
                  <Skeleton className="h-5 w-3/4 bg-[#23232a]" />
                  <Skeleton className="h-3 w-full bg-[#23232a]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {enrollments.map((item) => {
                const course = item.course;
                if (!course) return null;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-[#23232a] bg-[#16161a] p-4 transition-all hover:border-[#34343d]"
                  >
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                      <img
                        src={course.thumbnail || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80'}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
                      {item.progress === 100 && (
                        <div className="absolute top-3 right-3">
                          <span className="rounded-full bg-[#d4f76d] px-2.5 py-1 text-[10px] font-bold text-black">
                            Completed
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col pt-4">
                      <h3 className="text-sm font-bold text-white line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="mt-1 text-xs text-[#8e8e9c]">
                        Instructor: {course.instructor?.name || 'Esther Howard'}
                      </p>

                      <div className="mt-auto pt-4 space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-[#8e8e9c]">
                          <span>Progress</span>
                          <span className="text-[#d4f76d]">{item.progress}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#23232a]">
                          <div
                            className="h-full bg-[#d4f76d] transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#23232a]">
                        <Link href={`/courses/${course.id}`} className="block">
                          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d4f76d] py-2.5 text-xs font-bold text-black transition-all hover:bg-[#c4ea5c]">
                            <Play className="h-3.5 w-3.5 fill-current" />
                            {item.progress === 100 ? 'Review Course' : 'Continue Learning'}
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
    </div>
  );
}
