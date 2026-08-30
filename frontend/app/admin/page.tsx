'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { SkillUpHeader } from '@/components/skillup-header';
import { Plus, BookOpen, Eye, Edit, ShieldCheck } from 'lucide-react';
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
    <div className="flex min-h-screen flex-col bg-[#0d0d10]">
      <SkillUpHeader title="Admin Panel" />

      <div className="p-6 lg:p-8 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-5">
            <h4 className="text-2xl font-extrabold text-[#d4f76d]">
              {loading ? '—' : courses.length}
            </h4>
            <p className="text-xs font-semibold text-[#8e8e9c] mt-1">Total Courses</p>
          </div>

          <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-5">
            <h4 className="text-2xl font-extrabold text-[#f9d8b9]">
              {loading ? '—' : courses.filter((c) => c.isPublished).length}
            </h4>
            <p className="text-xs font-semibold text-[#8e8e9c] mt-1">Published Courses</p>
          </div>

          <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-5">
            <h4 className="text-2xl font-extrabold text-[#bfe2ff]">
              {loading ? '—' : courses.filter((c) => !c.isPublished).length}
            </h4>
            <p className="text-xs font-semibold text-[#8e8e9c] mt-1">Drafts</p>
          </div>

          <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#d4f76d]" />
              <h4 className="text-sm font-extrabold text-white">Full Access</h4>
            </div>
            <p className="text-xs font-semibold text-[#8e8e9c] mt-1.5">Admin Privileges</p>
          </div>
        </div>

        {/* Knowledge Hub & Course Management Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#d4f76d]">
                <BookOpen className="h-5 w-5" />
                <h3 className="text-sm font-bold text-white">Courses & Video Syllabus</h3>
              </div>
              <p className="text-xs text-[#8e8e9c] mt-2">
                Create new curriculum, upload lecture videos/PDFs, or batch import YouTube playlists in 1 click.
              </p>
            </div>
            <div className="mt-5">
              <Link href="/admin/courses/new">
                <button className="flex items-center gap-2 rounded-full bg-[#d4f76d] px-5 py-2.5 text-xs font-bold text-black transition-all hover:bg-[#c4ea5c]">
                  <Plus className="h-4 w-4" /> Create Course
                </button>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#bfe2ff]">
                <BookOpen className="h-5 w-5" />
                <h3 className="text-sm font-bold text-white">Articles & Blog Engine</h3>
              </div>
              <p className="text-xs text-[#8e8e9c] mt-2">
                Write technical tutorials, case studies, and engineering updates for the community knowledge hub.
              </p>
            </div>
            <div className="mt-5 flex gap-2">
              <Link href="/admin/blogs">
                <button className="flex items-center gap-2 rounded-full border border-[#23232a] bg-[#0d0d10] px-4 py-2.5 text-xs font-bold text-white hover:border-[#d4f76d] transition-all">
                  Manage Articles
                </button>
              </Link>
              <Link href="/admin/blogs/new">
                <button className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-black hover:bg-slate-100 transition-all">
                  <Plus className="h-4 w-4" /> Write Article
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Courses Section Header */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-base font-bold text-white">All Courses</h2>
        </div>

        {/* Courses list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl bg-[#16161a]" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#23232a] p-16 text-center">
            <BookOpen className="mb-4 h-10 w-10 text-[#3c3c46]" />
            <h3 className="text-base font-bold text-white">No courses created yet</h3>
            <p className="mt-2 text-xs text-[#8e8e9c]">
              Get started by creating your first course.
            </p>
            <Link href="/admin/courses/new" className="mt-5">
              <button className="rounded-full bg-[#d4f76d] px-5 py-2.5 text-xs font-bold text-black hover:bg-[#c4ea5c]">
                Create Course
              </button>
            </Link>
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
                    {c.thumbnail ? (
                      <img
                        src={c.thumbnail}
                        alt={c.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#23232a]">
                        <BookOpen className="h-5 w-5 text-[#8e8e9c]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{c.title}</h4>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          c.isPublished
                            ? 'bg-[#d4f76d]/15 text-[#d4f76d]'
                            : 'bg-[#23232a] text-[#8e8e9c]'
                        }`}
                      >
                        {c.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8e8e9c] mt-0.5">
                      {c._count?.lectures || 0} Lessons • {c._count?.enrollments || 0} Students • {c.price === 0 ? 'Free' : formatPrice(c.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/courses/${c.id}`}>
                    <button className="flex items-center gap-1.5 rounded-full border border-[#23232a] bg-[#1c1c22] px-3.5 py-2 text-xs font-bold text-white hover:border-[#d4f76d]">
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                  </Link>
                  <Link href={`/admin/courses/${c.id}/edit`}>
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
