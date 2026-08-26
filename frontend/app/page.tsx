import Link from 'next/link';
import { SkillUpHeader } from '@/components/skillup-header';
import {
  Play,
  Heart,
  Users,
  Star,
  ArrowRight,
  CheckCircle2,
  Calendar as CalendarIcon,
  BookOpen,
  Clock,
  Radio,
  CheckSquare,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  const res = await fetchApi<any[]>('/courses');
  if (res.success && res.data && res.data.length > 0) {
    return res.data;
  }
  return [
    {
      id: 'course-1',
      title: 'Start in Web Design',
      description: 'Typography and layout rules for responsive web applications.',
      thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
      category: 'UX/UI',
      level: 'Basic',
      price: 25,
      rating: 4.9,
      studentsCount: 1435,
      lessonsCount: 24,
      duration: '12 hours',
      instructor: { name: 'Esther Howard', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
    },
    {
      id: 'course-2',
      title: 'Learn Development & grow',
      description: 'Master full stack engineering with Next.js, Node.js and TypeScript.',
      thumbnail: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
      category: 'Development',
      level: 'Basic',
      price: 25,
      rating: 4.9,
      studentsCount: 1435,
      lessonsCount: 24,
      duration: '12 hours',
      instructor: { name: 'Esther Howard', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
    },
    {
      id: 'course-3',
      title: 'Logo & Branding Masterclass',
      description: 'Create memorable visual identities, logo marks, and style systems.',
      thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
      category: 'Design',
      level: 'Basic',
      price: 25,
      rating: 4.9,
      studentsCount: 1435,
      lessonsCount: 24,
      duration: '12 hours',
      instructor: { name: 'Esther Howard', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
    },
  ];
}

export default async function DashboardPage() {
  const courses = await getDashboardData();
  const firstCourseId = courses[0]?.id || 'course-1';

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0d10]">
      {/* Top Header */}
      <SkillUpHeader title="Dashboard" />

      {/* Main Grid */}
      <div className="p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* ───────────────────────────────────────── */}
          {/* Left / Center Main Content (8 cols) */}
          {/* ───────────────────────────────────────── */}
          <div className="space-y-8 lg:col-span-8">
            {/* 1. Continue Learning Hero Card */}
            <div>
              <h2 className="mb-4 text-base font-bold text-white">
                Continue learning
              </h2>

              <div className="grid grid-cols-1 gap-6 rounded-2xl border border-[#23232a] bg-[#16161a] p-5 md:grid-cols-12 md:items-center">
                {/* Thumbnail with Play Circle */}
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-black md:col-span-5 group">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80"
                    alt="Start in Web Design"
                    className="h-full w-full object-cover"
                  />
                  {/* Green Lime Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d4f76d] text-black shadow-lg transition-transform group-hover:scale-110">
                      <Play className="h-5 w-5 fill-current ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2.5 left-2.5 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                    18 min
                  </span>
                </div>

                {/* Info & Progress */}
                <div className="space-y-4 md:col-span-7 md:pl-2">
                  <div>
                    <h3 className="text-lg font-bold text-white leading-snug">
                      Start in Web Design: Lesson 6
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#8e8e9c]">
                      Typography is the basis of the design of any web page or application screen. In this topic, we will consider the basic rules of working with text and apply them in our project.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <Link href={`/courses/${firstCourseId}`}>
                      <button className="rounded-full bg-[#d4f76d] px-6 py-2.5 text-xs font-bold text-black transition-all hover:bg-[#c4ea5c] hover:shadow-md">
                        To the course
                      </button>
                    </Link>

                    {/* Circular 25% Progress Indicator */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-[#8e8e9c]">
                        Course completion
                      </span>
                      <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#d4f76d] text-[11px] font-extrabold text-white">
                        25%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Recommendations Row */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-white">Recommendations</h2>
                <Link href="/courses" className="text-xs font-semibold text-[#8e8e9c] hover:text-[#d4f76d] transition-colors">
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
                {courses.map((course: any, idx: number) => (
                  <Link
                    key={course.id || idx}
                    href={`/courses/${course.id}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#23232a] bg-[#16161a] p-3 transition-all duration-200 hover:-translate-y-1 hover:border-[#34343d] hover:bg-[#1a1a20]"
                  >
                    {/* Thumbnail with Play Overlay */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-black">
                      <img
                        src={course.thumbnail || 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80'}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d4f76d] text-black shadow-md">
                          <Play className="h-4 w-4 fill-current ml-0.5" />
                        </div>
                      </div>
                      <button className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-xs hover:text-red-400">
                        <Heart className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-1 flex-col pt-3">
                      <h4 className="text-sm font-bold text-white group-hover:text-[#d4f76d] line-clamp-1 transition-colors">
                        {course.title}
                      </h4>

                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="rounded-full bg-[#23232a] px-3 py-1 text-[10px] font-bold text-[#d4f76d]">
                          {course.level || 'Basic'}
                        </span>
                        <div className="flex items-center gap-2.5 text-[11px] text-[#8e8e9c]">
                          <span className="flex items-center gap-1 font-semibold">
                            <Users className="h-3 w-3" />
                            {course.studentsCount || 1435}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-[#d4f76d]">
                            <Star className="h-3 w-3 fill-current" />
                            {course.rating || 4.9}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-[11px] text-[#8e8e9c]">
                        <img
                          src={course.instructor?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                          alt="Instructor"
                          className="h-5 w-5 rounded-full object-cover"
                        />
                        <span className="font-medium text-white truncate">
                          {course.instructor?.name || 'Esther Howard'}
                        </span>
                        <span className="text-[10px] text-[#6c6c7a]">• 24 lessons</span>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-[#23232a] pt-2.5">
                        <span className="text-sm font-extrabold text-white">
                          {typeof course.price === 'number' && course.price === 0 ? 'Free' : `$${course.price || 25}`}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#8e8e9c] group-hover:text-[#d4f76d] transition-colors">
                          View Details <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 3. UX/UI Section Row */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-white">UX/UI</h2>
                <Link href="/courses" className="text-xs font-semibold text-[#8e8e9c] hover:text-[#d4f76d]">
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {[
                  { title: 'Design Systems & Tokens', img: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80' },
                  { title: 'Mobile App Wireframing', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80' },
                  { title: 'User Research & Personas', img: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80' },
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    href="/courses"
                    className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-[#23232a] bg-[#16161a]"
                  >
                    <img
                      src={item.img}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 flex flex-col justify-between">
                      <div className="flex justify-end">
                        <button className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-xs">
                          <Heart className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div>
                        <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#d4f76d] text-black">
                          <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{item.title}</h4>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ───────────────────────────────────────── */}
          {/* Right Column (4 cols) — Schedule, Tasks, Stats */}
          {/* ───────────────────────────────────────── */}
          <div className="space-y-6 lg:col-span-4">
            {/* Schedule / Timeline Card */}
            <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Wednesday, 24 Aug</h3>
                <span className="text-xs font-semibold text-[#8e8e9c] cursor-pointer hover:text-[#d4f76d]">
                  All Events
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-12 text-[11px] font-semibold text-[#6c6c7a]">10:00</span>
                  <div className="flex flex-1 items-center justify-between rounded-xl bg-[#23232a] px-3 py-2.5 text-white">
                    <div className="flex items-center gap-2">
                      <Radio className="h-3.5 w-3.5 text-[#d4f76d]" />
                      <span className="font-bold">Live Lecture: Typography</span>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-[#d4f76d] animate-pulse" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-12 text-[11px] font-semibold text-[#6c6c7a]">12:00</span>
                  <div className="flex flex-1 items-center justify-between rounded-xl bg-[#1c1c22] px-3 py-2.5 text-[#8e8e9c]">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span className="font-semibold text-white">Exam: Typography</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-12 text-[11px] font-semibold text-[#6c6c7a]">15:00</span>
                  <div className="flex flex-1 items-center gap-2 rounded-xl bg-[#1c1c22] p-2.5 text-[#8e8e9c]">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Project Feedback Sync</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks Board Card (Lime & Peach) */}
            <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Tasks Board</h3>
                <span className="text-xs font-semibold text-[#8e8e9c] cursor-pointer hover:text-[#d4f76d]">
                  All Tasks
                </span>
              </div>

              <div className="space-y-3">
                {/* Lime Task Card */}
                <div className="flex items-center justify-between rounded-xl bg-[#d4f76d] p-4 text-black shadow-sm">
                  <div>
                    <h4 className="text-xs font-extrabold">Homework: Typography</h4>
                    <p className="text-[10px] font-bold text-black/70 mt-1">📅 26 Aug</p>
                  </div>
                  <CheckSquare className="h-4 w-4 text-black" />
                </div>

                {/* Peach Task Card */}
                <div className="flex items-center justify-between rounded-xl bg-[#f9d8b9] p-4 text-black shadow-sm">
                  <div>
                    <h4 className="text-xs font-extrabold">Homework: Colors & Contrast</h4>
                    <p className="text-[10px] font-bold text-black/70 mt-1">📅 26 Aug</p>
                  </div>
                  <CheckSquare className="h-4 w-4 text-black" />
                </div>
              </div>

              {/* Completed Section */}
              <div className="mt-5 border-t border-[#23232a] pt-4">
                <h4 className="text-xs font-bold text-[#8e8e9c] mb-3">Completed</h4>
                <div className="flex items-center justify-between rounded-xl bg-[#1c1c22] p-3 text-xs text-[#8e8e9c]">
                  <span>Quiz: Typography Rules</span>
                  <CheckCircle2 className="h-4 w-4 text-[#d4f76d]" />
                </div>
              </div>
            </div>

            {/* Quick 4 Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-4">
                <h4 className="text-xl font-extrabold text-white">11 552</h4>
                <p className="text-[10px] font-semibold text-[#8e8e9c] mt-0.5">Students (+26 today)</p>
              </div>
              <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-4">
                <h4 className="text-xl font-extrabold text-[#d4f76d]">14</h4>
                <p className="text-[10px] font-semibold text-[#8e8e9c] mt-0.5">Active Courses</p>
              </div>
              <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-4">
                <h4 className="text-xl font-extrabold text-[#bfe2ff]">$112 588</h4>
                <p className="text-[10px] font-semibold text-[#8e8e9c] mt-0.5">Total Earning</p>
              </div>
              <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-4">
                <h4 className="text-xl font-extrabold text-[#f9d8b9]">619 hrs</h4>
                <p className="text-[10px] font-semibold text-[#8e8e9c] mt-0.5">Learning Activity</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
