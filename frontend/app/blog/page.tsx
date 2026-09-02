'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SkillUpHeader } from '@/components/skillup-header';
import { BookOpen, Clock, Search, ArrowRight, Newspaper, Flame } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function PublicBlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    async function loadBlogs() {
      setLoading(true);
      try {
        const res = await fetchApi<any[]>('/blogs');
        if (res.success && Array.isArray(res.data)) {
          setBlogs(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();
  }, []);

  const categories = ['All', ...Array.from(new Set(blogs.map((b) => b.category || 'Tech').filter(Boolean)))];

  const filteredBlogs = blogs.filter((b) => {
    const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;
    const matchesSearch =
      !search.trim() ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.summary?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex min-h-screen flex-col bg-[#060709] bg-grid-pattern">
      <SkillUpHeader title="Knowledge Hub" />

      <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="rounded-3xl border border-[#22232a] bg-[#111217] p-8 lg:p-10 shadow-2xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#f97316]">
            <Flame className="h-4 w-4 fill-current" />
            <span>Developer Insights & Tutorials</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            Engineering Breakdowns & Architecture Guides
          </h1>
          <p className="max-w-2xl text-xs sm:text-sm text-[#9ca3af] leading-relaxed">
            Deep dive into technical breakthroughs, software design patterns, and interview preparation written by senior engineers.
          </p>

          {/* Search & Category Filter */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#9ca3af]" />
              <input
                type="text"
                placeholder="Search articles by title or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-2xl border border-[#22232a] bg-[#060709] pl-10 pr-4 text-xs text-white placeholder:text-[#6b7280] focus:border-[#f97316] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white shadow-md shadow-[#f97316]/20'
                      : 'border border-[#22232a] bg-[#17181f] text-[#9ca3af] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-[#22232a] bg-[#111217] p-4 space-y-3">
                <Skeleton className="aspect-video w-full rounded-xl bg-[#17181f]" />
                <Skeleton className="h-5 w-3/4 bg-[#17181f]" />
                <Skeleton className="h-3 w-full bg-[#17181f]" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBlogs.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#22232a] p-16 text-center bg-[#111217]">
            <BookOpen className="mb-4 h-10 w-10 text-[#6b7280]" />
            <h3 className="text-base font-bold text-white">No articles published yet</h3>
            <p className="mt-2 text-xs text-[#9ca3af]">
              Check back soon for newly published tutorials and engineering guides.
            </p>
          </div>
        )}

        {/* Blog Grid */}
        {!loading && filteredBlogs.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBlogs.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#22232a] bg-[#111217] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#f97316]/50 shadow-xl"
              >
                {/* Cover Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-black border border-[#22232a]">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#17181f]">
                      <Newspaper className="h-8 w-8 text-[#6b7280]" />
                    </div>
                  )}
                </div>

                {/* Article Info */}
                <div className="flex flex-1 flex-col pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="rounded-md bg-[#f97316]/15 px-2 py-0.5 text-[10px] font-bold text-[#f97316]">
                      {post.category || 'General'}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-[#9ca3af]">
                      <Clock className="h-3 w-3" /> {post.readTime || 5} min read
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-[#f97316] line-clamp-2 transition-colors">
                    {post.title}
                  </h3>

                  <p className="mt-2 text-xs text-[#9ca3af] line-clamp-2 leading-relaxed">
                    {post.summary}
                  </p>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#22232a] mt-4">
                    <span className="text-[11px] text-[#9ca3af]">
                      By {post.author?.name || 'SkillUP Author'}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-white group-hover:text-[#f97316] transition-colors">
                      Read Article <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
