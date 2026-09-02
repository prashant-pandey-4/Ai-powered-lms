'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { SkillUpHeader } from '@/components/skillup-header';
import { ArrowLeft, Clock, Calendar, User, BookOpen, Share2, Check, Flame } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function SingleBlogReaderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      try {
        const res = await fetchApi<any>(`/blogs/${slug}`);
        if (res.success && res.data) {
          setPost(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-app p-8 space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-32 bg-card" />
        <Skeleton className="h-12 w-full bg-card" />
        <Skeleton className="aspect-video w-full rounded-2xl bg-card" />
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

  return (
    <div className="flex min-h-screen flex-col bg-app bg-grid-pattern">
      <SkillUpHeader title="Knowledge Hub" />

      <article className="mx-auto w-full max-w-3xl p-6 lg:p-10 space-y-8">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-[#f97316] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to All Articles
          </Link>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-full border border-app bg-card px-3.5 py-1.5 text-xs font-semibold text-muted hover:text-white transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#f97316]" /> : <Share2 className="h-3.5 w-3.5" />}
            {copied ? 'Link Copied' : 'Share'}
          </button>
        </div>

        {/* Header Metadata */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#f97316]/15 px-3 py-1 text-xs font-bold text-[#f97316]">
              {post.category || 'Engineering'}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted">
              <Clock className="h-3.5 w-3.5" /> {post.readTime || 5} min read
            </span>
            <span className="text-subtle">•</span>
            <span className="flex items-center gap-1 text-xs text-muted">
              <Calendar className="h-3.5 w-3.5" /> {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-app leading-tight">
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
              <p className="text-xs font-bold text-white leading-none">
                {post.author?.name || 'SkillUP Contributor'}
              </p>
              <p className="text-[10px] text-muted mt-0.5">Author & Engineer</p>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="overflow-hidden rounded-3xl border border-app bg-black">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover max-h-[420px]"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-[#d1d5db] leading-relaxed space-y-4 whitespace-pre-line border-t border-app pt-6 font-normal">
          {post.content}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-app">
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

        {/* Bottom CTA Card */}
        <div className="rounded-3xl border border-app bg-card p-8 text-center space-y-4 mt-12 shadow-2xl">
          <h3 className="text-xl font-black text-app">Ready to master this in practice?</h3>
          <p className="text-xs text-muted max-w-md mx-auto">
            Explore our curated free video courses with sequential syllabus and 24/7 AI tutor.
          </p>
          <Link href="/courses">
            <button className="rounded-full glow-amber-btn px-6 py-2.5 text-xs font-bold text-white transition-all">
              Explore All Courses
            </button>
          </Link>
        </div>
      </article>
    </div>
  );
}
