'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { SkillUpHeader } from '@/components/skillup-header';
import {
  ArrowLeft,
  Sparkles,
  Plus,
  RotateCcw,
  Newspaper,
  Calendar,
  Clock,
  Code2,
  Heading,
  Bold,
  Italic,
  Link2,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { MediaUpload } from '@/components/media-upload';
import { toast } from 'sonner';

const STORAGE_KEY = 'skillup_draft_new_blog';

const CATEGORIES = [
  'Web Development',
  'DSA & Algorithms',
  'System Design',
  'JavaScript & React',
  'Architecture & DevOps',
  'Career & Interviews',
];

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
  const { user } = useUser();

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
          toast.info('Restored your article draft from browser storage', {
            description: 'You can continue editing or clear it anytime.',
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

  // 3. Insert markdown helper snippet
  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('blog-content-area') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = formData.content.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;

    const newContent =
      formData.content.substring(0, start) +
      replacement +
      formData.content.substring(end);

    updateField('content', newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected.length || 4)
      );
    }, 50);
  };

  // 4. Clear draft
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
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}

        toast.success('Article published to Knowledge Hub!');
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
    <div className="flex min-h-screen flex-col bg-app bg-grid-pattern">
      <SkillUpHeader title="Admin Studio &mdash; Write Article" />

      <div className="mx-auto w-full max-w-7xl p-6 lg:p-10 space-y-8">
        {/* Studio Breadcrumb & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-app pb-6">
          <div className="space-y-1">
            <Link
              href="/admin/blogs"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-[#f97316] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Articles Management
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-app">Write Technical Article</h1>
            <p className="text-xs text-muted">
              Publish guides, architecture breakdowns, and system insights for your developer community.
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

        {/* 2-Column Editor Workspace */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Columns: Main Article Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Article Header & Summary */}
              <div className="rounded-3xl border border-app bg-card p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-app">
                    Article Title <span className="text-[#f97316]">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Building High-Throughput Event-Driven Microservices with Go & Kafka"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="h-11 w-full rounded-xl border border-app bg-app px-4 text-xs sm:text-sm text-app placeholder:text-subtle focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/50 focus:outline-none transition-all font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-app">
                    Brief Summary (1-2 sentences) <span className="text-[#f97316]">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Provide a concise takeaway explaining what problem this article solves..."
                    value={formData.summary}
                    onChange={(e) => updateField('summary', e.target.value)}
                    className="w-full rounded-xl border border-app bg-app p-3 text-xs sm:text-sm text-app placeholder:text-subtle focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/50 focus:outline-none transition-all leading-relaxed"
                  />
                </div>
              </div>

              {/* Cover Banner Upload */}
              <div className="rounded-3xl border border-app bg-card p-6 sm:p-8 space-y-4 shadow-xl">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f97316]/15 text-[#f97316]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-app">Article Cover Image</h3>
                    <p className="text-[11px] text-muted">Displayed on knowledge hub listings and social shares</p>
                  </div>
                </div>

                <MediaUpload
                  accept="image"
                  label="Upload 16:9 Banner (or paste link)"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.coverImage}
                  onChange={(url) => updateField('coverImage', url)}
                  helperText="Leave empty to use clean gradient fallback banner."
                />
              </div>

              {/* Markdown Content Editor with Toolbar */}
              <div className="rounded-3xl border border-app bg-card p-6 sm:p-8 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-app pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-app">Article Body (Markdown)</h3>
                    <p className="text-[11px] text-muted">Supports full GitHub-flavored markdown and code blocks</p>
                  </div>

                  {/* Formatting Toolbar */}
                  <div className="flex items-center gap-1 rounded-xl border border-app bg-app p-1 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => insertMarkdown('## ')}
                      className="rounded-lg p-1.5 text-muted hover:text-app hover:bg-card transition-colors"
                      title="Heading 2"
                    >
                      <Heading className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('**', '**')}
                      className="rounded-lg p-1.5 text-muted hover:text-app hover:bg-card transition-colors"
                      title="Bold"
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('*', '*')}
                      className="rounded-lg p-1.5 text-muted hover:text-app hover:bg-card transition-colors"
                      title="Italic"
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('```typescript\n', '\n```')}
                      className="rounded-lg p-1.5 text-muted hover:text-app hover:bg-card transition-colors"
                      title="Code Block"
                    >
                      <Code2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('[', '](https://...)')}
                      className="rounded-lg p-1.5 text-muted hover:text-app hover:bg-card transition-colors"
                      title="Link"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <textarea
                  id="blog-content-area"
                  required
                  rows={14}
                  placeholder="## Introduction&#10;&#10;Write your deep-dive tutorial or guide here...&#10;&#10;```typescript&#10;export async function processQueue() { ... }&#10;```"
                  value={formData.content}
                  onChange={(e) => updateField('content', e.target.value)}
                  className="w-full rounded-2xl border border-app bg-app p-4 text-xs sm:text-sm font-mono text-app placeholder:text-subtle focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/50 focus:outline-none transition-all leading-relaxed resize-y"
                />

                <div className="flex items-center justify-between text-[10px] text-muted">
                  <span>Markdown syntax active</span>
                  <span>{formData.content.length} characters &bull; ~{Math.ceil((formData.content.split(/\s+/).length || 1) / 200)} min read</span>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Inspector & Live Real-Time Blog Card Preview */}
            <div className="lg:col-span-5 space-y-6 sticky top-24">
              {/* Live Blog Card Preview */}
              <div className="rounded-3xl border border-app bg-card p-5 space-y-3.5 shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#f97316]" /> Live Public Preview
                  </p>
                  <span className="rounded-full bg-[#f97316]/10 px-2 py-0.5 text-[9px] font-extrabold text-[#f97316]">
                    Knowledge Hub
                  </span>
                </div>

                {/* Real-time Rendered Blog Card */}
                <div className="overflow-hidden rounded-2xl border border-app bg-card-2 p-3 transition-all">
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-app">
                    {formData.coverImage ? (
                      <img
                        src={formData.coverImage}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-card">
                        <Newspaper className="h-8 w-8 text-subtle" />
                      </div>
                    )}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-bold text-[#f97316] backdrop-blur-md border border-[#f97316]/20">
                        {formData.category}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[#f97316]" /> {formData.readTime} min read
                      </span>
                      <span>Published Today</span>
                    </div>

                    <h4 className="text-sm font-bold text-app line-clamp-2">
                      {formData.title || 'Your Article Title Will Appear Here'}
                    </h4>

                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                      {formData.summary || 'Summary description highlighting the core takeaways for developers.'}
                    </p>

                    <div className="mt-2 pt-2.5 flex items-center justify-between border-t border-app">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-[#f97316]/20 flex items-center justify-center text-[10px] font-bold text-[#f97316]">
                          {(user?.firstName || 'A').charAt(0)}
                        </div>
                        <span className="text-[11px] font-medium text-app truncate max-w-[120px]">
                          {user?.fullName || 'Admin Author'}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-app flex items-center gap-1">
                        Read Guide &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Taxonomy & Publishing Settings */}
              <div className="rounded-3xl border border-app bg-card p-6 space-y-5 shadow-xl">
                <h3 className="text-sm font-bold text-app">Article Settings</h3>

                {/* Category Selection */}
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

                {/* Reading Time */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-app">Estimated Read Time (minutes)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={formData.readTime}
                    onChange={(e) => updateField('readTime', e.target.value)}
                    className="h-10 w-full rounded-xl border border-app bg-app px-3.5 text-xs text-app focus:border-[#f97316] focus:outline-none transition-colors"
                  />
                </div>

                {/* Tags Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-app">Tags (comma separated)</label>
                  <input
                    placeholder="e.g. nextjs, react, typescript, performance"
                    value={formData.tagsInput}
                    onChange={(e) => updateField('tagsInput', e.target.value)}
                    className="h-10 w-full rounded-xl border border-app bg-app px-3.5 text-xs text-app focus:border-[#f97316] focus:outline-none transition-colors"
                  />
                </div>

                {/* Publish Toggle */}
                <div className="flex items-center justify-between rounded-2xl border border-app bg-card-2 p-3.5">
                  <div>
                    <p className="text-xs font-bold text-app">Publish Status</p>
                    <p className="text-[10px] text-muted">Make article public immediately</p>
                  </div>
                  <input
                    type="checkbox"
                    id="isPublishedToggle"
                    checked={formData.isPublished}
                    onChange={(e) => updateField('isPublished', e.target.checked)}
                    className="h-5 w-5 rounded accent-[#f97316] cursor-pointer"
                  />
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl glow-amber-btn py-3.5 text-xs sm:text-sm font-bold text-white transition-all disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    {submitting ? 'Publishing Article...' : formData.isPublished ? 'Publish to Knowledge Hub' : 'Save as Draft'}
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
