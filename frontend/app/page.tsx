'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SkillUpHeader } from '@/components/skillup-header';
import {
  BookOpen,
  ArrowRight,
  GraduationCap,
  Play,
  Flame,
  Sparkles,
  Bot,
  FileText,
  CheckCircle2,
  Star,
  Users,
  Code2,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchApi<any[]>('/courses');
        if (res.success && Array.isArray(res.data)) {
          setCourses(res.data);
        }
      } catch (_) {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-app bg-grid-pattern">
      <SkillUpHeader title="Explore Courses" />

      <div className="p-6 lg:p-10 space-y-12 max-w-7xl mx-auto w-full">
        {/* NamasteDev Style Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-app bg-card/80 p-8 lg:p-12 backdrop-blur-xl shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-6">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-4 py-1.5 text-xs font-bold text-[#f97316]">
              <Flame className="h-3.5 w-3.5 fill-current" />
              <span>ZERO PAYWALLS Â· 100% FREE DEVELOPER ACADEMY</span>
            </div>

            {/* Glowing Main Heading */}
            <h1 className="text-3xl font-black tracking-tight text-app sm:text-5xl lg:text-6xl leading-[1.15]">
              Learn. Build. Grow. <br />
              <span className="gradient-text-orange">Master Tech With Top Content</span>
            </h1>

            <p className="text-sm sm:text-base text-muted leading-relaxed max-w-2xl font-medium">
              Curated, battle-tested computer science curriculum from the world&apos;s best engineers.
              Video syllabus, 24/7 video-grounded AI mentor, and study notes â€” completely free forever.
            </p>

            {/* Key Value Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#d1d5db] pt-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#f97316]" /> 1-Click Free Enrollment
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#f97316]" /> Active Video AI Mentor
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#f97316]" /> Open-Source Curriculum
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link href="/courses">
                <button className="flex items-center gap-2 rounded-full glow-amber-btn px-6 py-3 text-xs sm:text-sm font-bold text-white transition-all">
                  <Flame className="h-4 w-4 fill-current" />
                  Explore All Courses
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="flex items-center gap-2 rounded-full border border-app bg-card-2 px-6 py-3 text-xs sm:text-sm font-bold text-white hover:border-[#f97316]/60 transition-colors">
                  <GraduationCap className="h-4 w-4" />
                  My Learning Room
                </button>
              </Link>
            </div>
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-[#f97316]/10 blur-3xl pointer-events-none" />
        </div>

        {/* Bento Grid ("Why SkillUP") */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#f97316]">Core Features</p>
              <h2 className="text-xl sm:text-2xl font-black text-app">Why Learn on SkillUP?</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-app bg-card p-5 space-y-3 hover:border-[#f97316]/40 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f97316]/15 text-[#f97316]">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-app">Curated Syllabus</h3>
              <p className="text-xs text-muted leading-relaxed">
                Sequential lessons from Striver, Akshay Saini, and top engineering creators organized logically.
              </p>
            </div>

            <div className="rounded-2xl border border-app bg-card p-5 space-y-3 hover:border-[#f97316]/40 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f59e0b]/15 text-[#f59e0b]">
                <Bot className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-app">24/7 AI Mentor</h3>
              <p className="text-xs text-muted leading-relaxed">
                Powered by Gemini 3.6 Flash. Resolves code doubts in real-time grounded in the active video.
              </p>
            </div>

            <div className="rounded-2xl border border-app bg-card p-5 space-y-3 hover:border-[#f97316]/40 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#38bdf8]/15 text-[#38bdf8]">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-app">Study Notes & PDFs</h3>
              <p className="text-xs text-muted leading-relaxed">
                Downloadable cheatsheets, GitHub starter code, and interview revision guides per lesson.
              </p>
            </div>

            <div className="rounded-2xl border border-app bg-card p-5 space-y-3 hover:border-[#f97316]/40 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a855f7]/15 text-[#a855f7]">
                <Code2 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-app">Open Source</h3>
              <p className="text-xs text-muted leading-relaxed">
                100% community-driven. Developers across the globe contribute new courses and roadmaps via PRs.
              </p>
            </div>
          </div>
        </div>

        {/* Featured Courses Grid */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#f97316]">Featured Courses</p>
              <h2 className="text-xl sm:text-2xl font-black text-app">Explore Top Tracks</h2>
            </div>
            <Link
              href="/courses"
              className="text-xs font-bold text-[#f97316] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-app bg-card p-4 space-y-3">
                  <Skeleton className="aspect-video w-full rounded-xl bg-card-2" />
                  <Skeleton className="h-5 w-3/4 bg-card-2" />
                  <Skeleton className="h-4 w-1/2 bg-card-2" />
                </div>
              ))}
            </div>
          )}

          {!loading && courses.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-app p-16 text-center bg-card">
              <BookOpen className="mb-4 h-10 w-10 text-subtle" />
              <h3 className="text-base font-bold text-app">No courses published yet</h3>
              <p className="mt-2 text-xs text-muted">Check back soon or create one in Admin Studio.</p>
            </div>
          )}

          {!loading && courses.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course: any) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-app bg-card p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-[#f97316]/50 hover:shadow-xl hover:shadow-[#f97316]/5"
                >
                  {/* 16:9 Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-app">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-card-2">
                        <BookOpen className="h-8 w-8 text-subtle" />
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
                    <div className="flex items-center justify-between text-[11px] text-muted">
                      <span className="flex items-center gap-1 text-[#f59e0b] font-bold">
                        <Star className="h-3 w-3 fill-current" /> 4.9
                      </span>
                      <span>{course._count?.lectures || 0} Lessons</span>
                      <span className="rounded bg-card-2 px-1.5 py-0.5 text-[10px] text-muted">
                        English / Hindi
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-app group-hover:text-[#f97316] line-clamp-2 transition-colors">
                      {course.title}
                    </h4>

                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                      {course.description || 'Master fundamental concepts through high-quality structured video lessons.'}
                    </p>

                    {/* Bottom CTA & Free Badge */}
                    <div className="mt-auto pt-3 flex items-center justify-between border-t border-app">
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
    </div>
  );
}
