'use client';

import { useEffect, useState, use, useRef } from 'react';
import Link from 'next/link';
import { SkillUpHeader } from '@/components/skillup-header';
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  BookOpen,
  Share2,
  Check,
  Flame,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Search,
  Copy,
  Hash,
  Sparkles,
  Layers,
  ArrowUpRight,
  Bookmark,
  Compass,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export default function SingleBlogReaderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [post, setPost] = useState<any>(null);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [headings, setHeadings] = useState<HeadingItem[]>([]);

  // 1. Load active post and list of all posts for the left chapter sidebar
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [singleRes, allRes] = await Promise.all([
          fetchApi<any>(`/blogs/${slug}`),
          fetchApi<any[]>('/blogs'),
        ]);

        if (singleRes.success && singleRes.data) {
          setPost(singleRes.data);

          // Extract table of contents headings from markdown content
          if (singleRes.data.content) {
            const lines = singleRes.data.content.split('\n');
            const extracted: HeadingItem[] = [];
            lines.forEach((line: string) => {
              const match = line.match(/^(#{2,3})\s+(.*)$/);
              if (match) {
                const level = match[1].length;
                const text = match[2].replace(/[#*`_]/g, '').trim();
                const id = text
                  .toLowerCase()
                  .replace(/[^\w\s-]/g, '')
                  .replace(/[\s_-]+/g, '-');
                if (text) {
                  extracted.push({ id, text, level });
                }
              }
            });
            setHeadings(extracted);
          }
        }

        if (allRes.success && Array.isArray(allRes.data)) {
          setAllPosts(allRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  // 2. Reading progress bar tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, currentProgress)));
      }

      // Track active heading
      if (headings.length > 0) {
        for (let i = headings.length - 1; i >= 0; i--) {
          const el = document.getElementById(headings[i].id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 120) {
              setActiveHeadingId(headings[i].id);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Article URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  // Find next and previous posts in the track
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex >= 0 && currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  // Filter sidebar posts by query
  const filteredSidebarPosts = allPosts.filter((p) =>
    !sidebarSearch.trim() ||
    p.title.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  // Group sidebar posts by category
  const categoriesMap = filteredSidebarPosts.reduce((acc: Record<string, any[]>, item) => {
    const cat = item.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-app">
        <SkillUpHeader title="Knowledge Hub" />
        <div className="mx-auto w-full max-w-7xl p-8 space-y-6">
          <Skeleton className="h-8 w-48 bg-card" />
          <Skeleton className="h-12 w-3/4 bg-card" />
          <Skeleton className="h-96 w-full rounded-3xl bg-card" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-app text-center p-8">
        <h2 className="text-xl font-bold text-app">Article Not Found</h2>
        <Link href="/blog" className="mt-4">
          <button className="rounded-full glow-amber-btn px-6 py-2.5 text-xs font-bold text-white">
            Back to Knowledge Hub
          </button>
        </Link>
      </div>
    );
  }

  const isExternal = post.resourceType === 'external_reference';

  // ── Render Markdown with formatted Code Blocks, Headings & Callouts ──
  const renderMarkdownContent = (content: string) => {
    const blocks = content.split(/\n\n+/);

    return blocks.map((block, idx) => {
      // 1. Code Block: ```lang ... ```
      if (block.startsWith('```')) {
        const lines = block.split('\n');
        const firstLine = lines[0].replace(/```/, '').trim() || 'code';
        const codeText = lines.slice(1, lines.length - 1).join('\n');

        return (
          <div key={idx} className="my-5 overflow-hidden rounded-2xl border border-app bg-[#0a0b0e] shadow-xl">
            <div className="flex items-center justify-between border-b border-app/60 bg-card-2/60 px-4 py-2 text-xs">
              <span className="font-mono text-[11px] font-bold text-[#f97316] uppercase tracking-wider">
                {firstLine}
              </span>
              <button
                type="button"
                onClick={() => copyCode(codeText)}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-muted hover:bg-card hover:text-app transition-colors"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
            </div>
            <pre className="overflow-x-auto p-4 text-xs font-mono text-[#e5e7eb] leading-relaxed">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      // 2. Heading 2: ## ...
      if (block.startsWith('## ')) {
        const text = block.replace(/^##\s+/, '').trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-');
        return (
          <h2
            key={idx}
            id={id}
            className="group mt-10 mb-4 flex items-center gap-2 text-xl sm:text-2xl font-black text-app scroll-mt-24 border-b border-app/60 pb-2"
          >
            <span>{text}</span>
            <a
              href={`#${id}`}
              className="opacity-0 group-hover:opacity-100 text-[#f97316] transition-opacity"
              aria-label="Anchor"
            >
              <Hash className="h-4 w-4" />
            </a>
          </h2>
        );
      }

      // 3. Heading 3: ### ...
      if (block.startsWith('### ')) {
        const text = block.replace(/^###\s+/, '').trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-');
        return (
          <h3
            key={idx}
            id={id}
            className="mt-6 mb-3 text-lg font-bold text-app scroll-mt-24"
          >
            {text}
          </h3>
        );
      }

      // 4. Callout / Alert: > Note: or > Tip: or > Warning:
      if (block.startsWith('>')) {
        const cleanText = block.replace(/^>\s*/gm, '').trim();
        return (
          <div
            key={idx}
            className="my-5 rounded-2xl border border-app bg-card-2/60 p-4 border-l-4 border-l-[#f97316] text-xs sm:text-sm text-app leading-relaxed shadow-sm"
          >
            <div className="flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-[#f97316] shrink-0 mt-0.5" />
              <div className="space-y-1">{cleanText}</div>
            </div>
          </div>
        );
      }

      // 5. Regular Paragraph
      return (
        <p key={idx} className="text-xs sm:text-sm sm:text-base leading-relaxed text-[#d1d5db] font-normal my-3">
          {block}
        </p>
      );
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-app bg-grid-pattern">
      {/* ── Glowing Top Reading Progress Bar ─────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#f97316] via-[#ea580c] to-[#f59e0b] transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <SkillUpHeader title={post.title} />

      {/* ── Main 3-Column Layout ───────────────────────────────────── */}
      <div className="mx-auto w-full max-w-[1536px] px-4 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ════════ LEFT COLUMN (3 cols): Sequential Chapter / Article Explorer ════════ */}
          <aside className="hidden lg:block lg:col-span-3 space-y-5 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
            <div className="rounded-3xl border border-app bg-card p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-[#f97316]" /> Knowledge Chapters
                </h3>
                <span className="rounded-full bg-[#f97316]/10 px-2 py-0.5 text-[10px] font-bold text-[#f97316]">
                  {allPosts.length} Items
                </span>
              </div>

              {/* Sidebar Search Filter */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted" />
                <input
                  type="text"
                  placeholder="Filter chapters..."
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  className="h-8 w-full rounded-xl border border-app bg-app pl-8 pr-3 text-xs text-app placeholder:text-subtle focus:border-[#f97316] focus:outline-none transition-colors"
                />
              </div>

              {/* Categorized Chapters List */}
              <div className="space-y-4 pt-1">
                {Object.entries(categoriesMap).map(([categoryName, items]: [string, any]) => (
                  <div key={categoryName} className="space-y-1.5">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted px-2">
                      {categoryName}
                    </p>
                    <div className="space-y-1">
                      {items.map((item: any) => {
                        const isActive = item.slug === slug;
                        const isExt = item.resourceType === 'external_reference';

                        return (
                          <Link
                            key={item.id}
                            href={`/blog/${item.slug}`}
                            className={`group flex items-start gap-2 rounded-xl px-2.5 py-2 text-xs transition-all ${
                              isActive
                                ? 'bg-gradient-to-r from-[#f97316]/20 via-[#f97316]/10 to-transparent border border-[#f97316]/40 text-[#f97316] font-bold'
                                : 'text-muted hover:bg-card-2 hover:text-app'
                            }`}
                          >
                            <span className="mt-0.5 shrink-0">
                              {isExt ? (
                                <ExternalLink className="h-3.5 w-3.5 text-purple-400" />
                              ) : (
                                <BookOpen className="h-3.5 w-3.5 text-subtle group-hover:text-app" />
                              )}
                            </span>
                            <span className="line-clamp-2 leading-tight flex-1">
                              {item.title}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ════════ CENTER COLUMN (6 cols): Distraction-Free Article Canvas ════════ */}
          <main className="lg:col-span-6 space-y-8">
            {/* Breadcrumbs & Share Header */}
            <div className="flex items-center justify-between border-b border-app pb-4">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <Link href="/blog" className="hover:text-[#f97316] transition-colors">
                  Knowledge Hub
                </Link>
                <span>/</span>
                <span className="text-app font-semibold">{post.category || 'Engineering'}</span>
              </div>

              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 rounded-full border border-app bg-card px-3.5 py-1.5 text-xs font-semibold text-muted hover:text-app hover:border-[#f97316] transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-[#f97316]" /> : <Share2 className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Share'}
              </button>
            </div>

            {/* Article Header & Metadata */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-[#f97316]/15 px-3 py-1 text-xs font-bold text-[#f97316]">
                  {post.category || 'Engineering'}
                </span>

                {isExternal && (
                  <span className="rounded-md bg-purple-500/20 px-3 py-1 text-xs font-extrabold text-purple-300 border border-purple-500/30 flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" /> Interactive Reference Book
                  </span>
                )}

                <span className="flex items-center gap-1 text-xs text-muted">
                  <Clock className="h-3.5 w-3.5 text-[#f97316]" /> {post.readTime || 5} min read
                </span>
                <span className="text-subtle">&bull;</span>
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Calendar className="h-3.5 w-3.5" /> {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-app leading-tight tracking-tight">
                {post.title}
              </h1>

              <p className="text-sm sm:text-base text-muted leading-relaxed border-l-2 border-[#f97316] pl-4 italic">
                {post.summary}
              </p>

              {/* Author Card */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-app text-[#f97316] font-bold">
                  {(post.author?.name || 'S').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-app leading-none">
                    {post.author?.name || 'SkillUP Contributor'}
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">Senior Engineering Author</p>
                </div>
              </div>
            </div>

            {/* Cover Banner */}
            {post.coverImage && (
              <div className="overflow-hidden rounded-3xl border border-app bg-black shadow-2xl">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="h-full w-full object-cover max-h-[420px]"
                />
              </div>
            )}

            {/* ── If Curated External Reference: High-Impact Launch Portal Card ── */}
            {isExternal && post.externalUrl && (
              <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-card to-card p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-600/30">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-bold text-app">
                      Interactive Documentation & Engineering Reference
                    </h3>
                    <p className="text-xs text-muted leading-relaxed">
                      This complete 24-chapter engineering reference includes live interactive SVGs, architecture diagrams, and runnable code sandboxes hosted on the official platform.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <a
                    href={post.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-purple-600/25 hover:from-purple-500 hover:to-indigo-500 transition-all"
                  >
                    <span>Open Interactive Reference (Full Screen)</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-app bg-card px-5 py-3.5 text-xs font-bold text-app hover:border-purple-500/50 transition-colors"
                  >
                    <Share2 className="h-4 w-4 text-purple-400" />
                    Share Reference
                  </button>
                </div>
              </div>
            )}

            {/* ── Native Markdown Body ── */}
            {post.content && post.content !== post.summary && (
              <div className="space-y-2 border-t border-app pt-6">
                {renderMarkdownContent(post.content)}
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-app">
                <span className="text-xs text-muted font-semibold">Tags:</span>
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full border border-app bg-card px-3 py-1 text-[11px] font-medium text-muted"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* ── Sequential Chapter / Article Navigation Bar (Prev & Next) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-app">
              {prevPost ? (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="group flex flex-col justify-between rounded-2xl border border-app bg-card p-4 transition-all hover:border-[#f97316] hover:bg-card-2"
                >
                  <span className="flex items-center gap-1 text-[11px] font-bold text-muted group-hover:text-[#f97316]">
                    <ChevronLeft className="h-3.5 w-3.5" /> Previous Chapter
                  </span>
                  <span className="mt-2 text-xs sm:text-sm font-bold text-app line-clamp-1">
                    {prevPost.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}

              {nextPost && (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="group flex flex-col justify-between rounded-2xl border border-app bg-card p-4 text-right transition-all hover:border-[#f97316] hover:bg-card-2"
                >
                  <span className="flex items-center justify-end gap-1 text-[11px] font-bold text-muted group-hover:text-[#f97316]">
                    Next Chapter <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                  <span className="mt-2 text-xs sm:text-sm font-bold text-app line-clamp-1">
                    {nextPost.title}
                  </span>
                </Link>
              )}
            </div>
          </main>

          {/* ════════ RIGHT COLUMN (3 cols): Sticky "On This Page" / Table of Contents ════════ */}
          <aside className="hidden lg:block lg:col-span-3 space-y-5 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pl-2">
            <div className="rounded-3xl border border-app bg-card p-5 space-y-4 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted">
                On This Page
              </h3>

              {headings.length > 0 ? (
                <nav className="space-y-1 text-xs">
                  {headings.map((h) => {
                    const isActive = activeHeadingId === h.id;
                    return (
                      <a
                        key={h.id}
                        href={`#${h.id}`}
                        className={`block rounded-lg px-2.5 py-1.5 transition-all line-clamp-1 ${
                          h.level === 3 ? 'pl-5 text-[11px]' : ''
                        } ${
                          isActive
                            ? 'text-[#f97316] font-bold bg-[#f97316]/10'
                            : 'text-muted hover:text-app hover:bg-card-2'
                        }`}
                      >
                        {h.text}
                      </a>
                    );
                  })}
                </nav>
              ) : (
                <p className="text-xs text-muted">
                  {isExternal ? 'Interactive reference overview' : 'Comprehensive guide overview'}
                </p>
              )}

              <div className="pt-3 border-t border-app space-y-2">
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="w-full text-left text-[11px] font-semibold text-muted hover:text-[#f97316] transition-colors"
                >
                  &uarr; Back to top
                </button>
              </div>
            </div>

            {/* Ready to Learn in Practice Card */}
            <div className="rounded-3xl border border-app bg-gradient-to-br from-[#f97316]/15 via-card to-card p-5 space-y-3 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-app">
                <Flame className="h-4 w-4 text-[#f97316]" />
                <span>Hands-on Courses</span>
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                Practice with video tracks, AI tutor, and code sandboxes on SkillUP.
              </p>
              <Link href="/courses" className="block pt-1">
                <button className="w-full rounded-xl glow-amber-btn py-2 text-xs font-bold text-white transition-all">
                  Browse Free Courses
                </button>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
