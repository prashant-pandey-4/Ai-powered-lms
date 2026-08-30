'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { SkillUpHeader } from '@/components/skillup-header';
import { ArrowLeft, Clock, Calendar, User, BookOpen, Share2, Check } from 'lucide-react';
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
      <div className="flex min-h-screen flex-col bg-[#0d0d10] p-8 space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-32 bg-[#16161a]" />
        <Skeleton className="h-12 w-full bg-[#16161a]" />
        <Skeleton className="aspect-video w-full rounded-2xl bg-[#16161a]" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d0d10] text-center p-8">
        <h2 className="text-xl font-bold text-white">Article Not Found</h2>
        <Link href="/blog" className="mt-4">
          <button className="rounded-full bg-[#d4f76d] px-6 py-2.5 text-xs font-bold text-black">
            Back to Articles
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0d10]">
      <SkillUpHeader title="Knowledge Hub" />

      <article className="mx-auto w-full max-w-3xl p-6 lg:p-8 space-y-8">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#8e8e9c] hover:text-[#d4f76d] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to All Articles
          </Link>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-full border border-[#23232a] bg-[#16161a] px-3.5 py-1.5 text-xs font-semibold text-[#8e8e9c] hover:text-white transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#d4f76d]" /> : <Share2 className="h-3.5 w-3.5" />}
            {copied ? 'Link Copied' : 'Share'}
          </button>
        </div>

        {/* Header Metadata */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#d4f76d]/15 px-3 py-1 text-xs font-bold text-[#d4f76d]">
              {post.category || 'Engineering'}
            </span>
            <span className="flex items-center gap-1 text-xs text-[#8e8e9c]">
              <Clock className="h-3.5 w-3.5" /> {post.readTime || 5} min read
            </span>
            <span className="text-[#8e8e9c]">•</span>
            <span className="flex items-center gap-1 text-xs text-[#8e8e9c]">
              <Calendar className="h-3.5 w-3.5" /> {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
            {post.title}
          </h1>

          <p className="text-sm sm:text-base text-[#8e8e9c] leading-relaxed border-l-2 border-[#d4f76d] pl-4 italic">
            {post.summary}
          </p>

          {/* Author Card */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#16161a] border border-[#23232a]">
              {post.author?.avatarUrl ? (
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-[#8e8e9c]" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-none">
                {post.author?.name || 'SkillUP Editorial'}
              </p>
              <p className="text-[10px] text-[#8e8e9c] mt-0.5">Author & Contributor</p>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="overflow-hidden rounded-2xl border border-[#23232a] bg-[#16161a]">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover max-h-[420px]"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-[#f4f4f5] leading-relaxed space-y-4 whitespace-pre-line border-t border-[#23232a] pt-6">
          {post.content}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[#23232a]">
            <span className="text-xs text-[#8e8e9c] font-semibold">Topics:</span>
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="rounded-full border border-[#23232a] bg-[#16161a] px-3 py-1 text-[11px] font-medium text-[#8e8e9c]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Bottom CTA Card */}
        <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-8 text-center space-y-4 mt-12">
          <h3 className="text-lg font-bold text-white">Ready to master this in practice?</h3>
          <p className="text-xs text-[#8e8e9c] max-w-md mx-auto">
            Explore our curated video courses with sequential syllabus, project code, and instant AI doubt assistance.
          </p>
          <Link href="/">
            <button className="rounded-full bg-[#d4f76d] px-6 py-2.5 text-xs font-bold text-black hover:bg-[#c4ea5c] transition-all">
              Explore All Courses
            </button>
          </Link>
        </div>
      </article>
    </div>
  );
}
