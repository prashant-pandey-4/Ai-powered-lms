'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import {
  BookOpen,
  ArrowRight,
  ArrowUpRight,
  ArrowDown,
  Play,
  Flame,
  Bot,
  Star,
  Code2,
  BrainCircuit,
  Layers,
  Quote,
  ChevronDown,
  Laptop,
  Database,
  Cloud,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/theme-toggle';

// Tracks
const TRACKS = [
  { title: 'Data Structures & Algorithms', icon: Code2, color: '#f97316', topics: 'Arrays, Trees, Graphs, DP & Recursion' },
  { title: 'Fullstack Development', icon: Laptop, color: '#38bdf8', topics: 'Next.js, React, TypeScript & APIs' },
  { title: 'Backend Engineering', icon: Database, color: '#10b981', topics: 'Node.js, PostgreSQL, Redis & Kafka' },
  { title: 'System Design', icon: Layers, color: '#a855f7', topics: 'HLD, LLD, Sharding & CAP Theorem' },
  { title: 'AI & Generative AI', icon: BrainCircuit, color: '#ec4899', topics: 'RAG, LangChain, Embeddings & Agents' },
  { title: 'DevOps & Cloud', icon: Cloud, color: '#f59e0b', topics: 'Docker, Kubernetes, AWS & CI/CD' },
];

// Quotes
const QUOTES = [
  { quote: 'Learning gives creativity, creativity leads to thinking, thinking provides knowledge, knowledge makes you great.', name: 'Dr. A.P.J. Abdul Kalam', role: 'Scientist & Teacher' },
  { quote: 'Talk is cheap. Show me the code.', name: 'Linus Torvalds', role: 'Creator of Linux' },
  { quote: 'Everybody should learn to program a computer, because it teaches you how to think.', name: 'Steve Jobs', role: 'Co-Founder, Apple' },
];

// Reviews
const REVIEWS = [
  { name: 'Aarav S.', role: 'SDE-2 @ Microsoft', content: 'The AI Mentor next to DSA lectures solved my doubts instantly. Cracked Microsoft in 3 months.', rating: 5 },
  { name: 'Pooja V.', role: 'Fullstack Dev @ Swiggy', content: 'No paywalls. Clean playlists with code cheatsheets and intelligent AI answers. Unmatched.', rating: 5 },
  { name: 'Rohan D.', role: 'Backend Eng @ Razorpay', content: 'Distributed systems and Redis tracks are gold standard. Smooth, distraction-free, and free.', rating: 5 },
];

// FAQ
const FAQS = [
  { q: 'Is SkillUP really 100% free?', a: 'Yes. Every course, lecture, PDF, and the AI Mentor is free forever. No credit card required.' },
  { q: 'How does the AI Mentor work?', a: 'Powered by Google Gemini, the AI Mentor is grounded in the active video lecture. It understands the exact concepts being taught and gives code explanations, interview tips, and summaries.' },
  { q: 'Can I track my progress?', a: 'Yes. Enroll in a track and your progress, completed episodes, and AI chat history are saved in your Learning Room.' },
  { q: 'Who creates the courses?', a: 'Curated content from world-class educators like Striver, Akshay Saini, Piyush Garg, Hitesh Choudhary, and community contributions.' },
];

export function LandingView() {
  const { isSignedIn } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchApi<any[]>('/courses');
        if (res.success && Array.isArray(res.data)) setCourses(res.data);
      } catch (_) {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>

      {/* ─── NAVBAR ─── */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'color-mix(in srgb, var(--bg) 85%, transparent)' }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white shadow-md shadow-[#f97316]/20 group-hover:scale-105 transition-transform">
              <Flame className="h-5 w-5 fill-current" />
            </div>
            <span className="text-lg font-black tracking-tight">
              Skill<span className="text-[#f97316]">UP</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-[13px] font-semibold" style={{ color: 'var(--text-muted)' }}>
            <Link href="/courses" className="hover:text-[#f97316] transition-colors">Courses</Link>
            <Link href="#tracks" className="hover:text-[#f97316] transition-colors">Tracks</Link>
            <Link href="/blog" className="hover:text-[#f97316] transition-colors">Blog</Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {isSignedIn ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <button className="rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition-all" style={{ backgroundColor: '#f97316' }}>
                    Dashboard
                  </button>
                </Link>
                <UserButton />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <button className="rounded-xl px-4 py-2 text-xs font-bold transition-colors" style={{ color: 'var(--text)', border: '1px solid var(--border)' }}>
                    Log in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:opacity-90" style={{ backgroundColor: '#f97316' }}>
                    Register
                  </button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative w-full overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-8 lg:pt-24 lg:pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Text */}
            <div className="space-y-6 lg:space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold" style={{ backgroundColor: 'color-mix(in srgb, var(--text) 8%, transparent)', color: 'var(--text-muted)' }}>
                Trusted by Developers Worldwide
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black leading-[1.1] tracking-tight">
                Consistency{' '}
                <br className="hidden lg:block" />
                and <span className="text-[#f97316]">Discipline</span>
              </h1>

              <p className="text-sm sm:text-base leading-relaxed max-w-lg" style={{ color: 'var(--text-muted)' }}>
                Content is everywhere. We provide what is rare &mdash;{' '}
                <strong style={{ color: '#f97316' }}>&quot;A Structured, AI-Powered Learning Experience&quot;</strong>{' '}
                with curated video curriculum, in-player AI mentor, downloadable notes, and zero paywalls.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {isSignedIn ? (
                  <Link href="/dashboard">
                    <button className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:opacity-90" style={{ backgroundColor: 'var(--text)' }}>
                      Start Learning <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </Link>
                ) : (
                  <SignUpButton mode="modal">
                    <button className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:opacity-90" style={{ backgroundColor: 'var(--text)' }}>
                      Start Learning <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </SignUpButton>
                )}
                <Link href="#tracks">
                  <button className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-colors" style={{ border: '1px solid var(--border)', color: 'var(--text)' }}>
                    See The Tracks <ArrowDown className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Right: Floating Anime Character (NO BOX - Transparent PNG) */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-72 sm:w-80 lg:w-96">
                <img
                  src="/mascot.png"
                  alt="SkillUP Mascot"
                  className="w-full h-auto object-contain relative z-10"
                />
                {/* Bottom fade into page bg */}
                <div className="absolute bottom-0 left-0 right-0 h-24 z-20 pointer-events-none" style={{ background: 'linear-gradient(to top, var(--bg), transparent)' }} />
                {/* Subtle glow behind */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#f97316]/10 blur-3xl -z-10 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRENDING COURSES ─── */}
      <section className="w-full py-16">
        <div className="mx-auto max-w-6xl px-6 space-y-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Trending</h2>
            <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>
              Latest courses that combine{' '}
              <strong style={{ color: '#f97316' }}>Fresh Insights</strong>{' '}
              with real-world application.
            </p>
          </div>

          {loading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl p-4 space-y-3" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
                  <Skeleton className="aspect-video w-full rounded-xl bg-card-2" />
                  <Skeleton className="h-5 w-3/4 bg-card-2" />
                  <Skeleton className="h-4 w-1/2 bg-card-2" />
                </div>
              ))}
            </div>
          )}

          {!loading && courses.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.slice(0, 6).map((course: any) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}
                >
                  <div className="relative aspect-video w-full overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: 'var(--bg-card-2)' }}>
                        <BookOpen className="h-8 w-8" style={{ color: 'var(--text-subtle)' }} />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f97316] text-white shadow-lg">
                        <Play className="h-5 w-5 fill-current ml-0.5" />
                      </div>
                    </div>
                    {course.category && (
                      <div className="absolute top-2.5 left-2.5">
                        <span className="rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-[#f97316]">
                          {course.category}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4 space-y-2">
                    <h4 className="text-sm font-bold group-hover:text-[#f97316] line-clamp-2 transition-colors">{course.title}</h4>
                    <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {course.description || 'Master fundamentals through structured video lessons.'}
                    </p>
                    <div className="mt-auto pt-2 flex items-center justify-between text-xs" style={{ borderTop: '1px solid var(--border)' }}>
                      <span className="font-extrabold text-[#f97316]">100% Free</span>
                      <span className="font-semibold flex items-center gap-1 group-hover:text-[#f97316] transition-colors">
                        Explore <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── TRACKS ─── */}
      <section id="tracks" className="w-full py-16" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="mx-auto max-w-6xl px-6 space-y-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Our Tracks</h2>
            <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>
              Learn in structured{' '}
              <strong style={{ color: '#f97316' }}>Sequential Roadmaps</strong>{' '}
              designed for real engineering roles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRACKS.map((t) => {
              const Icon = t.icon;
              return (
                <Link
                  key={t.title}
                  href="/courses"
                  className="group flex items-start gap-4 rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm" style={{ backgroundColor: t.color }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold group-hover:text-[#f97316] transition-colors">{t.title}</h3>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{t.topics}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── AI MENTOR SHOWCASE ─── */}
      <section className="w-full py-16" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Floating Mentor Character (Transparent PNG) */}
            <div className="relative flex justify-center">
              <div className="relative w-64 sm:w-72 lg:w-80">
                <img
                  src="/mentor-chad.png"
                  alt="AI Mentor"
                  className="w-full h-auto object-contain relative z-10"
                />
                <div className="absolute bottom-0 left-0 right-0 h-20 z-20 pointer-events-none" style={{ background: 'linear-gradient(to top, var(--bg), transparent)' }} />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-[#f97316]/8 blur-3xl -z-10 pointer-events-none" />
              </div>
            </div>

            {/* Right: Text */}
            <div className="space-y-5">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Never Get Stuck Again
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Our{' '}
                <strong style={{ color: '#f97316' }}>AI Coding Mentor</strong>{' '}
                lives inside the video player. It understands the exact concepts being taught in the active lecture and resolves your doubts in seconds.
              </p>

              {/* Mini Demo */}
              <div className="rounded-2xl p-5 space-y-3" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <div className="flex items-center gap-2 text-xs font-bold" style={{ color: '#f97316' }}>
                  <Bot className="h-4 w-4" /> AI Mentor Demo
                </div>
                <div className="space-y-2 text-xs">
                  <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-card-2)' }}>
                    <p className="font-semibold text-app">&ldquo;Why use Two Pointers instead of nested loops in this problem?&rdquo;</p>
                  </div>
                  <div className="rounded-xl p-3 space-y-1" style={{ backgroundColor: 'var(--bg-card-2)' }}>
                    <p className="font-bold text-[#f97316]">AI Mentor:</p>
                    <p style={{ color: 'var(--text-muted)' }}>
                      Nested loops take O(n&sup2;) time. Because the array is sorted, two pointers let you evaluate pairs from both ends in O(n) linear time with O(1) extra space!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── QUOTES ─── */}
      <section className="w-full py-16" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="mx-auto max-w-6xl px-6 space-y-8">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Wisdom From{' '}<span className="text-[#f97316]">Giants</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {QUOTES.map((v, i) => (
              <div key={i} className="flex flex-col justify-between rounded-2xl p-6 space-y-4" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <div>
                  <Quote className="h-5 w-5 mb-3 opacity-30" style={{ color: '#f97316' }} />
                  <p className="text-sm italic leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                    &ldquo;{v.quote}&rdquo;
                  </p>
                </div>
                <div className="pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="text-xs font-bold">{v.name}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{v.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── REVIEWS ─── */}
      <section className="w-full py-16" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="mx-auto max-w-6xl px-6 space-y-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">What Learners Say</h2>
            <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>
              Engineers who cracked{' '}
              <strong style={{ color: '#f97316' }}>top tech roles</strong>{' '}
              using SkillUP.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {REVIEWS.map((r, i) => (
              <div key={i} className="flex flex-col justify-between rounded-2xl p-6 space-y-3" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
                <div className="space-y-2">
                  <div className="flex text-[#f59e0b]">
                    {[...Array(r.rating)].map((_, idx) => <Star key={idx} className="h-3.5 w-3.5 fill-current" />)}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    &ldquo;{r.content}&rdquo;
                  </p>
                </div>
                <div className="pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="text-xs font-bold">{r.name}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{r.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="w-full py-16" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="mx-auto max-w-3xl px-6 space-y-8">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-center">FAQ</h2>

          <div className="space-y-2">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 flex items-center justify-between text-left text-sm font-semibold transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} style={{ color: isOpen ? '#f97316' : 'var(--text-muted)' }} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs leading-relaxed" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
                      <div className="pt-3">{faq.a}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="w-full py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-3xl bg-gradient-to-br from-[#f97316] to-[#ea580c] p-10 sm:p-14 text-center text-white space-y-5">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Ready to level up?</h2>
            <p className="text-sm text-white/85 max-w-lg mx-auto">
              Join developers mastering DSA, systems, and AI &mdash; without paying a rupee.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <button className="rounded-xl bg-white px-7 py-3 text-sm font-bold text-[#f97316] hover:bg-slate-50 transition-all shadow-lg">
                    Open My Learning Room
                  </button>
                </Link>
              ) : (
                <SignUpButton mode="modal">
                  <button className="rounded-xl bg-white px-7 py-3 text-sm font-bold text-[#f97316] hover:bg-slate-50 transition-all shadow-lg">
                    Create Free Account
                  </button>
                </SignUpButton>
              )}
              <Link href="/courses">
                <button className="rounded-xl bg-black/20 border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-black/40 transition-colors">
                  Browse Courses
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
