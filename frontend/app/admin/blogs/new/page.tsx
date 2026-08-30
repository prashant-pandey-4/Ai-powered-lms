'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { SkillUpHeader } from '@/components/skillup-header';
import { ArrowLeft, Sparkles, Plus } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { MediaUpload } from '@/components/media-upload';

export default function AdminNewBlogPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    coverImage: '',
    category: 'Web Development',
    tagsInput: 'nextjs, react, typescript',
    readTime: '5',
    isPublished: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const token = await getToken();
      const tags = formData.tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const payload = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        coverImage: formData.coverImage,
        category: formData.category,
        tags,
        readTime: parseInt(formData.readTime, 10) || 5,
        isPublished: formData.isPublished,
      };

      const res = await fetchApi<any>('/blogs', {
        method: 'POST',
        token,
        body: JSON.stringify(payload),
      });

      if (res.success && res.data) {
        router.push('/admin/blogs');
      } else {
        setErrorMessage(res.message || 'Failed to create article. Please verify fields.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0d10]">
      <SkillUpHeader title="Admin — Write Article" />

      <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
        <Link
          href="/admin/blogs"
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[#8e8e9c] hover:text-[#d4f76d] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Articles Management
        </Link>

        <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-6 lg:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Create Knowledge Article</h2>
            <p className="mt-1 text-xs text-[#8e8e9c]">
              Publish tutorials, guides, and engineering insights for your community.
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-800/50 bg-red-950/40 p-3 text-xs text-red-300">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#8e8e9c]">
                Article Title <span className="text-[#d4f76d]">*</span>
              </label>
              <input
                required
                placeholder="e.g. Building High-Performance Microservices with Go & Kafka"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="h-10 w-full rounded-xl border border-[#23232a] bg-[#0d0d10] px-3.5 text-xs text-white placeholder:text-[#6c6c7a] focus:border-[#d4f76d] focus:outline-none"
              />
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#8e8e9c]">
                Short Summary (1-2 sentences) <span className="text-[#d4f76d]">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="Brief takeaway explaining what readers will learn..."
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="w-full rounded-xl border border-[#23232a] bg-[#0d0d10] p-3 text-xs text-white placeholder:text-[#6c6c7a] focus:border-[#d4f76d] focus:outline-none"
              />
            </div>

            {/* Cover Image */}
            <MediaUpload
              accept="image"
              label="Article Banner / Cover Image"
              placeholder="https://images.unsplash.com/..."
              value={formData.coverImage}
              onChange={(url) => setFormData({ ...formData, coverImage: url })}
              helperText="Upload JPG/PNG cover image or paste an Unsplash link."
            />

            {/* Category, Read Time, Tags */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8e8e9c]">Category</label>
                <input
                  placeholder="e.g. System Design, AI"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="h-10 w-full rounded-xl border border-[#23232a] bg-[#0d0d10] px-3.5 text-xs text-white placeholder:text-[#6c6c7a] focus:border-[#d4f76d] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8e8e9c]">Reading Time (Mins)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="5"
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                  className="h-10 w-full rounded-xl border border-[#23232a] bg-[#0d0d10] px-3.5 text-xs text-white placeholder:text-[#6c6c7a] focus:border-[#d4f76d] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8e8e9c]">Tags (comma separated)</label>
                <input
                  placeholder="react, api, scaling"
                  value={formData.tagsInput}
                  onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                  className="h-10 w-full rounded-xl border border-[#23232a] bg-[#0d0d10] px-3.5 text-xs text-white placeholder:text-[#6c6c7a] focus:border-[#d4f76d] focus:outline-none"
                />
              </div>
            </div>

            {/* Content Body */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#8e8e9c]">
                Article Content (Supports Markdown & paragraphs) <span className="text-[#d4f76d]">*</span>
              </label>
              <textarea
                required
                rows={12}
                placeholder="Write your article content here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full rounded-xl border border-[#23232a] bg-[#0d0d10] p-4 text-xs font-mono text-white placeholder:text-[#6c6c7a] focus:border-[#d4f76d] focus:outline-none"
              />
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="h-4 w-4 rounded accent-[#d4f76d]"
              />
              <label htmlFor="isPublished" className="text-xs text-white font-medium">
                Publish immediately to Community Knowledge Hub
              </label>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#23232a]">
              <Link href="/admin/blogs">
                <button
                  type="button"
                  className="rounded-full border border-[#23232a] bg-[#1c1c22] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#23232a] transition-colors"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-full bg-[#d4f76d] px-6 py-2.5 text-xs font-bold text-black hover:bg-[#c4ea5c] transition-all disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                {submitting ? 'Publishing...' : 'Publish Article'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
