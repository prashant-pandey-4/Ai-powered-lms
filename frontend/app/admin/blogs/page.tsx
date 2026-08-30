'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { SkillUpHeader } from '@/components/skillup-header';
import { Plus, Newspaper, Eye, Edit, Trash2, ArrowLeft } from 'lucide-react';
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
        toast.success(currentlyPublished ? 'Article moved to drafts.' : 'Article published successfully!');
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
            toast.error('Network error. Please try again.');
          }
        },
      },
      cancel: { label: 'Cancel', onClick: () => {} },
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0d10]">
      <SkillUpHeader title="Admin — Articles & Blog Engine" />

      <div className="p-6 lg:p-8 space-y-8">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#8e8e9c] hover:text-[#d4f76d] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Admin Panel
          </Link>

          <Link href="/admin/blogs/new">
            <button className="flex items-center gap-2 rounded-full bg-[#d4f76d] px-5 py-2.5 text-xs font-bold text-black transition-all hover:bg-[#c4ea5c]">
              <Plus className="h-4 w-4" /> Write New Article
            </button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-5">
            <h4 className="text-2xl font-extrabold text-white">{blogs.length}</h4>
            <p className="text-xs font-semibold text-[#8e8e9c] mt-1">Total Articles</p>
          </div>
          <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-5">
            <h4 className="text-2xl font-extrabold text-[#d4f76d]">
              {blogs.filter((b) => b.isPublished).length}
            </h4>
            <p className="text-xs font-semibold text-[#8e8e9c] mt-1">Published Live</p>
          </div>
          <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-5">
            <h4 className="text-2xl font-extrabold text-[#f9d8b9]">
              {blogs.filter((b) => !b.isPublished).length}
            </h4>
            <p className="text-xs font-semibold text-[#8e8e9c] mt-1">Drafts</p>
          </div>
        </div>

        {/* Articles List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl bg-[#16161a]" />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#23232a] p-16 text-center">
            <Newspaper className="mb-4 h-10 w-10 text-[#3c3c46]" />
            <h3 className="text-base font-bold text-white">No articles created yet</h3>
            <p className="mt-2 text-xs text-[#8e8e9c]">
              Share knowledge, case studies, and tutorials with your community.
            </p>
            <Link href="/admin/blogs/new" className="mt-5">
              <button className="rounded-full bg-[#d4f76d] px-5 py-2.5 text-xs font-bold text-black hover:bg-[#c4ea5c]">
                Write First Article
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {blogs.map((b) => (
              <div
                key={b.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#23232a] bg-[#16161a] p-5 transition-colors hover:border-[#34343d]"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-12 w-20 shrink-0 overflow-hidden rounded-xl bg-black">
                    {b.coverImage ? (
                      <img
                        src={b.coverImage}
                        alt={b.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#23232a]">
                        <Newspaper className="h-5 w-5 text-[#8e8e9c]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate max-w-md">
                        {b.title}
                      </h4>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          b.isPublished
                            ? 'bg-[#d4f76d]/15 text-[#d4f76d]'
                            : 'bg-[#23232a] text-[#8e8e9c]'
                        }`}
                      >
                        {b.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8e8e9c] mt-0.5">
                      {b.category} • {b.readTime || 5} min read • Created {new Date(b.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {b.isPublished && (
                    <Link href={`/blog/${b.slug}`} target="_blank">
                      <button className="flex items-center gap-1.5 rounded-full border border-[#23232a] bg-[#1c1c22] px-3.5 py-1.5 text-xs font-bold text-white hover:border-[#d4f76d]">
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    </Link>
                  )}

                  <button
                    onClick={() => handleTogglePublish(b.id, b.isPublished)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                      b.isPublished
                        ? 'border border-[#23232a] bg-[#1c1c22] text-[#8e8e9c] hover:text-white'
                        : 'bg-[#d4f76d] text-black hover:bg-[#c4ea5c]'
                    }`}
                  >
                    {b.isPublished ? 'Set to Draft' : 'Publish'}
                  </button>

                  <button
                    onClick={() => handleDelete(b.id, b.title)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-900/40 bg-red-950/20 text-red-400 hover:bg-red-950/40"
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
