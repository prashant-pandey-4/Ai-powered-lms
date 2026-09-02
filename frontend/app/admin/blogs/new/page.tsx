'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { SkillUpHeader } from '@/components/skillup-header';
import { ArrowLeft, Sparkles, Plus, RotateCcw } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { MediaUpload } from '@/components/media-upload';
import { toast } from 'sonner';

const STORAGE_KEY = 'skillup_draft_new_blog';

const initialForm = {
  title: '',
  summary: '',
  content: '',
  coverImage: '',
  category: 'Web Development',
  tagsInput: 'nextjs, react, typescript',
  readTime: '5',
  isPublished: true,
};

export default function AdminNewBlogPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [formData, setFormData] = useState(initialForm);
  const [hasDraft, setHasDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Restore saved draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title || parsed.summary || parsed.content) {
          setFormData((prev) => ({ ...prev, ...parsed }));
          setHasDraft(true);
          toast.info('Restored your unsaved article draft!', {
            description: 'You can continue editing or clear it to start over.',
          });
        }
      }
    } catch {}
  }, []);

  // 2. Auto-save form changes
  const updateField = (field: string, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // 3. Clear draft
  const handleClearDraft = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setFormData(initialForm);
    setHasDraft(false);
    toast.success('Draft cleared. Form reset to fresh state.');
  };

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
        // Clear saved draft on success
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}

        toast.success('Article published successfully!');
        router.push('/admin/blogs');
      } else {
        const errorDetail =
          res.message ||
          (res.errors
            ? Object.values(res.errors).flat().join(', ')
            : 'Failed to create article. Please verify fields.');
        setErrorMessage(errorDetail);
        toast.error(errorDetail);
      }
    } catch (err: any) {
      const msg = err.message || 'An error occurred';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-app">
      <SkillUpHeader title="Admin Studio â€” Write Article" />

      <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/admin/blogs"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-[#d4f76d] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Articles Management
          </Link>

          {hasDraft && (
            <button
              type="button"
              onClick={handleClearDraft}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-800/40 bg-red-950/20 px-3 py-1 text-[11px] font-semibold text-red-300 hover:bg-red-950/40 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Clear Restored Draft
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-app bg-card p-6 lg:p-8 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Create Knowledge Article
                <span className="rounded-full bg-[#d4f76d]/10 px-2 py-0.5 text-[9px] font-extrabold text-[#d4f76d]">
                  Auto-Saved
                </span>
              </h2>
              <p className="mt-1 text-xs text-muted">
                Publish tutorials, guides, and engineering insights for your community. Drafts are safely cached in browser.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-800/50 bg-red-950/40 p-3 text-xs text-red-300">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted">
                Article Title <span className="text-[#d4f76d]">*</span>
              </label>
              <input
                required
                placeholder="e.g. Building High-Performance Microservices with Go & Kafka"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="h-10 w-full rounded-xl border border-app bg-app px-3.5 text-xs text-white placeholder:text-subtle focus:border-[#d4f76d] focus:outline-none"
              />
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted">
                Short Summary (1-2 sentences) <span className="text-[#d4f76d]">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="Brief takeaway explaining what readers will learn..."
                value={formData.summary}
                onChange={(e) => updateField('summary', e.target.value)}
                className="w-full rounded-xl border border-app bg-app p-3 text-xs text-white placeholder:text-subtle focus:border-[#d4f76d] focus:outline-none"
              />
            </div>

            {/* Cover Image */}
            <MediaUpload
              accept="image"
              label="Article Banner / Cover Image"
              placeholder="https://images.unsplash.com/..."
              value={formData.coverImage}
              onChange={(url) => updateField('coverImage', url)}
              helperText="Upload JPG/PNG cover image or paste an external image link."
            />

            {/* Category, Read Time, Tags */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted">Category</label>
                <input
                  placeholder="e.g. System Design, AI"
                  value={formData.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="h-10 w-full rounded-xl border border-app bg-app px-3.5 text-xs text-white placeholder:text-subtle focus:border-[#d4f76d] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted">Reading Time (Mins)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="5"
                  value={formData.readTime}
                  onChange={(e) => updateField('readTime', e.target.value)}
                  className="h-10 w-full rounded-xl border border-app bg-app px-3.5 text-xs text-white placeholder:text-subtle focus:border-[#d4f76d] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted">Tags (comma separated)</label>
                <input
                  placeholder="react, api, scaling"
                  value={formData.tagsInput}
                  onChange={(e) => updateField('tagsInput', e.target.value)}
                  className="h-10 w-full rounded-xl border border-app bg-app px-3.5 text-xs text-white placeholder:text-subtle focus:border-[#d4f76d] focus:outline-none"
                />
              </div>
            </div>

            {/* Content Body */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted">
                Article Content (Supports Markdown & paragraphs) <span className="text-[#d4f76d]">*</span>
              </label>
              <textarea
                required
                rows={12}
                placeholder="Write your article content here..."
                value={formData.content}
                onChange={(e) => updateField('content', e.target.value)}
                className="w-full rounded-xl border border-app bg-app p-4 text-xs font-mono text-white placeholder:text-subtle focus:border-[#d4f76d] focus:outline-none"
              />
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) => updateField('isPublished', e.target.checked)}
                className="h-4 w-4 rounded accent-[#d4f76d]"
              />
              <label htmlFor="isPublished" className="text-xs text-white font-medium">
                Publish immediately to Community Knowledge Hub
              </label>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between pt-4 border-t border-app">
              <span className="text-[11px] text-muted flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#d4f76d]" />
                Auto-saved in browser
              </span>

              <div className="flex items-center gap-3">
                <Link href="/admin/blogs">
                  <button
                    type="button"
                    className="rounded-full border border-app bg-card-2 px-5 py-2.5 text-xs font-bold text-white hover:bg-card-2 transition-colors"
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
