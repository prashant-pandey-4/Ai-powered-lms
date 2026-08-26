'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { SkillUpHeader } from '@/components/skillup-header';
import { Play, FileText, Lock, CheckCircle2, BookOpen, BrainCircuit, Globe, Award, ArrowLeft, ArrowRight } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();
  const { isSignedIn, getToken } = useAuth();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    async function loadCourseDetails() {
      setLoading(true);
      const res = await fetchApi<any>(`/courses/${courseId}`);
      if (res.success && res.data) {
        setCourse(res.data);
      } else {
        // Sample fallback course
        setCourse({
          id: courseId,
          title: 'Start in Web Design: Typography, Wireframing & Responsive Layouts',
          description: 'Learn foundational UI/UX design rules, typography hierarchy, responsive grids, and design systems for production web apps.',
          thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
          category: 'UX/UI',
          level: 'Basic',
          price: 25,
          language: 'English',
          instructor: { name: 'Esther Howard' },
          lectures: [
            { id: 'lec-1', title: '01. Introduction to Digital Typography', duration: 720, isFree: true },
            { id: 'lec-2', title: '02. Hierarchy & Readability Rules', duration: 900, isFree: false },
            { id: 'lec-3', title: '03. Modern Color Systems & Contrast', duration: 1100, isFree: false },
            { id: 'lec-4', title: '04. Wireframing Mobile & Desktop Screens', duration: 1400, isFree: false },
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
      if (course?.price === 0) {
        const res = await fetchApi(`/enrollment/free/${courseId}`, { method: 'POST', token });
        if (res.success) {
          setIsEnrolled(true);
        }
      } else {
        // Direct proceed for testing
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
      <div className="flex min-h-screen flex-col bg-[#0d0d10] p-8 space-y-6">
        <Skeleton className="h-10 w-48 bg-[#16161a]" />
        <Skeleton className="h-64 w-full rounded-2xl bg-[#16161a]" />
      </div>
    );
  }

  const firstLectureId = course?.lectures?.[0]?.id || 'lec-1';

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0d10]">
      <SkillUpHeader title="Course Overview" />

      <div className="p-6 lg:p-8">
        <Link
          href="/courses"
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[#8e8e9c] hover:text-[#d4f76d] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Library
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Details & Syllabus */}
          <div className="space-y-8 lg:col-span-8">
            {/* Header info card */}
            <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#23232a] px-3 py-1 text-xs font-bold text-[#d4f76d]">
                  {course.category || 'UX/UI'}
                </span>
                <span className="rounded-full bg-[#23232a] px-3 py-1 text-xs font-medium text-white">
                  {course.level || 'Basic'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {course.title}
              </h1>

              <p className="text-xs sm:text-sm leading-relaxed text-[#8e8e9c]">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 border-t border-[#23232a] pt-4 text-xs text-[#8e8e9c]">
                <span className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-[#d4f76d]" /> {course.language || 'English'}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-[#d4f76d]" /> {course.lectures?.length || 4} Lessons
                </span>
                <span className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-[#d4f76d]" /> Instructor: {course.instructor?.name || 'Esther Howard'}
                </span>
              </div>
            </div>

            {/* Syllabus Lessons */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Course Syllabus</h2>

              <div className="space-y-2.5">
                {course.lectures?.map((lec: any, idx: number) => {
                  const canAccess = isEnrolled || lec.isFree;
                  return (
                    <div
                      key={lec.id || idx}
                      className="flex items-center justify-between rounded-xl border border-[#23232a] bg-[#16161a] p-4 transition-colors hover:border-[#34343d]"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#23232a] text-xs font-bold text-white">
                          {idx + 1}
                        </div>
                        <span className="text-xs font-semibold text-white">
                          {lec.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {lec.isFree && !isEnrolled && (
                          <span className="rounded-full bg-[#d4f76d]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#d4f76d]">
                            Free Preview
                          </span>
                        )}

                        {canAccess ? (
                          <Link href={`/courses/${courseId}/learn/${lec.id}`}>
                            <button className="flex items-center gap-1.5 rounded-lg bg-[#23232a] px-3 py-1.5 text-xs font-bold text-[#d4f76d] hover:bg-[#d4f76d] hover:text-black transition-colors">
                              <Play className="h-3 w-3 fill-current" /> Watch
                            </button>
                          </Link>
                        ) : (
                          <div className="p-1.5 text-[#6c6c7a]">
                            <Lock className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 rounded-2xl border border-[#23232a] bg-[#16161a] p-5 space-y-5">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                <img
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80'}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <span className="text-2xl font-extrabold text-white">
                  {typeof course.price === 'number' && course.price === 0 ? 'Free' : `$${course.price || 25}`}
                </span>
                <p className="text-[11px] text-[#8e8e9c] mt-0.5">One-time payment • Lifetime Access</p>
              </div>

              {isEnrolled ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-xl bg-[#d4f76d]/15 p-3 text-xs font-bold text-[#d4f76d] border border-[#d4f76d]/30">
                    <CheckCircle2 className="h-4 w-4" /> You are enrolled in this course
                  </div>
                  <Link href={`/courses/${courseId}/learn/${firstLectureId}`} className="block">
                    <button className="flex w-full items-center justify-center gap-2 rounded-full bg-[#d4f76d] py-3 text-xs font-bold text-black transition-all hover:bg-[#c4ea5c]">
                      Continue Learning <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full rounded-full bg-[#d4f76d] py-3 text-xs font-bold text-black transition-all hover:bg-[#c4ea5c] hover:shadow-lg disabled:opacity-50"
                >
                  {enrolling ? 'Enrolling...' : `Enroll Now ($${course.price || 25})`}
                </button>
              )}

              <div className="border-t border-[#23232a] pt-4 space-y-2 text-xs text-[#8e8e9c]">
                <p className="flex items-center gap-2 text-white font-semibold text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#d4f76d]" /> On-demand video lectures
                </p>
                <p className="flex items-center gap-2 text-white font-semibold text-[11px]">
                  <BrainCircuit className="h-3.5 w-3.5 text-[#d4f76d]" /> 24/7 AI Doubt Assistant
                </p>
                <p className="flex items-center gap-2 text-white font-semibold text-[11px]">
                  <FileText className="h-3.5 w-3.5 text-[#d4f76d]" /> Downloadable lecture notes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
