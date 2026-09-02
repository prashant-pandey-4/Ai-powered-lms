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
  Globe,
  Loader2,
  X,
  Zap,
  ExternalLink,
  BookOpen,
  Bookmark,
  Layers,
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
  'Backend & APIs',
  'Career & Interviews',
];

const initialForm = {
  title: '',
  summary: '',
  content: '',
  coverImage: '',
  category: 'Web Development',
  tagsInput: 'system-design, architecture, backend',
  readTime: '15',
  isPublished: true,
  resourceType: 'article' as 'article' | 'external_reference',
  externalUrl: '',
};

export default function AdminNewBlogPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();

  const [formData, setFormData] = useState(initialForm);
  const [hasDraft, setHasDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Scraper modal state
  const [showScrapeModal, setShowScrapeModal] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<any>(null);
  const [scrapeError, setScrapeError] = useState('');

  // 1. Restore saved draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title || parsed.summary || parsed.content || parsed.externalUrl) {
          setFormData((prev) => ({ ...prev, ...parsed }));
          setHasDraft(true);
          toast.info('Restored your draft from browser storage', {
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

  // 3. Quick Meta Fetch for External Reference Mode
  const handleAutoFetchMeta = async () => {
    if (!formData.externalUrl.trim()) {
      toast.error('Please enter an External Resource URL first.');
      return;
    }

    setFetchingMeta(true);
    try {
      const token = await getToken();
      const res = await fetchApi<any>('/scrape', {
        method: 'POST',
        token,
        body: JSON.stringify({ url: formData.externalUrl.trim() }),
      });

      if (res.success && res.data) {
        const d = res.data;
        setFormData((prev) => {
          const next = {
            ...prev,
            title: prev.title || d.title || '',
            summary: prev.summary || d.summary || '',
            coverImage: prev.coverImage || d.coverImage || '',
            tagsInput: prev.tagsInput || d.tags || '',
            readTime: String(d.readTime || prev.readTime),
          };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });
        toast.success('Auto-fetched title, cover image, and description from website!');
      } else {
        toast.error(res.message || 'Could not fetch metadata from URL.');
      }
    } catch {
      toast.error('Network error while fetching metadata.');
    } finally {
      setFetchingMeta(false);
    }
  };

  // 4. Markdown helper insert
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

  // 5. Scrape article from URL (Full Content Import)
  const handleScrape = async () => {
    if (!scrapeUrl.trim()) {
      setScrapeError('Please paste a valid article URL.');
      return;
    }

    setScraping(true);
    setScrapeError('');
    setScrapeResult(null);

    try {
      const token = await getToken();
      const res = await fetchApi<any>('/scrape', {
        method: 'POST',
        token,
        body: JSON.stringify({ url: scrapeUrl.trim() }),
      });

      if (res.success && res.data) {
        setScrapeResult(res.data);
        toast.success(`Extracted metadata and ${res.data.wordCount} words!`);
      } else {
        setScrapeError(res.message || 'Failed to scrape the URL.');
        toast.error(res.message || 'Scraping failed.');
      }
    } catch (err: any) {
      setScrapeError(err.message || 'Network error during scraping.');
      toast.error('Could not reach the scraping API.');
    } finally {
      setScraping(false);
    }
  };

  // 6. Apply scraped data to form
  const applyScrapeToForm = () => {
    if (!scrapeResult) return;

    const updates: Record<string, any> = {};

    if (scrapeResult.title) updates.title = scrapeResult.title;
    if (scrapeResult.summary) updates.summary = scrapeResult.summary;
    if (scrapeResult.content) updates.content = scrapeResult.content;
    if (scrapeResult.coverImage) updates.coverImage = scrapeResult.coverImage;
    if (scrapeResult.tags) updates.tagsInput = scrapeResult.tags;
    if (scrapeResult.readTime) updates.readTime = String(scrapeResult.readTime);

    if (scrapeResult.category) {
      const match = CATEGORIES.find(
        (c) => c.toLowerCase().includes(scrapeResult.category.toLowerCase())
      );
      if (match) updates.category = match;
    }

    setFormData((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    setShowScrapeModal(false);
    setScrapeResult(null);
    setScrapeUrl('');
    toast.success('Applied to article editor!');
  };

  // 7. Clear draft
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
        content: formData.content || (formData.resourceType === 'external_reference' ? formData.summary : ''),
        coverImage: formData.coverImage,
        category: formData.category,
        tags,
        readTime: parseInt(formData.readTime, 10) || 5,
        isPublished: formData.isPublished,
        resourceType: formData.resourceType,
        externalUrl: formData.resourceType === 'external_reference' ? formData.externalUrl : null,
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

        toast.success(
          formData.resourceType === 'external_reference'
            ? 'Curated reference added to Knowledge Hub!'
            : 'Article published to Knowledge Hub!'
        );
        router.push('/admin/blogs');
      } else {
        const errorDetail =
          res.message ||
          (res.errors
            ? Object.values(res.errors).flat().join(', ')
            : 'Failed to create resource. Please verify fields.');
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
      <SkillUpHeader title="Admin Studio &mdash; Knowledge Hub Publisher" />

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
            <h1 className="text-2xl sm:text-3xl font-black text-app">Publish Engineering Resource</h1>
            <p className="text-xs text-muted">
              Publish native tutorials or curate interactive external references & official books for students.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {formData.resourceType === 'article' && (
              <button
                type="button"
                onClick={() => setShowScrapeModal(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#f97316]/40 bg-[#f97316]/10 px-3.5 py-1.5 text-xs font-bold text-[#f97316] hover:bg-[#f97316]/20 transition-colors"
              >
                <Globe className="h-3.5 w-3.5" />
                Scrape from URL
              </button>
            )}

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

        {/* ── Mode Selection Tabs: In-House Guide vs Curated External Reference ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => updateField('resourceType', 'article')}
            className={`flex items-start gap-4 rounded-3xl p-5 border text-left transition-all ${
              formData.resourceType === 'article'
                ? 'border-[#f97316] bg-gradient-to-br from-[#f97316]/15 via-[#f97316]/5 to-transparent shadow-lg shadow-[#f97316]/10'
                : 'border-app bg-card hover:border-[#f97316]/40'
            }`}
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                formData.resourceType === 'article'
                  ? 'bg-[#f97316] text-white shadow-md'
                  : 'bg-card-2 text-muted border border-app'
              }`}
            >
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-app">Native In-House Article</h3>
                {formData.resourceType === 'article' && (
                  <span className="rounded-full bg-[#f97316] px-2 py-0.5 text-[9px] font-extrabold text-white">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Write comprehensive markdown guides, code snippets, and tutorials rendered inside the SkillUP 3-column reader.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => updateField('resourceType', 'external_reference')}
            className={`flex items-start gap-4 rounded-3xl p-5 border text-left transition-all ${
              formData.resourceType === 'external_reference'
                ? 'border-[#f97316] bg-gradient-to-br from-[#f97316]/15 via-[#f97316]/5 to-transparent shadow-lg shadow-[#f97316]/10'
                : 'border-app bg-card hover:border-[#f97316]/40'
            }`}
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                formData.resourceType === 'external_reference'
                  ? 'bg-[#f97316] text-white shadow-md'
                  : 'bg-card-2 text-muted border border-app'
              }`}
            >
              <ExternalLink className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-app">Curated External Reference / Book</h3>
                {formData.resourceType === 'external_reference' && (
                  <span className="rounded-full bg-[#f97316] px-2 py-0.5 text-[9px] font-extrabold text-white">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Curate high-value interactive books (e.g. <em>Backend from First Principles</em>, <em>Striver SDE Sheet</em>, <em>React Docs</em>) with direct link navigation.
              </p>
            </div>
          </button>
        </div>

        {/* ── Scrape Full Modal ── */}
        {showScrapeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-app bg-card shadow-2xl flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between border-b border-app p-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f97316]/15 text-[#f97316]">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-app flex items-center gap-2">
                      Scrape Article into In-House Form
                    </h3>
                    <p className="text-[11px] text-muted">
                      Extracts title, body, cover image and converts HTML to Markdown
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowScrapeModal(false); setScrapeResult(null); setScrapeError(''); }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-card-2 hover:text-app transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-app">Article URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={scrapeUrl}
                      onChange={(e) => setScrapeUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleScrape())}
                      className="h-10 flex-1 rounded-xl border border-app bg-app px-3.5 text-xs text-app placeholder:text-subtle focus:border-[#f97316] focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleScrape}
                      disabled={scraping || !scrapeUrl.trim()}
                      className="flex items-center gap-1.5 rounded-xl glow-amber-btn px-4 py-2 text-xs font-bold text-white transition-all disabled:opacity-50 shrink-0"
                    >
                      {scraping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                      {scraping ? 'Extracting...' : 'Extract'}
                    </button>
                  </div>
                </div>

                {scrapeError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-400">
                    {scrapeError}
                  </div>
                )}

                {scrapeResult && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Extracted {scrapeResult.wordCount} words!
                    </div>
                    <div className="rounded-2xl border border-app bg-card-2 p-4 space-y-2">
                      <h4 className="text-sm font-bold text-app">{scrapeResult.title}</h4>
                      <p className="text-xs text-muted line-clamp-2">{scrapeResult.summary}</p>
                    </div>
                    <button
                      type="button"
                      onClick={applyScrapeToForm}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl glow-amber-btn py-3 text-xs font-bold text-white transition-all"
                    >
                      <Sparkles className="h-4 w-4" />
                      Apply to Article Editor
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-2xl border border-red-800/50 bg-red-950/40 p-4 text-xs font-medium text-red-300">
            {errorMessage}
          </div>
        )}

        {/* 2-Column Editor Workspace */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Columns: Main Form Fields */}
            <div className="lg:col-span-7 space-y-6">
              {/* If External Reference: Prominent Link Box */}
              {formData.resourceType === 'external_reference' && (
                <div className="rounded-3xl border border-[#f97316]/40 bg-gradient-to-b from-[#f97316]/10 via-card to-card p-6 sm:p-8 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f97316] text-white shadow-sm">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-app">External Destination URL</h3>
                        <p className="text-[11px] text-muted">Direct interactive reference link</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-app">
                      Resource URL <span className="text-[#f97316]">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        required
                        type="url"
                        placeholder="e.g. https://backend-from-first-principle.vercel.app/index.html"
                        value={formData.externalUrl}
                        onChange={(e) => updateField('externalUrl', e.target.value)}
                        className="h-11 flex-1 rounded-xl border border-app bg-app px-4 text-xs sm:text-sm text-app placeholder:text-subtle focus:border-[#f97316] focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleAutoFetchMeta}
                        disabled={fetchingMeta || !formData.externalUrl.trim()}
                        className="flex items-center gap-1.5 rounded-xl glow-amber-btn px-4 py-2 text-xs font-bold text-white transition-all disabled:opacity-50 shrink-0"
                      >
                        {fetchingMeta ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                        {fetchingMeta ? 'Fetching...' : 'Auto-Fetch Meta'}
                      </button>
                    </div>
                    <p className="text-[10px] text-muted">
                      Paste the link and click <strong>Auto-Fetch Meta</strong> to auto-populate Title, Cover Banner, and Summary!
                    </p>
                  </div>
                </div>
              )}

              {/* Title & Summary */}
              <div className="rounded-3xl border border-app bg-card p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-app">
                    {formData.resourceType === 'external_reference' ? 'Resource / Book Title' : 'Article Title'}{' '}
                    <span className="text-[#f97316]">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder={
                      formData.resourceType === 'external_reference'
                        ? 'e.g. Backend from First Principles: A 24-Chapter Engineering Reference'
                        : 'e.g. Building High-Throughput Event-Driven Microservices with Go & Kafka'
                    }
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="h-11 w-full rounded-xl border border-app bg-app px-4 text-xs sm:text-sm text-app placeholder:text-subtle focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/50 focus:outline-none transition-all font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-app">
                    Brief Summary / Overview <span className="text-[#f97316]">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide a comprehensive summary of what developers will learn from this guide/reference..."
                    value={formData.summary}
                    onChange={(e) => updateField('summary', e.target.value)}
                    className="w-full rounded-xl border border-app bg-app p-3.5 text-xs sm:text-sm text-app placeholder:text-subtle focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/50 focus:outline-none transition-all leading-relaxed"
                  />
                </div>
              </div>

              {/* Cover Banner Upload */}
              <div className="rounded-3xl border border-app bg-card p-6 sm:p-8 space-y-4 shadow-xl">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f97316]/15 text-[#f97316]">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-app">Cover Poster / Banner</h3>
                    <p className="text-[11px] text-muted">Displayed on knowledge hub listings and social cards</p>
                  </div>
                </div>

                <MediaUpload
                  accept="image"
                  label="Upload 16:9 Banner (or paste link)"
                  placeholder="https://..."
                  value={formData.coverImage}
                  onChange={(url) => updateField('coverImage', url)}
                  helperText="Leave empty to use clean gradient fallback."
                />
              </div>

              {/* Native Markdown Body Editor (Only if article mode) */}
              {formData.resourceType === 'article' && (
                <div className="rounded-3xl border border-app bg-card p-6 sm:p-8 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-app pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-app">Article Body (Markdown)</h3>
                      <p className="text-[11px] text-muted">Supports headings, code blocks, and callout alerts</p>
                    </div>

                    {/* Toolbar */}
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
                    required={formData.resourceType === 'article'}
                    rows={14}
                    placeholder="## Introduction&#10;&#10;Write your deep-dive tutorial or guide here...&#10;&#10;```typescript&#10;export async function processQueue() { ... }&#10;```"
                    value={formData.content}
                    onChange={(e) => updateField('content', e.target.value)}
                    className="w-full rounded-2xl border border-app bg-app p-4 text-xs sm:text-sm font-mono text-app placeholder:text-subtle focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/50 focus:outline-none transition-all leading-relaxed resize-y"
                  />

                  <div className="flex items-center justify-between text-[10px] text-muted">
                    <span>Markdown syntax active</span>
                    <span>
                      {formData.content.length} characters &bull; ~
                      {Math.ceil((formData.content.split(/\s+/).length || 1) / 200)} min read
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right 5 Columns: Inspector & Live Real-Time Blog Card Preview */}
            <div className="lg:col-span-5 space-y-6 sticky top-24">
              {/* Live Public Card Preview */}
              <div className="rounded-3xl border border-app bg-card p-5 space-y-3.5 shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#f97316]" /> Live Public Preview
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold ${
                      formData.resourceType === 'external_reference'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-[#f97316]/10 text-[#f97316]'
                    }`}
                  >
                    {formData.resourceType === 'external_reference' ? 'Interactive Reference ↗' : 'In-House Guide'}
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

                    {formData.resourceType === 'external_reference' && (
                      <div className="absolute top-2.5 right-2.5">
                        <span className="rounded-md bg-purple-950/90 px-2 py-0.5 text-[9px] font-extrabold text-purple-300 backdrop-blur-md border border-purple-500/40 flex items-center gap-1">
                          <ExternalLink className="h-2.5 w-2.5" /> Book / Docs
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[#f97316]" /> {formData.readTime} min read
                      </span>
                      <span>Published Today</span>
                    </div>

                    <h4 className="text-sm font-bold text-app line-clamp-2">
                      {formData.title || 'Your Title Will Appear Here'}
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
                        {formData.resourceType === 'external_reference' ? 'Open Reference ↗' : 'Read Guide →'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Taxonomy & Publishing Settings */}
              <div className="rounded-3xl border border-app bg-card p-6 space-y-5 shadow-xl">
                <h3 className="text-sm font-bold text-app">Resource Settings</h3>

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

                {/* Estimated Reading Time / Chapters */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-app">
                    {formData.resourceType === 'external_reference' ? 'Estimated Total Time / Chapters (mins)' : 'Estimated Read Time (minutes)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={formData.readTime}
                    onChange={(e) => updateField('readTime', e.target.value)}
                    className="h-10 w-full rounded-xl border border-app bg-app px-3.5 text-xs text-app focus:border-[#f97316] focus:outline-none transition-colors"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-app">Tags (comma separated)</label>
                  <input
                    placeholder="e.g. system-design, backend, kafka, architecture"
                    value={formData.tagsInput}
                    onChange={(e) => updateField('tagsInput', e.target.value)}
                    className="h-10 w-full rounded-xl border border-app bg-app px-3.5 text-xs text-app focus:border-[#f97316] focus:outline-none transition-colors"
                  />
                </div>

                {/* Publish Toggle */}
                <div className="flex items-center justify-between rounded-2xl border border-app bg-card-2 p-3.5">
                  <div>
                    <p className="text-xs font-bold text-app">Publish Status</p>
                    <p className="text-[10px] text-muted">Make publicly visible immediately</p>
                  </div>
                  <input
                    type="checkbox"
                    id="isPublishedToggle"
                    checked={formData.isPublished}
                    onChange={(e) => updateField('isPublished', e.target.checked)}
                    className="h-5 w-5 rounded accent-[#f97316] cursor-pointer"
                  />
                </div>

                {/* Primary Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl glow-amber-btn py-3.5 text-xs sm:text-sm font-bold text-white transition-all disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    {submitting
                      ? 'Publishing...'
                      : formData.resourceType === 'external_reference'
                      ? 'Curate & Publish Reference'
                      : 'Publish Article'}
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
