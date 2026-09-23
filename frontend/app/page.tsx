'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import {
  BookOpen,
  ArrowRight,
  GraduationCap,
  Play,
  Flame,
  Bot,
  FileText,
  CheckCircle2,
  Star,
  Code2,
  Sparkles,
  Zap,
  Terminal,
  Cpu,
  BrainCircuit,
  Layers,
  Quote,
  Check,
  ChevronDown,
  ShieldCheck,
  Globe,
  Users,
  Compass,
  Laptop,
  Database,
  Cloud,
  Lock,
  ExternalLink,
  MessageSquare,
  Award,
  Heart,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/theme-toggle';

// Engineering Tracks
const DOMAINS = [
  {
    title: 'Data Structures & Algorithms',
    icon: Code2,
    badge: 'DSA & LeetCode',
    color: '#f97316',
    description: 'Arrays, Trees, Graphs, DP, and Bit Manipulation. Master core interview patterns.',
    topics: ['Striver Sheet', 'Graphs & DP', 'Recursion Tree', 'Complexity Analysis'],
    slug: 'dsa',
  },
  {
    title: 'Fullstack & Web Architecture',
    icon: Laptop,
    badge: 'Modern Web Stack',
    color: '#38bdf8',
    description: 'Next.js 15, React 19, TypeScript, Server Components, and Clean UI/UX.',
    topics: ['Next.js App Router', 'Tailwind CSS', 'WebSockets', 'State Machines'],
    slug: 'react',
  },
  {
    title: 'Backend & Distributed Systems',
    icon: Database,
    badge: 'High QPS & Scaling',
    color: '#10b981',
    description: 'Node.js, Go, PostgreSQL, Redis Caching, Kafka queues, and Microservices.',
    topics: ['Redis Caching', 'Postgres Internals', 'Kafka Events', 'Auth & JWT'],
    slug: 'backend',
  },
  {
    title: 'System Design (HLD & LLD)',
    icon: Layers,
    badge: 'Architectural Mastery',
    color: '#a855f7',
    description: 'Load balancers, consistent hashing, rate limiters, CDN, and database sharding.',
    topics: ['High Level Design', 'Low Level Design', 'Sharding', 'CAP Theorem'],
    slug: 'system design',
  },
  {
    title: 'Artificial Intelligence & GenAI',
    icon: BrainCircuit,
    badge: 'LLMs & AI Agents',
    color: '#ec4899',
    description: 'LLM fine-tuning, RAG pipelines, LangChain, Vector search, and autonomous agents.',
    topics: ['RAG Pipelines', 'LangChain', 'Vector Embeddings', 'AI Agents'],
    slug: 'ai',
  },
  {
    title: 'DevOps, Cloud & Containers',
    icon: Cloud,
    badge: 'Cloud & Infrastructure',
    color: '#f59e0b',
    description: 'Docker multi-stage builds, Kubernetes orchestration, AWS cloud, and CI/CD.',
    topics: ['Docker Engine', 'Kubernetes Pods', 'AWS S3 & EC2', 'GitHub Actions'],
    slug: 'devops',
  },
];

// Legends & Pioneers of Education and Computer Science
const VISIONARIES = [
  {
    quote: 'Learning gives creativity, creativity leads to thinking, thinking provides knowledge, knowledge makes you great.',
    name: 'Dr. A.P.J. Abdul Kalam',
    role: 'Visionary Scientist & Teacher',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
    tag: 'Education & Vision',
  },
  {
    quote: 'Talk is cheap. Show me the code.',
    name: 'Linus Torvalds',
    role: 'Creator of Linux & Git',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    tag: 'Open Source',
  },
  {
    quote: 'Everybody in this country should learn to program a computer, because it teaches you how to think.',
    name: 'Steve Jobs',
    role: 'Co-Founder, Apple',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    tag: 'Innovation',
  },
  {
    quote: 'The most dangerous phrase in the language is, "We’ve always done it this way."',
    name: 'Grace Hopper',
    role: 'Computer Scientist & Compiler Pioneer',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    tag: 'Engineering Spirit',
  },
  {
    quote: 'We can only see a short distance ahead, but we can see plenty there that needs to be done.',
    name: 'Alan Turing',
    role: 'Father of Modern Computing & AI',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    tag: 'Computer Science',
  },
  {
    quote: 'If you want to master something, teach it. A great teacher never creates clones, but unlocks vision.',
    name: 'Richard Feynman',
    role: 'Nobel Laureate & Educator',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    tag: 'First Principles',
  },
];

// Interactive AI Tutor Mock Q&A
const AI_DEMO_PREVIEWS: Record<string, { q: string; a: string }> = {
  dsa: {
    q: 'How does QuickSort partitioning work in 3 simple points?',
    a: '1. Choose a pivot element (often the last or median element).\n2. Reorder array so elements smaller than the pivot go to the left, and greater to the right.\n3. Recursively repeat the partition on the sub-arrays. Time Complexity: O(N log N) on average.',
  },
  backend: {
    q: 'Why should I use Redis as a caching layer before PostgreSQL?',
    a: 'PostgreSQL reads from disk with complex query locks. Redis operates in in-memory RAM with single-threaded event loop, delivering sub-millisecond responses and reducing database CPU load by up to 90%.',
  },
  systemDesign: {
    q: 'What is the difference between Horizontal Scaling vs Vertical Scaling?',
    a: 'Vertical scaling (Scaling Up) upgrades CPU/RAM on a single server, which has a hardware ceiling and single point of failure. Horizontal scaling (Scaling Out) adds more commodity servers behind a Load Balancer, providing infinite scalability and fault tolerance.',
  },
  ai: {
    q: 'How does Retrieval-Augmented Generation (RAG) work?',
    a: 'RAG chunks your private documents, computes vector embeddings, and stores them in a Vector DB. When a user asks a prompt, semantic search retrieves relevant chunks and feeds them into the LLM context for hallucination-free, accurate answers.',
  },
};

// Verified Learner Reviews
const REVIEWS = [
  {
    name: 'Aarav Sharma',
    role: 'Software Engineer @ Microsoft',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    content:
      'The AI Mentor embedded right next to Striver DSA and System Design lectures solved my doubts instantly. I cracked Microsoft SDE-2 in 3 months!',
    track: 'DSA & System Design',
    rating: 5,
  },
  {
    name: 'Pooja Verma',
    role: 'Fullstack Developer @ Swiggy',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    content:
      'No paywalls, no useless marketing. Clean video playlists with downloadable code cheatsheets and intelligent AI answers. SkillUP is unmatched.',
    track: 'Fullstack Next.js & Node.js',
    rating: 5,
  },
  {
    name: 'Rohan Deshmukh',
    role: 'Backend Engineer @ Razorpay',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    content:
      'The distributed systems and Redis caching tracks are gold standard. The learning workflow is smooth, distraction-free, and 100% free.',
    track: 'Backend & Distributed Systems',
    rating: 5,
  },
];

// FAQs
const FAQS = [
  {
    q: 'Is SkillUP really 100% free with zero paywalls?',
    a: 'Yes! Every course, lecture, downloadable PDF resource, and the 24/7 AI Coding Mentor is completely free forever. No credit card is ever required.',
  },
  {
    q: 'How does the in-player AI Mentor work?',
    a: 'Our AI mentor is powered by Google Gemini and is context-grounded in the active video lecture. When you ask a question, it understands the exact concepts being taught in that episode and provides line-by-line code explanations, interview tips, or summaries.',
  },
  {
    q: 'Can I track my learning progress?',
    a: 'Yes. When you click "Join Track", your progress is automatically saved to your "My Learning" room, keeping track of completed episodes, code notes, and personalized AI chat histories.',
  },
  {
    q: 'Who creates the courses on SkillUP?',
    a: 'Our curriculum features curated, industry-standard engineering content from world-class educators like Striver (takeUforward), Akshay Saini (Namaste JavaScript), Piyush Garg, Hitesh Choudhary, and community contributions.',
  },
];

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAiTab, setActiveAiTab] = useState<string>('dsa');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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
    <div className="flex min-h-screen flex-col bg-app bg-grid-pattern text-app">
      {/* ========================================================= */}
      {/* STANDALONE LANDING NAVBAR (CHAI-CODE / MENTIX STYLE)      */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 w-full border-b border-app bg-app/80 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white shadow-lg shadow-[#f97316]/30 group-hover:scale-105 transition-transform">
              <Flame className="h-6 w-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-app">
                  Skill<span className="text-[#f97316]">UP</span>
                </span>
                <span className="rounded bg-[#f97316]/20 px-1.5 py-0.2 text-[9px] font-extrabold text-[#f97316]">
                  ACADEMY
                </span>
              </div>
              <p className="text-[10px] text-muted font-medium">Open-Source Developer Hub</p>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-muted">
            <Link href="/courses" className="hover:text-[#f97316] transition-colors">
              All Courses
            </Link>
            <Link href="#domains" className="hover:text-[#f97316] transition-colors">
              Tracks & Roadmaps
            </Link>
            <Link href="#ai-mentor" className="hover:text-[#f97316] transition-colors flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-[#f97316]" /> AI Mentor
            </Link>
            <Link href="#visionaries" className="hover:text-[#f97316] transition-colors">
              Visionaries
            </Link>
            <Link href="/blog" className="hover:text-[#f97316] transition-colors">
              Knowledge Hub
            </Link>
          </nav>

          {/* Right User Actions & Theme Toggle */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {!isLoaded ? (
              <div className="h-9 w-24 animate-pulse rounded-full bg-card" />
            ) : isSignedIn ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <button className="flex items-center gap-1.5 rounded-full glow-amber-btn px-5 py-2.5 text-xs font-bold text-white transition-all hover:scale-105">
                    <GraduationCap className="h-4 w-4" /> My Learning
                  </button>
                </Link>
                <UserButton />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <button className="rounded-full border border-app bg-card px-4 py-2 text-xs font-bold text-app hover:border-[#f97316] transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-full glow-amber-btn px-5 py-2 text-xs font-black text-white transition-all hover:scale-105 shadow-md shadow-[#f97316]/20">
                    Get Started Free
                  </button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* HERO SECTION (WITH CHAD CODING MASCOT ILLUSTRATION)       */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-7">
              {/* Pill Tag */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-4 py-1.5 text-xs font-bold text-[#f97316] shadow-sm">
                <Flame className="h-4 w-4 fill-current" />
                <span>COMMUNITY DRIVEN &bull; 100% FREE FOREVER &bull; ZERO PAYWALLS</span>
              </div>

              {/* Punchy ChaiCode / Anime Inspired Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-app leading-[1.12]">
                Code. Build. Dominate. <br />
                <span className="gradient-text-orange">Crafting Engineers With Discipline & AI.</span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-muted leading-relaxed font-medium max-w-2xl">
                Master Data Structures & Algorithms, Distributed Systems, Cloud Infra, and Generative AI.
                Curated sequential video curriculum, downloadable code blueprints, and an in-player AI mentor grounded in every second of your lesson.
              </p>

              {/* Key Features Badges */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-semibold text-app pt-1">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#f97316]" /> 1-Click Free Enrollment
                </span>
                <span className="flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-[#f97316]" /> In-Player AI Code Mentor
                </span>
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#f97316]" /> Downloadable Notes & Code
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {isSignedIn ? (
                  <Link href="/dashboard">
                    <button className="flex items-center gap-2.5 rounded-full glow-amber-btn px-8 py-4 text-xs sm:text-sm font-black text-white transition-all hover:scale-105 shadow-xl shadow-[#f97316]/30">
                      <GraduationCap className="h-4 w-4" /> Open My Learning Room
                    </button>
                  </Link>
                ) : (
                  <SignUpButton mode="modal">
                    <button className="flex items-center gap-2.5 rounded-full glow-amber-btn px-8 py-4 text-xs sm:text-sm font-black text-white transition-all hover:scale-105 shadow-xl shadow-[#f97316]/30">
                      <Zap className="h-4 w-4 fill-current" /> Start Learning Free
                    </button>
                  </SignUpButton>
                )}

                <Link href="/courses">
                  <button className="flex items-center gap-2 rounded-full border border-app bg-card px-7 py-4 text-xs sm:text-sm font-bold text-app hover:border-[#f97316] transition-colors">
                    <Compass className="h-4 w-4" /> Explore All Tracks
                  </button>
                </Link>
              </div>

              {/* Platform Statistics */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-app">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-app">100%</p>
                  <p className="text-[11px] font-bold text-muted mt-0.5">Free & Open Access</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-[#f97316]">24/7</p>
                  <p className="text-[11px] font-bold text-muted mt-0.5">Active AI Mentor</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-[#f59e0b]">50+</p>
                  <p className="text-[11px] font-bold text-muted mt-0.5">Structured Lessons</p>
                </div>
              </div>
            </div>

            {/* Right: Chad Developer Mascot Illustration Card */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden border-2 border-[#f97316]/50 shadow-2xl shadow-[#f97316]/20 group">
                <img
                  src="/mascot.jpg"
                  alt="SkillUP Chad Coding Mascot"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Floating Hologram Badges */}
                <div className="absolute top-4 left-4 rounded-2xl bg-black/80 backdrop-blur-md border border-[#f97316]/40 p-2.5 px-3.5 shadow-xl animate-bounce duration-1000">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[11px] font-extrabold text-white font-mono">
                      🔥 120 Days DSA Streak
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 rounded-2xl bg-black/80 backdrop-blur-md border border-[#f97316]/40 p-3 shadow-xl space-y-1 max-w-[220px]">
                  <div className="flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5 text-[#f97316]" />
                    <span className="text-[10px] font-bold text-[#f97316] uppercase">AI Mentor</span>
                  </div>
                  <p className="text-[10px] text-slate-200 leading-tight">
                    &ldquo;Optimal LCA identified in O(N) time complexity!&rdquo;
                  </p>
                </div>
              </div>

              {/* Ambient Glow behind Character */}
              <div className="absolute -inset-4 rounded-full bg-[#f97316]/20 blur-3xl -z-10 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* INTERACTIVE LMS WORKSPACE SPLIT DEMO                      */}
      {/* ========================================================= */}
      <section className="py-12 border-t border-app">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#f97316]">
              Interactive Classroom Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-app">
              Built for Intense Engineering Focus
            </h2>
            <p className="text-xs sm:text-sm text-muted">
              Zero distractions. Video stream on the left, instant video-grounded AI mentor on the right.
            </p>
          </div>

          <div className="rounded-3xl border border-app bg-card p-4 sm:p-6 shadow-2xl">
            {/* Top Mock Window Bar */}
            <div className="flex items-center justify-between border-b border-app pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-muted hidden sm:inline">
                  skillup.academy/courses/dsa/learn/episode-04
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live AI Engine Active
                </span>
              </div>
            </div>

            {/* Split Screen Simulator */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Video Stream Mockup */}
              <div className="lg:col-span-8 rounded-2xl bg-black border border-app overflow-hidden relative aspect-video flex flex-col justify-between p-6">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-black/80 px-2.5 py-1 text-[11px] font-bold text-[#f97316] border border-[#f97316]/30 backdrop-blur-md">
                    EPISODE 04: Binary Tree Lowest Common Ancestor (LCA)
                  </span>
                  <span className="font-mono text-xs text-white/80 bg-black/60 px-2 py-0.5 rounded">
                    18:42 / 32:10
                  </span>
                </div>

                {/* Simulated Code Highlight in Video */}
                <div className="rounded-xl bg-[#090a0f]/90 border border-[#f97316]/30 p-4 font-mono text-xs text-slate-200 space-y-1 backdrop-blur-md shadow-2xl">
                  <p className="text-emerald-400 font-semibold">// Optimal Recursive LCA in O(N) Time</p>
                  <p><span className="text-purple-400">TreeNode*</span> <span className="text-yellow-300">lowestCommonAncestor</span>(TreeNode* root, TreeNode* p, TreeNode* q) &#123;</p>
                  <p className="pl-4">if (!root || root == p || root == q) return root;</p>
                  <p className="pl-4">TreeNode* left = lowestCommonAncestor(root-&gt;left, p, q);</p>
                  <p className="pl-4">TreeNode* right = lowestCommonAncestor(root-&gt;right, p, q);</p>
                  <p className="pl-4">return (!left) ? right : (!right) ? left : root;</p>
                  <p>&#125;</p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted">
                  <span className="text-[#f97316] font-bold flex items-center gap-1.5">
                    <Play className="h-3.5 w-3.5 fill-current" /> Grounded with AI Doubt Mentor
                  </span>
                </div>
              </div>

              {/* Right In-Player AI Mentor Chat Mockup */}
              <div className="lg:col-span-4 rounded-2xl bg-card-2 border border-app p-4 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between border-b border-app pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f97316] text-white">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-app">AI Doubt Mentor</p>
                      <p className="text-[10px] text-muted">Video Context Active</p>
                    </div>
                  </div>
                  <span className="rounded bg-[#f97316]/15 px-2 py-0.5 text-[9px] font-bold text-[#f97316]">
                    Gemini Flash
                  </span>
                </div>

                {/* Chat Flow */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-end">
                    <div className="rounded-2xl bg-[#f97316]/15 border border-[#f97316]/30 px-3 py-1.5 text-app text-[11px] font-medium max-w-[90%]">
                      Why does returning root work when both left and right are non-null?
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f97316] text-white text-[10px] font-bold">
                      AI
                    </div>
                    <div className="rounded-2xl bg-card border border-app p-3 text-[11px] text-app leading-relaxed shadow-sm space-y-1">
                      <p>
                        Because if <code className="text-[#f97316] font-bold">left != null</code> and <code className="text-[#f97316] font-bold">right != null</code>, node <code className="text-[#f97316] font-bold">p</code> was found in one subtree and node <code className="text-[#f97316] font-bold">q</code> in the other!
                      </p>
                      <p className="text-muted text-[10px]">
                        Thus, the current node is the lowest common intersection point.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Input Simulator */}
                <div className="rounded-xl border border-app bg-card p-2 flex items-center justify-between text-xs text-muted">
                  <span className="text-[11px]">Ask a doubt about this lesson...</span>
                  <button className="h-7 w-7 rounded-full bg-[#f97316] text-white flex items-center justify-center shadow-md">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* ENGINEERING DISCIPLINES & CURRICULUM (CHAI-CODE STYLE)    */}
      {/* ========================================================= */}
      <section id="domains" className="py-16 border-t border-app">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#f97316]">
                Curated Roadmaps
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-app">
                Master Every Core Engineering Discipline
              </h2>
              <p className="text-xs sm:text-sm text-muted max-w-2xl">
                High-yield curriculum designed for students and engineers aiming for Tier-1 product roles and high-scale architecture.
              </p>
            </div>
            <Link href="/courses">
              <button className="flex items-center gap-1.5 text-xs font-bold text-[#f97316] hover:underline">
                View All Courses <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DOMAINS.map((domain) => {
              const Icon = domain.icon;
              return (
                <div
                  key={domain.title}
                  className="group flex flex-col justify-between rounded-3xl border border-app bg-card p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#f97316]/50 hover:shadow-2xl shadow-lg"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md"
                        style={{ backgroundColor: domain.color }}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-card-2 border border-app px-3 py-1 text-[10px] font-bold text-muted">
                        {domain.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-app group-hover:text-[#f97316] transition-colors">
                        {domain.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-muted leading-relaxed">
                        {domain.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {domain.topics.map((t) => (
                        <span
                          key={t}
                          className="rounded-lg bg-card-2 border border-app px-2.5 py-1 text-[10px] font-medium text-app"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-app flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#f97316]">
                      100% Free Access
                    </span>
                    <Link
                      href={`/courses`}
                      className="flex items-center gap-1 text-xs font-bold text-app group-hover:text-[#f97316] transition-colors"
                    >
                      Explore Track <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* INTERACTIVE AI MENTOR SHOWCASE (WITH MENTOR CHAD)         */}
      {/* ========================================================= */}
      <section id="ai-mentor" className="py-16 border-t border-app bg-card-2/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Interactive AI Demo */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f97316]/15 px-3 py-1 text-xs font-bold text-[#f97316]">
                  <BrainCircuit className="h-3.5 w-3.5" /> 24/7 AI Coding Mentor
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-app">
                  Never Get Stuck While Coding Again
                </h2>
                <p className="text-xs sm:text-sm text-muted">
                  Test the mentor right now. Select a concept below to see how it simplifies complex technical doubts in seconds.
                </p>
              </div>

              {/* Selector Pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'dsa', label: 'DSA: QuickSort Partition' },
                  { id: 'backend', label: 'Backend: Redis vs Postgres' },
                  { id: 'systemDesign', label: 'System Design: Scaling' },
                  { id: 'ai', label: 'GenAI: What is RAG?' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAiTab(tab.id)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                      activeAiTab === tab.id
                        ? 'bg-[#f97316] text-white shadow-md shadow-[#f97316]/30 scale-105'
                        : 'border border-app bg-card text-muted hover:text-app'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Live Preview Response Box */}
              <div className="rounded-2xl border border-app bg-card p-6 space-y-4 shadow-xl">
                <div className="flex items-start gap-2.5">
                  <span className="rounded-lg bg-card-2 border border-app px-2.5 py-1 text-xs font-bold text-muted font-mono">
                    Prompt
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-app pt-0.5">
                    {AI_DEMO_PREVIEWS[activeAiTab].q}
                  </p>
                </div>

                <div className="flex items-start gap-3 border-t border-app pt-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white shadow-md">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-app leading-relaxed whitespace-pre-wrap">
                      {AI_DEMO_PREVIEWS[activeAiTab].a}
                    </p>
                    <p className="text-[10px] text-muted pt-1">
                      &bull; Grounded in active video lecture context &bull; Available 24/7
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Mentor Chad Illustration */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden border-2 border-[#f97316]/50 shadow-2xl shadow-[#f97316]/20 group">
                <img
                  src="/mentor-chad.jpg"
                  alt="SkillUP AI Mentor Chad"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-black/85 backdrop-blur-md border border-[#f97316]/40 p-3 shadow-xl text-center">
                  <p className="text-xs font-bold text-white">Always in your corner ☕</p>
                  <p className="text-[10px] text-slate-300">Explaining code, architecture & bugs 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* PIONEERS & LEGENDS OF EDUCATION & TECH QUOTES             */}
      {/* ========================================================= */}
      <section id="visionaries" className="py-16 border-t border-app">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#f97316]">
              Standing On The Shoulders Of Giants
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-app">
              Wisdom From Pioneers of Science & Education
            </h2>
            <p className="text-xs sm:text-sm text-muted">
              Great engineering is not just about syntax &mdash; it is about mindset, relentless curiosity, and building for the future.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VISIONARIES.map((v, i) => (
              <div
                key={i}
                className="relative flex flex-col justify-between rounded-3xl border border-app bg-card p-6 transition-all hover:border-[#f97316]/40 shadow-xl overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Quote className="h-6 w-6 text-[#f97316] opacity-60" />
                    <span className="rounded-full bg-[#f97316]/10 px-2.5 py-0.5 text-[9px] font-bold text-[#f97316]">
                      {v.tag}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm italic text-app leading-relaxed font-serif">
                    &ldquo;{v.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-app flex items-center gap-3">
                  <img
                    src={v.avatar}
                    alt={v.name}
                    className="h-10 w-10 rounded-full object-cover border border-app"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-app">{v.name}</h4>
                    <p className="text-[10px] text-muted">{v.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FEATURED LIVE COURSES PREVIEW                             */}
      {/* ========================================================= */}
      <section className="py-16 border-t border-app">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#f97316]">Active Tracks</p>
              <h2 className="text-xl sm:text-3xl font-black text-app">Featured Available Courses</h2>
            </div>
            <Link href="/courses" className="text-xs font-bold text-[#f97316] hover:underline flex items-center gap-1">
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

          {!loading && courses.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.slice(0, 6).map((course: any) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-app bg-card p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-[#f97316]/50 hover:shadow-xl hover:shadow-[#f97316]/5"
                >
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

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f97316] text-white shadow-lg shadow-[#f97316]/40">
                        <Play className="h-5 w-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    <div className="absolute top-2.5 left-2.5">
                      <span className="rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-bold text-[#f97316] backdrop-blur-md border border-[#f97316]/20">
                        {course.category || 'Engineering'}
                      </span>
                    </div>
                  </div>

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

                    <div className="mt-auto pt-3 flex items-center justify-between border-t border-app">
                      <span className="rounded-full bg-[#f97316]/10 px-2.5 py-0.5 text-xs font-extrabold text-[#f97316]">
                        100% Free
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-app group-hover:text-[#f97316] transition-colors">
                        View Track <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* STUDENT TESTIMONIALS & WALL OF LOVE                       */}
      {/* ========================================================= */}
      <section className="py-16 border-t border-app bg-card-2/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#f97316]">
              Learner Stories
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-app">
              Loved by Engineers Cracking Top Tech Roles
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {REVIEWS.map((review, i) => (
              <div
                key={i}
                className="flex flex-col justify-between rounded-3xl border border-app bg-card p-6 shadow-xl space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex text-[#f59e0b]">
                    {[...Array(review.rating)].map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-app leading-relaxed">
                    &ldquo;{review.content}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-app flex items-center gap-3">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="h-10 w-10 rounded-full object-cover border border-app"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-app">{review.name}</h4>
                    <p className="text-[10px] text-muted">{review.role}</p>
                    <span className="text-[9px] font-semibold text-[#f97316] block mt-0.5">
                      Completed: {review.track}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FREQUENTLY ASKED QUESTIONS (FAQ)                          */}
      {/* ========================================================= */}
      <section className="py-16 border-t border-app">
        <div className="mx-auto max-w-3xl px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#f97316]">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-app">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-app bg-card overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-app hover:text-[#f97316] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#f97316]' : 'text-muted'
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-muted leading-relaxed border-t border-app pt-3 animate-in fade-in-50 duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FINAL HIGH CONVERSION BANNER                              */}
      {/* ========================================================= */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="relative overflow-hidden rounded-3xl border border-[#f97316]/40 bg-gradient-to-br from-[#f97316] to-[#ea580c] p-8 sm:p-14 text-center text-white shadow-2xl space-y-6">
            <div className="relative z-10 max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                Ready to Level Up Your Tech Career?
              </h2>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium">
                Join thousands of engineers mastering DSA, distributed architecture, and AI systems without paying a single rupee.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                {isSignedIn ? (
                  <Link href="/dashboard">
                    <button className="rounded-full bg-white px-8 py-3.5 text-xs sm:text-sm font-black text-[#f97316] hover:bg-slate-100 transition-all shadow-xl hover:scale-105">
                      Open My Learning Room
                    </button>
                  </Link>
                ) : (
                  <SignUpButton mode="modal">
                    <button className="rounded-full bg-white px-8 py-3.5 text-xs sm:text-sm font-black text-[#f97316] hover:bg-slate-100 transition-all shadow-xl hover:scale-105">
                      Create Free Account & Start Learning
                    </button>
                  </SignUpButton>
                )}

                <Link href="/courses">
                  <button className="rounded-full bg-black/30 border border-white/30 px-6 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-black/50 transition-colors">
                    Browse All Tracks
                  </button>
                </Link>
              </div>
            </div>

            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-black/20 blur-2xl pointer-events-none" />
          </div>
        </div>
      </section>
    </div>
  );
}
