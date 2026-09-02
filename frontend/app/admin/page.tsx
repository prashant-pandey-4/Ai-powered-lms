'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { SkillUpHeader } from '@/components/skillup-header';
import { Plus, BookOpen, Eye, Edit, ShieldCheck, Flame, Sparkles } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboardPage() {
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
          setCourses([]);
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
    <div className="flex min-h-screen flex-col bg-[#060709] bg-grid-pattern">
      <SkillUpHeader title="Admin Studio" />

      <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#22232a] bg-[#111217] p-5 space-y-1">
            <h4 className="text-3xl font-black text-[#f97316]">
              {loading ? '—' : courses.length}
            </h4>
            <p className="text-xs font-bold text-[#9ca3af]">Total Courses</p>
          </div>

          <div className="rounded-2xl border border-[#22232a] bg-[#111217] p-5 space-y-1">
            <h4 className="text-3xl font-black text-[#f59e0b]">
              {loading ? '—' : courses.filter((c) => c.isPublished).length}
            </h4>
            <p className="text-xs font-bold text-[#9ca3af]">Published Courses</p>
          </div>

          <div className="rounded-2xl border border-[#22232a] bg-[#111217] p-5 space-y-1">
            <h4 className="text-3xl font-black text-[#38bdf8]">
              {loading ? '—' : courses.filter((c) => !c.isPublished).length}
            </h4>
            <p className="text-xs font-bold text-[#9ca3af]">Draft Tracks</p>
          </div>

          <div className="rounded-2xl border border-[#22232a] bg-[#111217] p-5 space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#f97316]" />
              <h4 className="text-sm font-black text-white">Full Access</h4>
            </div>
            <p className="text-xs font-bold text-[#9ca3af] mt-1">Super Admin Role</p>
          </div>
        </div>

        {/* Quick Studio Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-[#22232a] bg-[#111217] p-6 flex flex-col justify-between hover:border-[#f97316]/40 transition-colors">
            <div>
              <div className="flex items-center gap-2 text-[#f97316]">
                <BookOpen className="h-5 w-5" />
                <h3 className="text-sm sm:text-base font-bold text-white">Course & Playlist Studio</h3>
              </div>
              <p className="text-xs text-[#9ca3af] mt-2 leading-relaxed">
                Create new curriculum, upload videos/PDFs, or 1-click batch import complete YouTube playlists into syllabus.
              </p>
            </div>
            <div className="mt-6">
              <Link href="/admin/courses/new">
                <button className="flex items-center gap-2 rounded-full glow-amber-btn px-5 py-2.5 text-xs font-bold text-white transition-all">
                  <Plus className="h-4 w-4" /> Create New Course
                </button>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-[#22232a] bg-[#111217] p-6 flex flex-col justify-between hover:border-[#38bdf8]/40 transition-colors">
            <div>
              <div className="flex items-center gap-2 text-[#38bdf8]">
                <BookOpen className="h-5 w-5" />
                <h3 className="text-sm sm:text-base font-bold text-white">Knowledge Hub Articles</h3>
              </div>
              <p className="text-xs text-[#9ca3af] mt-2 leading-relaxed">
                Publish technical tutorials, algorithm breakdowns, and engineering guides with markdown support.
              </p>
            </div>
            <div className="mt-6 flex gap-2">
              <Link href="/admin/blogs">
                <button className="flex items-center gap-2 rounded-full border border-[#22232a] bg-[#17181f] px-4 py-2.5 text-xs font-bold text-white hover:border-[#38bdf8] transition-all">
                  Manage Articles
                </button>
              </Link>
              <Link href="/admin/blogs/new">
                <button className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-black hover:bg-slate-200 transition-all">
                  <Plus className="h-4 w-4" /> Write Article
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Courses Section Header */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-lg font-black text-white">Course Management</h2>
        </div>

        {/* Courses list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl bg-[#111217]" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#22232a] p-16 text-center bg-[#111217]">
            <BookOpen className="mb-4 h-10 w-10 text-[#6b7280]" />
            <h3 className="text-base font-bold text-white">No courses created yet</h3>
            <p className="mt-2 text-xs text-[#9ca3af]">
              Get started by importing a YouTube playlist or creating your first course.
            </p>
            <Link href="/admin/courses/new" className="mt-5">
              <button className="rounded-full glow-amber-btn px-6 py-2.5 text-xs font-bold text-white">
                Create Course
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((c) => (
              <div
                key={c.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#22232a] bg-[#111217] p-4 transition-colors hover:border-[#f97316]/40"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-24 shrink-0 overflow-hidden rounded-xl bg-black border border-[#22232a]">
                    {c.thumbnail ? (
                      <img
                        src={c.thumbnail}
                        alt={c.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#17181f]">
                        <BookOpen className="h-5 w-5 text-[#9ca3af]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{c.title}</h4>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          c.isPublished
                            ? 'bg-[#f97316]/15 text-[#f97316]'
                            : 'bg-[#17181f] text-[#9ca3af]'
                        }`}
                      >
                        {c.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9ca3af] mt-0.5">
                      {c._count?.lectures || 0} Lessons • {c._count?.enrollments || 0} Students • {c.price === 0 ? 'Free' : formatPrice(c.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/courses/${c.id}`}>
                    <button className="flex items-center gap-1.5 rounded-full border border-[#22232a] bg-[#17181f] px-4 py-2 text-xs font-bold text-white hover:border-[#f97316] transition-colors">
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                  </Link>
                  <Link href={`/admin/courses/${c.id}/edit`}>
                    <button className="flex items-center gap-1.5 rounded-full glow-amber-btn px-4 py-2 text-xs font-bold text-white transition-all">
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
