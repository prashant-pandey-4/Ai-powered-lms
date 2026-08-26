'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { SkillUpHeader } from '@/components/skillup-header';
import { Plus, BookOpen, Users, Eye, Edit, Video } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function InstructorDashboardPage() {
  const { getToken } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const token = await getToken();
        const res = await fetchApi<any[]>('/courses', { token });
        if (res.success && res.data && res.data.length > 0) {
          setCourses(res.data);
        } else {
          setCourses([
            {
              id: 'course-1',
              title: 'Start in Web Design: Typography & Layouts',
              isPublished: true,
              price: 25,
              _count: { lectures: 6, enrollments: 1435 },
              thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
            },
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [getToken]);

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0d10]">
      <SkillUpHeader title="Instructor Studio" />

      <div className="p-6 lg:p-8 space-y-8">
        {/* 4 Exact Stats Cards from the SkillUP Mobile/Dashboard view */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-5">
            <h4 className="text-2xl font-extrabold text-white">11 552</h4>
            <p className="text-xs font-semibold text-[#d4f76d] mt-1">Students (+26 today)</p>
          </div>

          <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-5">
            <h4 className="text-2xl font-extrabold text-[#f9d8b9]">{courses.length}</h4>
            <p className="text-xs font-semibold text-[#8e8e9c] mt-1">Active Courses</p>
          </div>

          <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-5">
            <h4 className="text-2xl font-extrabold text-[#bfe2ff]">$112 588</h4>
            <p className="text-xs font-semibold text-[#8e8e9c] mt-1">Total Earning</p>
          </div>

          <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-5">
            <h4 className="text-2xl font-extrabold text-white">619 hrs</h4>
            <p className="text-xs font-semibold text-[#8e8e9c] mt-1">Activity Today</p>
          </div>
        </div>

        {/* Courses Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Your Courses</h2>
          <Link href="/instructor/courses/new">
            <button className="flex items-center gap-2 rounded-full bg-[#d4f76d] px-5 py-2.5 text-xs font-bold text-black transition-all hover:bg-[#c4ea5c]">
              <Plus className="h-4 w-4" /> Create Course
            </button>
          </Link>
        </div>

        {/* Courses list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl bg-[#16161a]" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((c) => (
              <div
                key={c.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#23232a] bg-[#16161a] p-5 transition-colors hover:border-[#34343d]"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-20 shrink-0 overflow-hidden rounded-xl bg-black">
                    <img
                      src={c.thumbnail || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80'}
                      alt={c.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{c.title}</h4>
                      <span className="rounded-full bg-[#d4f76d]/15 px-2 py-0.5 text-[10px] font-bold text-[#d4f76d]">
                        {c.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8e8e9c] mt-0.5">
                      {c._count?.lectures || 0} Lessons • {c._count?.enrollments || 0} Students
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/courses/${c.id}`}>
                    <button className="flex items-center gap-1.5 rounded-full border border-[#23232a] bg-[#1c1c22] px-3.5 py-2 text-xs font-bold text-white hover:border-[#d4f76d]">
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                  </Link>
                  <Link href={`/instructor/courses/${c.id}/edit`}>
                    <button className="flex items-center gap-1.5 rounded-full bg-[#d4f76d] px-4 py-2 text-xs font-bold text-black hover:bg-[#c4ea5c]">
                      <Edit className="h-3.5 w-3.5" /> Manage
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
