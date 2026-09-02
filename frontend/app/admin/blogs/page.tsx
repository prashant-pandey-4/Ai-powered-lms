'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { SkillUpHeader } from '@/components/skillup-header';
import { Plus, Newspaper, Eye, Trash2, ArrowLeft, Flame } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function AdminBlogsPage() {
  const { getToken } = useAuth();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetchApi<any[]>('/blogs?all=true', { token });
      if (res.success && Array.isArray(res.data)) {
        setBlogs(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, [getToken]);

  const handleTogglePublish = async (blogId: string, currentlyPublished: boolean) => {
    try {
      const token = await getToken();
      const res = await fetchApi(`/blogs/${blogId}/publish`, { method: 'POST', token });
      if (res.success) {
        toast.success(currentlyPublished ? 'Article moved to drafts.' : 'Article published live!');
        loadBlogs();
      } else {
        toast.error(res.message || 'Failed to update publish status.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    }
  };

  const handleDelete = async (blogId: string, title: string) => {
    toast(`Delete "${title}"?`, {
      description: 'This action cannot be undone.',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            const token = await getToken();
            const res = await fetchApi(`/blogs/${blogId}`, { method: 'DELETE', token });
            if (res.success) {
              toast.success('Article deleted.');
              loadBlogs();
            } else {
              toast.error(res.message || 'Failed to delete article.');
            }
          } catch {
            toast.error('Network error.');
          }
        },
      },
      cancel: { label: 'Cancel', onClick: () => {} },
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-app bg-grid-pattern">
      <SkillUpHeader title="Admin â€” Knowledge Hub Articles" />

      <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-[#f97316] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Studio Overview
          </Link>

          <Link href="/admin/blogs/new">
            <button className="flex items-center gap-2 rounded-full glow-amber-btn px-5 py-2.5 text-xs font-bold text-white transition-all">
              <Plus className="h-4 w-4" /> Write New Article
            </button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-app bg-card p-5 space-y-1">
            <h4 className="text-3xl font-black text-app">{blogs.length}</h4>
            <p className="text-xs font-bold text-muted">Total Articles</p>
          </div>
          <div className="rounded-2xl border border-app bg-card p-5 space-y-1">
            <h4 className="text-3xl font-black text-[#f97316]">
              {blogs.filter((b) => b.isPublished).length}
            </h4>
            <p className="text-xs font-bold text-muted">Published Live</p>
          </div>
          <div className="rounded-2xl border border-app bg-card p-5 space-y-1">
            <h4 className="text-3xl font-black text-[#f59e0b]">
              {blogs.filter((b) => !b.isPublished).length}
            </h4>
            <p className="text-xs font-bold text-muted">Drafts</p>
          </div>
        </div>

        {/* Articles List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl bg-card" />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-app p-16 text-center bg-card">
            <Newspaper className="mb-4 h-10 w-10 text-subtle" />
            <h3 className="text-base font-bold text-app">No articles created yet</h3>
            <p className="mt-2 text-xs text-muted">
              Share knowledge, case studies, and tutorials with your community.
            </p>
            <Link href="/admin/blogs/new" className="mt-5">
              <button className="rounded-full glow-amber-btn px-6 py-2.5 text-xs font-bold text-white">
                Write First Article
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {blogs.map((b) => (
              <div
                key={b.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-app bg-card p-4 transition-colors hover:border-[#f97316]/40 shadow-lg"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-14 w-24 shrink-0 overflow-hidden rounded-xl bg-black border border-app">
                    {b.coverImage ? (
                      <img
                        src={b.coverImage}
                        alt={b.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-card-2">
                        <Newspaper className="h-5 w-5 text-muted" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-app truncate max-w-md">
                        {b.title}
                      </h4>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          b.isPublished
                            ? 'bg-[#f97316]/15 text-[#f97316]'
                            : 'bg-card-2 text-muted'
                        }`}
                      >
                        {b.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted mt-0.5">
                      {b.category} â€¢ {b.readTime || 5} min read â€¢ Created {new Date(b.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {b.isPublished && (
                    <Link href={`/blog/${b.slug}`} target="_blank">
                      <button className="flex items-center gap-1.5 rounded-full border border-app bg-card-2 px-3.5 py-1.5 text-xs font-bold text-white hover:border-[#f97316] transition-colors">
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    </Link>
                  )}

                  <button
                    onClick={() => handleTogglePublish(b.id, b.isPublished)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                      b.isPublished
                        ? 'border border-app bg-card-2 text-muted hover:text-white'
                        : 'glow-amber-btn text-white'
                    }`}
                  >
                    {b.isPublished ? 'Set to Draft' : 'Publish'}
                  </button>

                  <button
                    onClick={() => handleDelete(b.id, b.title)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-900/40 bg-red-950/20 text-red-400 hover:bg-red-950/40 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
