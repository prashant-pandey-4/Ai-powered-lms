'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SkillUpHeader } from '@/components/skillup-header';
import {
  BookOpen,
  Clock,
  Search,
  ArrowRight,
  Newspaper,
  Flame,
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function PublicBlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('all');

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

  const categories = ['All', ...Array.from(new Set(blogs.map((b) => b.category || 'Engineering').filter(Boolean)))];

  const filteredBlogs = blogs.filter((b) => {
    const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;
    const matchesType =
      selectedType === 'all' ||
      (selectedType === 'external' && b.resourceType === 'external_reference') ||
      (selectedType === 'in_house' && b.resourceType !== 'external_reference');

    const matchesSearch =
      !search.trim() ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.summary?.toLowerCase().includes(search.toLowerCase()) ||
      b.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase()));

    return matchesCat && matchesType && matchesSearch;
  });

  return (
    <div className="flex min-h-screen flex-col bg-app bg-grid-pattern">
      <SkillUpHeader title="Knowledge Hub & Engineering References" />

      <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="rounded-3xl border border-app bg-card p-8 lg:p-10 shadow-2xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-3.5 py-1 text-xs font-bold text-[#f97316]">
              <Flame className="h-3.5 w-3.5 fill-current" />
              <span>Free Engineering References & Architecture Guides</span>
            </div>

            <div className="text-xs font-semibold text-muted">
              {blogs.length} Curated Resources & Guides
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-app leading-tight max-w-3xl">
            Software Engineering & Architecture Knowledge Hub
          </h1>
          <p className="max-w-2xl text-xs sm:text-sm text-muted leading-relaxed">
            Curated interactive reference books, deep-dive system architecture breakdowns, and foundational guides from first principles.
          </p>

          {/* Dual-Mode Type Filter Pills */}
          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={() => setSelectedType('all')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                selectedType === 'all'
                  ? 'bg-[#f97316] text-white shadow-md shadow-[#f97316]/20'
                  : 'border border-app bg-card-2 text-muted hover:text-app'
              }`}
            >
              All Knowledge Items ({blogs.length})
            </button>
            <button
              onClick={() => setSelectedType('external')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                selectedType === 'external'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'border border-app bg-card-2 text-muted hover:text-app'
              }`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Interactive Books & Docs ({blogs.filter((b) => b.resourceType === 'external_reference').length})
            </button>
            <button
              onClick={() => setSelectedType('in_house')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                selectedType === 'in_house'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'border border-app bg-card-2 text-muted hover:text-app'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              In-House Articles ({blogs.filter((b) => b.resourceType !== 'external_reference').length})
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="pt-2 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Search topics, system design, protocols, books..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-2xl border border-app bg-app pl-10 pr-4 text-xs text-app placeholder:text-subtle focus:border-[#f97316] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'border border-[#f97316] bg-[#f97316]/15 text-[#f97316]'
                      : 'border border-app bg-card-2 text-muted hover:text-app'
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
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-3xl border border-app bg-card p-4 space-y-3">
                <Skeleton className="aspect-video w-full rounded-2xl bg-card-2" />
                <Skeleton className="h-5 w-3/4 bg-card-2" />
                <Skeleton className="h-3 w-full bg-card-2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBlogs.length === 0 && (
          <div className="rounded-3xl border border-app bg-card p-12 text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f97316]/10 text-[#f97316] mx-auto">
              <Newspaper className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-app">No articles or references found</h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Try adjusting your search keywords or switching category filters.
            </p>
          </div>
        )}

        {/* Blog / Resources Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBlogs.map((b) => {
            const isExternal = b.resourceType === 'external_reference';

            return (
              <div
                key={b.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-app bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#f97316]/50 hover:shadow-xl hover:shadow-[#f97316]/5"
              >
                <div className="space-y-3.5">
                  {/* Banner Image */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-app bg-black">
                    {b.coverImage ? (
                      <img
                        src={b.coverImage}
                        alt={b.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-card-2">
                        <BookOpen className="h-8 w-8 text-subtle" />
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="rounded-lg bg-black/80 px-2.5 py-1 text-[10px] font-bold text-[#f97316] backdrop-blur-md border border-[#f97316]/20">
                        {b.category || 'General'}
                      </span>
                    </div>

                    {/* External Docs / Book Pill */}
                    {isExternal ? (
                      <div className="absolute top-2.5 right-2.5">
                        <span className="rounded-lg bg-purple-950/90 px-2.5 py-1 text-[10px] font-extrabold text-purple-300 backdrop-blur-md border border-purple-500/40 flex items-center gap-1 shadow-sm">
                          <ExternalLink className="h-3 w-3" /> Interactive Book
                        </span>
                      </div>
                    ) : (
                      <div className="absolute top-2.5 right-2.5">
                        <span className="rounded-lg bg-black/80 px-2 py-0.5 text-[10px] font-semibold text-muted backdrop-blur-md border border-app flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5 text-[#f97316]" /> {b.readTime || 5} min
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Title & Summary */}
                  <div className="space-y-1.5">
                    <h3 className="text-sm sm:text-base font-bold text-app line-clamp-2 group-hover:text-[#f97316] transition-colors">
                      {b.title}
                    </h3>
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                      {b.summary}
                    </p>
                  </div>

                  {/* Tags */}
                  {b.tags && b.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {b.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="rounded-md bg-card-2 px-2 py-0.5 text-[10px] font-medium text-muted border border-app"
                        >
                          #{tag}
                        </span>
                      ))}
                      {b.tags.length > 3 && (
                        <span className="text-[10px] text-muted self-center">
                          +{b.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 flex items-center justify-between border-t border-app">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f97316]/15 text-[10px] font-bold text-[#f97316]">
                      {(b.author?.name || 'S').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[11px] font-medium text-app truncate max-w-[120px]">
                      {b.author?.name || 'SkillUP Author'}
                    </span>
                  </div>

                  {isExternal && b.externalUrl ? (
                    <a
                      href={b.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <span>Open Book</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <Link
                      href={`/blog/${b.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#f97316] group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
