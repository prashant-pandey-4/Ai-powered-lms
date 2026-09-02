'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { SkillUpHeader } from '@/components/skillup-header';
import {
  ArrowLeft,
  Plus,
  Sparkles,
  RotateCcw,
  BookOpen,
  Star,
  Play,
  Layers,
  CheckCircle2,
  HelpCircle,
  Clock,
  Compass,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { MediaUpload } from '@/components/media-upload';
import { toast } from 'sonner';

const STORAGE_KEY = 'skillup_draft_new_course';

const CATEGORIES = [
  'DSA & Algorithms',
  'Web Development',
  'System Design',
  'Backend & APIs',
  'AI & Machine Learning',
  'DevOps & Cloud',
];

const initialForm = {
  title: '',
  description: '',
  category: 'DSA & Algorithms',
  level: 'beginner',
  thumbnail: '',
  language: 'English / Hindi',
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
          toast.info('Restored your course draft from browser storage', {
            description: 'You can continue editing or clear it anytime.',
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
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}

        toast.success('Course created! Now add your video syllabus.');
        router.push(`/admin/courses/${res.data.id}/edit`);
      } else {
        const errorDetail =
          res.message ||
          (res.errors
            ? Object.values(res.errors).flat().join(', ')
            : 'Failed to create course. Please verify required fields.');
        setErrorMessage(errorDetail);
        toast.error(errorDetail);
      }
    } catch (err: any) {
      const msg = err.message || 'An error occurred while creating course';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-app bg-grid-pattern">
      <SkillUpHeader title="Admin Studio &mdash; Create Course" />

      <div className="mx-auto w-full max-w-7xl p-6 lg:p-10 space-y-8">
        {/* Studio Breadcrumb & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-app pb-6">
          <div className="space-y-1">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-[#f97316] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Studio Overview
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-app">Create Engineering Course</h1>
            <p className="text-xs text-muted">
              Configure course overview, curriculum tags, and poster with real-time public preview.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasDraft && (
              <button
                type="button"
                onClick={handleClearDraft}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Draft
              </button>
            )}

            <div className="flex items-center gap-2 rounded-full border border-app bg-card px-3.5 py-1.5 text-xs font-medium text-muted">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Draft Auto-Saved</span>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-red-800/50 bg-red-950/40 p-4 text-xs font-medium text-red-300">
            {errorMessage}
          </div>
        )}

        {/* 2-Column Studio Grid */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Columns: Core Editor Fields */}
            <div className="lg:col-span-7 space-y-6">
              {/* Section 1: Course Identity */}
              <div className="rounded-3xl border border-app bg-card p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f97316]/15 text-[#f97316]">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-app">Course Basics</h3>
                      <p className="text-[11px] text-muted">Primary title and overview description</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#f97316] bg-[#f97316]/10 px-2 py-0.5 rounded-full">
                    Required
                  </span>
                </div>

                {/* Course Title */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-app">
                    Course Title <span className="text-[#f97316]">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Striver's A2Z DSA Sheet: Master Data Structures & Algorithms"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="h-11 w-full rounded-xl border border-app bg-app px-4 text-xs sm:text-sm text-app placeholder:text-subtle focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/50 focus:outline-none transition-all"
                  />
                  <p className="text-[10px] text-muted">
                    Clear, descriptive title highlighting the core language and practical roadmap.
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-app">
                    Comprehensive Description <span className="text-[#f97316]">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide a comprehensive summary of what students will build, key milestones, interview patterns, and prerequisites..."
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    className="w-full rounded-2xl border border-app bg-app p-4 text-xs sm:text-sm text-app placeholder:text-subtle focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/50 focus:outline-none transition-all leading-relaxed"
                  />
                  <div className="flex justify-between text-[10px] text-muted">
                    <span>Supports multi-line text and highlights.</span>
                    <span>{formData.description.length} characters</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Poster & Thumbnail Asset */}
              <div className="rounded-3xl border border-app bg-card p-6 sm:p-8 space-y-5 shadow-xl">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f59e0b]/15 text-[#f59e0b]">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-app">Cover Poster / Thumbnail</h3>
                    <p className="text-[11px] text-muted">High-res 16:9 banner with CDN delivery</p>
                  </div>
                </div>

                <MediaUpload
                  accept="image"
                  label="Upload 16:9 Poster (or paste public image URL)"
                  placeholder="https://images.unsplash.com/... or Cloudinary link"
                  value={formData.thumbnail}
                  onChange={(url) => updateField('thumbnail', url)}
                  helperText="Recommended: 1280x720px JPG/PNG/WebP. If empty, the first YouTube lecture thumbnail will be auto-applied."
                />
              </div>
            </div>

            {/* Right 5 Columns: Inspector & Live Real-Time Card Preview */}
            <div className="lg:col-span-5 space-y-6 sticky top-24">
              {/* Live Card Preview Box */}
              <div className="rounded-3xl border border-app bg-card p-5 space-y-3.5 shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#f97316]" /> Live Public Preview
                  </p>
                  <span className="rounded-full bg-[#f97316]/10 px-2 py-0.5 text-[9px] font-extrabold text-[#f97316]">
                    Student View
                  </span>
                </div>

                {/* Real-time Rendered Course Card */}
                <div className="overflow-hidden rounded-2xl border border-app bg-card-2 p-3 transition-all">
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-app">
                    {formData.thumbnail ? (
                      <img
                        src={formData.thumbnail}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-card">
                        <BookOpen className="h-8 w-8 text-subtle" />
                      </div>
                    )}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-bold text-[#f97316] backdrop-blur-md border border-[#f97316]/20">
                        {formData.category || 'General'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-muted">
                      <span className="flex items-center gap-1 text-[#f59e0b] font-bold">
                        <Star className="h-3 w-3 fill-current" /> 4.9
                      </span>
                      <span className="capitalize">{formData.level} Level</span>
                      <span className="rounded bg-card px-1.5 py-0.5 text-[10px] text-muted">
                        {formData.language}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-app line-clamp-2">
                      {formData.title || 'Your Course Title Will Appear Here'}
                    </h4>

                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                      {formData.description || 'Provide a compelling description so learners understand the core concepts covered in this track.'}
                    </p>

                    <div className="mt-2 pt-2.5 flex items-center justify-between border-t border-app">
                      <span className="rounded-full bg-[#f97316]/10 px-2 py-0.5 text-[11px] font-extrabold text-[#f97316]">
                        100% Free
                      </span>
                      <span className="text-xs font-bold text-app flex items-center gap-1">
                        View Details &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Taxonomy & Metadata Settings */}
              <div className="rounded-3xl border border-app bg-card p-6 space-y-5 shadow-xl">
                <h3 className="text-sm font-bold text-app">Track Taxonomy & Settings</h3>

                {/* Category Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-app">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="h-10 w-full rounded-xl border border-app bg-app px-3.5 text-xs text-app focus:border-[#f97316] focus:outline-none transition-colors"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Level Pills */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-app">Difficulty Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['beginner', 'intermediate', 'advanced'].map((lvl) => {
                      const isSelected = formData.level === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => updateField('level', lvl)}
                          className={`rounded-xl py-2 text-xs font-bold capitalize transition-all ${
                            isSelected
                              ? 'bg-[#f97316] text-white shadow-md shadow-[#f97316]/20'
                              : 'border border-app bg-app text-muted hover:text-app'
                          }`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Language Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-app">Delivery Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => updateField('language', e.target.value)}
                    className="h-10 w-full rounded-xl border border-app bg-app px-3.5 text-xs text-app focus:border-[#f97316] focus:outline-none transition-colors"
                  >
                    <option value="English / Hindi">Bilingual (English / Hindi)</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl glow-amber-btn py-3.5 text-xs sm:text-sm font-bold text-white transition-all disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    {submitting ? 'Creating Track...' : 'Create Course & Add Lectures'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
