'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SkillUpHeader } from '@/components/skillup-header';
import { BookOpen, Clock, Search, ArrowRight, Newspaper } from 'lucide-react';
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
    <div className="flex min-h-screen flex-col bg-[#0d0d10]">
      <SkillUpHeader title="Articles & Insights" />

      <div className="p-6 lg:p-8 space-y-8">
        {/* Hero Section */}
        <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d4f76d]">
            <Newspaper className="h-4 w-4" />
            <span>Community Knowledge Hub</span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
            Tutorials, Case Studies & Creator Guides
          </h1>
          <p className="mt-2 max-w-xl text-xs sm:text-sm text-[#8e8e9c]">
            Deep dive into technical breakthroughs, software engineering patterns, and design principles written by industry experts.
          </p>

          {/* Search & Category Filter */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#8e8e9c]" />
              <input
                type="text"
                placeholder="Search articles by title, topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-full border border-[#23232a] bg-[#0d0d10] pl-10 pr-4 text-xs text-white placeholder:text-[#6c6c7a] focus:border-[#d4f76d] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#d4f76d] text-black font-bold'
                      : 'border border-[#23232a] bg-[#0d0d10] text-[#8e8e9c] hover:text-white'
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
              <div key={i} className="rounded-2xl border border-[#23232a] bg-[#16161a] p-4 space-y-3">
                <Skeleton className="aspect-video w-full rounded-xl bg-[#23232a]" />
                <Skeleton className="h-5 w-3/4 bg-[#23232a]" />
                <Skeleton className="h-3 w-full bg-[#23232a]" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBlogs.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#23232a] p-16 text-center">
            <BookOpen className="mb-4 h-10 w-10 text-[#3c3c46]" />
            <h3 className="text-base font-bold text-white">No articles published yet</h3>
            <p className="mt-2 text-xs text-[#8e8e9c]">
              Check back soon for newly published tutorials and guides.
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
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#23232a] bg-[#16161a] p-4 transition-all duration-200 hover:-translate-y-1 hover:border-[#34343d]"
              >
                {/* Cover Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#23232a]">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Newspaper className="h-8 w-8 text-[#3c3c46]" />
                    </div>
                  )}
                </div>

                {/* Article Info */}
                <div className="flex flex-1 flex-col pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="rounded-full bg-[#23232a] px-2.5 py-0.5 text-[10px] font-bold text-[#d4f76d]">
                      {post.category || 'General'}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-[#8e8e9c]">
                      <Clock className="h-3 w-3" /> {post.readTime || 5} min read
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-[#d4f76d] line-clamp-2 transition-colors">
                    {post.title}
                  </h3>

                  <p className="mt-2 text-xs text-[#8e8e9c] line-clamp-2">
                    {post.summary}
                  </p>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#23232a] mt-4">
                    <span className="text-[11px] text-[#8e8e9c]">
                      By {post.author?.name || 'SkillUP Team'}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#8e8e9c] group-hover:text-[#d4f76d] transition-colors">
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
