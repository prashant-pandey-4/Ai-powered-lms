'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { SkillUpHeader } from '@/components/skillup-header';
import { ArrowLeft, Plus, Sparkles, RotateCcw } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { MediaUpload } from '@/components/media-upload';
import { toast } from 'sonner';

const STORAGE_KEY = 'skillup_draft_new_course';

const initialForm = {
  title: '',
  description: '',
  category: 'Web Development',
  level: 'beginner',
  thumbnail: '',
  language: 'English',
};

export default function AdminNewCoursePage() {
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
        if (parsed.title || parsed.description || parsed.thumbnail) {
          setFormData((prev) => ({ ...prev, ...parsed }));
          setHasDraft(true);
          toast.info('Restored your unsaved course draft!', {
            description: 'You can continue editing or clear it to start over.',
          });
        }
      }
    } catch {
      // ignore JSON parse error
    }
  }, []);

  // 2. Auto-save form changes to localStorage
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
      const payload = { ...formData };

      const res = await fetchApi<any>('/courses', {
        method: 'POST',
        token,
        body: JSON.stringify(payload),
      });

      if (res.success && res.data) {
        // Clear saved draft on success
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}

        toast.success('Course created! Now you can add lectures.');
        router.push(`/admin/courses/${res.data.id}/edit`);
      } else {
        const errorDetail =
          res.message ||
          (res.errors
            ? Object.values(res.errors).flat().join(', ')
            : 'Failed to create course. Please check fields.');
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
      <SkillUpHeader title="Admin Studio â€” Create Course" />

      <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-[#d4f76d] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Studio Overview
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
              <h2 className="text-lg font-bold text-app flex items-center gap-2">
                Course Overview & Metadata
                <span className="rounded-full bg-[#d4f76d]/10 px-2 py-0.5 text-[9px] font-extrabold text-[#d4f76d]">
                  Auto-Saved
                </span>
              </h2>
              <p className="mt-1 text-xs text-muted">
                Fields auto-save locally so you won&apos;t lose progress if you refresh or close the tab.
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
                Course Title <span className="text-[#d4f76d]">*</span>
              </label>
              <input
                required
                placeholder="e.g. Data Structures & Algorithms with C++"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="h-10 w-full rounded-xl border border-app bg-app px-3.5 text-xs text-app placeholder:text-subtle focus:border-[#d4f76d] focus:outline-none"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted">
                Description <span className="text-[#d4f76d]">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Provide a comprehensive summary of the practical skills students will master..."
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full rounded-xl border border-app bg-app p-3 text-xs text-app placeholder:text-subtle focus:border-[#d4f76d] focus:outline-none"
              />
            </div>

            {/* Category & Level */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted">Category</label>
                <input
                  placeholder="e.g. DSA, Web Development, AI & ML"
                  value={formData.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="h-10 w-full rounded-xl border border-app bg-app px-3.5 text-xs text-app placeholder:text-subtle focus:border-[#d4f76d] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted">Difficulty Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => updateField('level', e.target.value)}
                  className="h-10 w-full rounded-xl border border-app bg-app px-3 text-xs text-app focus:border-[#d4f76d] focus:outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Course Thumbnail Upload */}
            <MediaUpload
              accept="image"
              label="Course Poster / Thumbnail Image"
              placeholder="https://images.unsplash.com/..."
              value={formData.thumbnail}
              onChange={(url) => updateField('thumbnail', url)}
              helperText="Upload JPG, PNG or WebP file directly, paste a link, or leave blank to auto-use 1st YouTube video thumbnail."
            />

            {/* Submit */}
            <div className="flex items-center justify-between pt-4 border-t border-app">
              <span className="text-[11px] text-muted flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#d4f76d]" />
                Auto-saved in browser
              </span>

              <div className="flex items-center gap-3">
                <Link href="/admin">
                  <button
                    type="button"
                    className="rounded-full border border-app bg-card-2 px-5 py-2.5 text-xs font-bold text-app hover:bg-card-2 transition-colors"
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
                  {submitting ? 'Creating Course...' : 'Continue to Add Lectures'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
