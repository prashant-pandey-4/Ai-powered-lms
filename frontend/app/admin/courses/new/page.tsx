'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { SkillUpHeader } from '@/components/skillup-header';
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  Video,
  ListVideo,
  Loader2,
  CheckCircle2,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Zap,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { MediaUpload } from '@/components/media-upload';
import { toast } from 'sonner';

const CATEGORIES = [
  'DSA & Algorithms',
  'Web Development',
  'System Design',
  'Backend & APIs',
  'AI & Machine Learning',
  'DevOps & Cloud',
];

interface LectureItem {
  title: string;
  videoUrl: string;
  duration?: number;
  durationFormatted?: string;
  description?: string;
}

export default function AdminNewCoursePage() {
  const router = useRouter();
  const { getToken } = useAuth();

  // 1. YouTube Quick Scraper input
  const [ytUrl, setYtUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [extractedCount, setExtractedCount] = useState<number | null>(null);

  // 2. Main Unified Course Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('DSA & Algorithms');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [thumbnail, setThumbnail] = useState('');
  const [lectures, setLectures] = useState<LectureItem[]>([]);
  const [singleVideoUrl, setSingleVideoUrl] = useState('');

  // 3. Submitting State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 4. Auto Extract from YouTube
  const handleExtractFromYouTube = async () => {
    if (!ytUrl.trim()) {
      toast.error('Kripya YouTube Video ya Playlist ka URL enter karein.');
      return;
    }

    setScraping(true);
    setErrorMessage('');
    try {
      const token = await getToken();
      const res = await fetchApi<any>('/courses/preview-playlist', {
        method: 'POST',
        token,
        body: JSON.stringify({ playlistUrl: ytUrl.trim() }),
      });

      if (res.success && res.data) {
        const data = res.data;
        setTitle(data.title || '');
        setDescription(
          `Master modern software engineering concepts in this comprehensive course with ${data.videoCount} video lesson${data.videoCount > 1 ? 's' : ''}.`
        );
        if (data.thumbnail) {
          setThumbnail(data.thumbnail);
        }

        // Set lectures
        if (Array.isArray(data.videos) && data.videos.length > 0) {
          const mapped: LectureItem[] = data.videos.map((v: any) => ({
            title: v.title,
            videoUrl: v.videoUrl,
            duration: v.duration || 600,
            durationFormatted: v.durationFormatted || '10:00',
            description: '',
          }));
          setLectures(mapped);
          if (mapped.length === 1) {
            setSingleVideoUrl(mapped[0].videoUrl);
          }
        }

        setExtractedCount(data.videoCount);
        toast.success(`Success! ${data.videoCount} video(s) extract ho gayi hain. Form auto-fill ho gaya!`);
      } else {
        toast.error(res.message || 'YouTube se video fetch nahi ho paya. URL check karein.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error connecting to YouTube extractor.');
    } finally {
      setScraping(false);
    }
  };

  // 5. One-Step Course & Video Creation + Auto-Publish
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Course Title likhna zaroori hai.');
      return;
    }
    if (!description.trim()) {
      toast.error('Description likhna zaroori hai.');
      return;
    }

    // Determine final lectures to attach
    let finalLectures: LectureItem[] = [...lectures];

    // If user provided a single video URL in the field but didn't extract via playlist
    if (finalLectures.length === 0 && singleVideoUrl.trim()) {
      finalLectures = [
        {
          title: title.trim(),
          videoUrl: singleVideoUrl.trim(),
          duration: 600,
          description: description.trim(),
        },
      ];
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const token = await getToken();
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        level,
        thumbnail: thumbnail.trim() || undefined,
        language: 'English / Hindi',
        isPublished: true, // Automatically publish live!
        lectures: finalLectures.map((l, idx) => ({
          title: l.title || `Episode ${idx + 1}`,
          videoUrl: l.videoUrl,
          duration: l.duration || 600,
          description: l.description || '',
          isFree: idx === 0,
        })),
      };

      const res = await fetchApi<any>('/courses', {
        method: 'POST',
        token,
        body: JSON.stringify(payload),
      });

      if (res.success && res.data) {
        toast.success('🎉 Course & Video successfully uploaded and published live!');
        router.push('/admin'); // Redirect straight to course manager
      } else {
        const errorDetail =
          res.message ||
          (res.errors
            ? Object.values(res.errors).flat().join(', ')
            : 'Course upload karne me error aaya.');
        setErrorMessage(errorDetail);
        toast.error(errorDetail);
      }
    } catch (err: any) {
      const msg = err.message || 'Server error occurred.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-app bg-grid-pattern">
      <SkillUpHeader title="Admin Studio &mdash; Video & Course Upload" />

      <div className="mx-auto w-full max-w-4xl p-6 lg:p-10 space-y-8">
        {/* Back Link & Title */}
        <div className="space-y-1.5 border-b border-app pb-5">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-[#f97316] transition-colors mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Courses Manager
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-app">
            Upload Video & Publish Course
          </h1>
          <p className="text-xs text-muted">
            YouTube video link paste karke extract karein, title/description review karein aur 1-click me publish karein.
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-red-800/50 bg-red-950/40 p-4 text-xs font-medium text-red-300">
            {errorMessage}
          </div>
        )}

        {/* STEP 1: Quick YouTube Video / Playlist Extractor */}
        <div className="rounded-3xl border border-[#f97316]/40 bg-gradient-to-br from-card to-card-2 p-6 sm:p-7 space-y-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white shadow-md shadow-[#f97316]/20 shrink-0">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-app flex items-center gap-2">
                1. YouTube Video ya Playlist Link Paste Karein
                <span className="rounded-md bg-[#f97316]/20 px-2 py-0.5 text-[9px] font-extrabold text-[#f97316]">
                  Auto-Fill
                </span>
              </h2>
              <p className="text-[11px] text-muted">
                Single Video URL ya Playlist URL paste karke &quot;Extract&quot; dabayein. Title, Description, Poster & Videos auto-fill ho jayenge.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <div className="relative flex-1">
              <ListVideo className="absolute left-3.5 top-3.5 h-4 w-4 text-muted pointer-events-none" />
              <input
                type="url"
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... ya playlist link"
                className="h-11 w-full rounded-2xl border border-app bg-app pl-10 pr-4 text-xs text-app placeholder:text-subtle focus:border-[#f97316] focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleExtractFromYouTube}
              disabled={scraping || !ytUrl.trim()}
              className="flex items-center justify-center gap-2 rounded-2xl glow-amber-btn px-6 py-2.5 text-xs font-bold text-white transition-all disabled:opacity-50 shrink-0"
            >
              {scraping ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Extract
                </>
              )}
            </button>
          </div>

          {extractedCount !== null && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                {extractedCount} video(s) extracted successfully! Niche diye gaye form me Title, Description aur Video check karein aur &quot;Upload & Publish&quot; karein.
              </span>
            </div>
          )}
        </div>

        {/* STEP 2: Unified Simple Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-3xl border border-app bg-card p-6 sm:p-8 space-y-5 shadow-xl">
            <h2 className="text-sm sm:text-base font-bold text-app border-b border-app pb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#f97316]" />
              2. Course Details & Video Content
            </h2>

            {/* Course Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-app">
                Course / Video Title <span className="text-[#f97316]">*</span>
              </label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete Backend & System Design Masterclass"
                className="h-11 w-full rounded-xl border border-app bg-app px-4 text-xs sm:text-sm text-app placeholder:text-subtle focus:border-[#f97316] focus:outline-none"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-app">
                Course Description <span className="text-[#f97316]">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what concepts are covered in this course/video..."
                className="w-full rounded-xl border border-app bg-app p-3 text-xs sm:text-sm text-app placeholder:text-subtle focus:border-[#f97316] focus:outline-none"
              />
            </div>

            {/* Direct Video Source URL (if manual or single video) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-app flex items-center justify-between">
                <span>Video Source URL (YouTube link ya Video Stream)</span>
                {lectures.length > 1 && (
                  <span className="text-[11px] font-bold text-[#f97316]">
                    ({lectures.length} Playlist Videos Attached)
                  </span>
                )}
              </label>
              <input
                type="url"
                value={lectures.length > 0 ? lectures[0].videoUrl : singleVideoUrl}
                onChange={(e) => {
                  setSingleVideoUrl(e.target.value);
                  if (lectures.length <= 1) {
                    setLectures([
                      {
                        title: title || 'Main Video Lecture',
                        videoUrl: e.target.value,
                        duration: 600,
                      },
                    ]);
                  }
                }}
                placeholder="https://www.youtube.com/watch?v=... (ya upar extract karein)"
                className="h-11 w-full rounded-xl border border-app bg-app px-4 text-xs sm:text-sm text-app placeholder:text-subtle focus:border-[#f97316] focus:outline-none"
              />
            </div>

            {/* Category & Level Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-app">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-11 w-full rounded-xl border border-app bg-app px-3.5 text-xs text-app focus:border-[#f97316] focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-app">Difficulty Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="h-11 w-full rounded-xl border border-app bg-app px-3.5 text-xs text-app focus:border-[#f97316] focus:outline-none"
                >
                  <option value="beginner">Beginner Level</option>
                  <option value="intermediate">Intermediate Level</option>
                  <option value="advanced">Advanced Level</option>
                </select>
              </div>
            </div>

            {/* Thumbnail Poster */}
            <div className="space-y-2 pt-2">
              <MediaUpload
                accept="image"
                label="Course Thumbnail / Poster (Auto-Extracted from YouTube or Custom Upload)"
                placeholder="https://img.youtube.com/..."
                value={thumbnail}
                onChange={(url) => setThumbnail(url)}
                helperText="YouTube video thumbnail auto-extract ho jata hai. Aap custom poster bhi upload kar sakte hain."
              />
            </div>

            {/* Extracted Playlist Lessons Preview (if multiple) */}
            {lectures.length > 1 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-app">
                  Playlist Episodes ({lectures.length} Total Lessons)
                </p>
                <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-xl border border-app bg-card-2 p-3">
                  {lectures.map((l, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-app bg-card px-3 py-1.5 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[10px] text-[#f97316] font-bold">
                          #{String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="truncate text-app">{l.title}</span>
                      </div>
                      <span className="text-[10px] text-muted font-mono shrink-0 ml-2">
                        {l.durationFormatted || '10:00'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Big Single Action Upload & Publish Button */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <Link href="/admin" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full rounded-full border border-app bg-card-2 px-6 py-3 text-xs font-bold text-app hover:bg-[#22232a] transition-colors"
              >
                Cancel
              </button>
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-full glow-amber-btn px-8 py-3.5 text-xs sm:text-sm font-black text-white shadow-xl transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
