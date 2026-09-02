'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { SkillUpHeader } from '@/components/skillup-header';
import {
  Play,
  FileText,
  CheckCircle2,
  BookOpen,
  BrainCircuit,
  Globe,
  Award,
  ArrowLeft,
  ArrowRight,
  Flame,
  Star,
  Users,
  Code2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const featureHighlights = [
  { num: '01', title: 'High-Quality Video Syllabus', desc: 'Curated structured lessons from top engineers.' },
  { num: '02', title: 'Hands-on Coding & Practice', desc: 'Follow along with real-world examples.' },
  { num: '03', title: '24/7 AI Coding Mentor', desc: 'Instant doubts resolution grounded in the active video.' },
  { num: '04', title: 'Downloadable PDF Notes', desc: 'Cheatsheets and interview preparation guides.' },
  { num: '05', title: 'Zero Paywalls & Ads', desc: '100% free learning resource for developers.' },
  { num: '06', title: 'Open-Source Community', desc: 'Continuously updated with developer contributions.' },
];

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();
  const { isSignedIn, getToken } = useAuth();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [expandedEpisode, setExpandedEpisode] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourseDetails() {
      setLoading(true);
      const res = await fetchApi<any>(`/courses/${courseId}`);
      if (res.success && res.data) {
        setCourse(res.data);
      } else {
        setCourse({
          id: courseId,
          title: 'Data Structures & Algorithms in C++',
          description: 'Master time & space complexity, recursion, trees, graphs, and dynamic programming with Striver.',
          thumbnail: 'https://images.unsplash.com/photo-1516116211227-bbc159755490?w=800&auto=format&fit=crop&q=80',
          category: 'DSA',
          level: 'beginner',
          language: 'English',
          lectures: [
            { id: 'lec-1', title: 'Episode 01: Introduction & Complexity Analysis', description: 'Big O notation, memory models, and best coding practices.' },
            { id: 'lec-2', title: 'Episode 02: C++ Basics & STL Containers', description: 'Vectors, maps, sets, and iterators in depth.' },
            { id: 'lec-3', title: 'Episode 03: Recursion & Backtracking', description: 'Recursion tree formulation, base cases, and subsets generation.' },
          ],
        });
      }

      if (isSignedIn) {
        const token = await getToken();
        const myEnrollments = await fetchApi<any[]>('/enrollment/my-courses', { token });
        if (myEnrollments.success && myEnrollments.data) {
          const enrolled = myEnrollments.data.some((e: any) => e.courseId === courseId);
          setIsEnrolled(enrolled);
        }
      }
      setLoading(false);
    }
    loadCourseDetails();
  }, [courseId, isSignedIn, getToken]);

  const handleEnroll = async () => {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=/courses/${courseId}`);
      return;
    }

    setEnrolling(true);
    try {
      const token = await getToken();
      const res = await fetchApi(`/enrollment/free/${courseId}`, { method: 'POST', token });
      if (res.success) {
        setIsEnrolled(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-app p-8 space-y-6">
        <Skeleton className="h-10 w-48 bg-card" />
        <Skeleton className="h-64 w-full rounded-2xl bg-card" />
      </div>
    );
  }

  const firstLectureId = course?.lectures?.[0]?.id || 'lec-1';

  return (
    <div className="flex min-h-screen flex-col bg-app bg-grid-pattern">
      <SkillUpHeader title="Course Curriculum" />

      <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto w-full">
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-[#f97316] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to All Courses
        </Link>

        {/* NamasteDev Style Course Hero */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left 8 Cols: Course Metadata & Numbered Features & Syllabus */}
          <div className="space-y-10 lg:col-span-8">
            <div className="space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-[#f97316]/15 px-2.5 py-1 text-xs font-bold text-[#f97316] border border-[#f97316]/30">
                  <Flame className="h-3 w-3 fill-current" /> 100% Free Lifetime
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-[#f59e0b]/15 px-2.5 py-1 text-xs font-bold text-[#f59e0b] border border-[#f59e0b]/30">
                  <Star className="h-3 w-3 fill-current" /> 4.9 Rating
                </span>
                <span className="rounded-md bg-card-2 px-2.5 py-1 text-xs font-medium text-muted">
                  {course.category || 'Engineering'}
                </span>
                <span className="rounded-md bg-card-2 px-2.5 py-1 text-xs font-medium text-muted">
                  {course.level || 'Beginner to Pro'}
                </span>
              </div>

              {/* Title & Description */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-app leading-tight">
                {course.title}
              </h1>

              <p className="text-sm sm:text-base leading-relaxed text-muted font-normal">
                {course.description || 'Master fundamental concepts through high-quality structured video lessons.'}
              </p>

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center gap-6 border-t border-app pt-4 text-xs font-semibold text-muted">
                <span className="flex items-center gap-1.5 text-app">
                  <Globe className="h-4 w-4 text-[#f97316]" /> {course.language || 'English / Hindi'}
                </span>
                <span className="flex items-center gap-1.5 text-app">
                  <BookOpen className="h-4 w-4 text-[#f97316]" /> {course.lectures?.length || 0} Lessons
                </span>
                <span className="flex items-center gap-1.5 text-app">
                  <Users className="h-4 w-4 text-[#f97316]" /> Verified Open Curriculum
                </span>
              </div>
            </div>

            {/* NamasteDev Numbered Feature Pills Grid (01 to 06) */}
            <div className="space-y-4">
              <h2 className="text-lg font-black text-app flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#f97316]" /> What You Will Get
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {featureHighlights.map((feat) => (
                  <div
                    key={feat.num}
                    className="flex items-start gap-3.5 rounded-2xl border border-app bg-card p-4 hover:border-[#f97316]/40 transition-colors"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#f97316]/10 text-xs font-black text-[#f97316] border border-[#f97316]/20">
                      {feat.num}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-app">{feat.title}</h4>
                      <p className="text-[11px] text-muted mt-0.5">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Episode-wise Syllabus Accordion */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-app">Curriculum & Syllabus</h2>
                  <p className="text-xs text-muted mt-0.5">
                    {course.lectures?.length || 0} sequential video episodes with AI doubt assistance.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {course.lectures?.map((lec: any, idx: number) => {
                  const isExpanded = expandedEpisode === (lec.id || String(idx));
                  return (
                    <div
                      key={lec.id || idx}
                      className="overflow-hidden rounded-2xl border border-app bg-card transition-colors hover:border-[#f97316]/30"
                    >
                      <div
                        onClick={() => setExpandedEpisode(isExpanded ? null : (lec.id || String(idx)))}
                        className="flex items-center justify-between p-4 cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 pr-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card-2 text-xs font-black text-[#f97316]">
                            {idx + 1}
                          </div>
                          <span className="text-xs sm:text-sm font-bold text-app truncate">
                            {lec.title.startsWith('Episode') ? lec.title : `Episode ${idx + 1}: ${lec.title}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <Link
                            href={`/courses/${courseId}/learn/${lec.id || firstLectureId}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button className="flex items-center gap-1.5 rounded-full bg-[#f97316]/10 px-3.5 py-1.5 text-xs font-bold text-[#f97316] hover:bg-[#f97316] hover:text-white transition-colors border border-[#f97316]/20">
                              <Play className="h-3 w-3 fill-current" /> Watch
                            </button>
                          </Link>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted" />
                          )}
                        </div>
                      </div>

                      {/* Accordion Expanded Notes */}
                      {isExpanded && lec.description && (
                        <div className="border-t border-app bg-[#0c0d11] p-4 text-xs text-muted leading-relaxed">
                          {lec.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Sticky Enroll & Preview Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 rounded-3xl border border-app bg-card p-5 space-y-6 shadow-2xl">
              {/* Thumbnail with Play Overlay */}
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-app">
                <img
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1516116211227-bbc159755490?w=800&auto=format&fit=crop&q=80'}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
                <Link
                  href={`/courses/${courseId}/learn/${firstLectureId}`}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-all"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f97316] text-white shadow-xl shadow-[#f97316]/50 hover:scale-110 transition-transform">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                </Link>
              </div>

              {/* Price & Guarantee */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-app">Free</span>
                  <span className="rounded-full bg-[#f97316]/15 px-2.5 py-0.5 text-xs font-bold text-[#f97316]">
                    100% Free Access
                  </span>
                </div>
                <p className="text-xs text-muted mt-1 font-medium">
                  Zero hidden fees • Lifetime open access
                </p>
              </div>

              {/* Action Button */}
              {isEnrolled ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-2xl bg-[#f97316]/10 p-3.5 text-xs font-bold text-[#f97316] border border-[#f97316]/30">
                    <CheckCircle2 className="h-4 w-4" /> You are enrolled in this track
                  </div>
                  <Link href={`/courses/${courseId}/learn/${firstLectureId}`} className="block">
                    <button className="flex w-full items-center justify-center gap-2 rounded-full glow-amber-btn py-3.5 text-xs sm:text-sm font-bold text-white transition-all">
                      Continue Learning <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full rounded-full glow-amber-btn py-3.5 text-xs sm:text-sm font-bold text-white transition-all disabled:opacity-50"
                  >
                    {enrolling ? 'Joining...' : 'Start Learning Now (Free)'}
                  </button>
                  <Link href={`/courses/${courseId}/learn/${firstLectureId}`} className="block text-center">
                    <span className="text-xs text-muted hover:text-[#f97316] underline">
                      Or preview 1st lesson directly
                    </span>
                  </Link>
                </div>
              )}

              {/* Course Benefits List */}
              <div className="border-t border-app pt-4 space-y-2.5 text-xs text-muted">
                <p className="flex items-center gap-2.5 text-[#d1d5db] font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-[#f97316]" /> {course.lectures?.length || 0} Sequential Video Lectures
                </p>
                <p className="flex items-center gap-2.5 text-[#d1d5db] font-semibold">
                  <BrainCircuit className="h-4 w-4 text-[#f97316]" /> 24/7 AI Coding Mentor in Player
                </p>
                <p className="flex items-center gap-2.5 text-[#d1d5db] font-semibold">
                  <FileText className="h-4 w-4 text-[#f97316]" /> Downloadable Study PDFs & Notes
                </p>
                <p className="flex items-center gap-2.5 text-[#d1d5db] font-semibold">
                  <Code2 className="h-4 w-4 text-[#f97316]" /> Real-world Algorithm & Code Walkthroughs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
