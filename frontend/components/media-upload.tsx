'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  UploadCloud,
  Link as LinkIcon,
  Check,
  X,
  FileText,
  Video,
  Image as ImageIcon,
  Loader2,
  Play,
} from 'lucide-react';

interface MediaUploadProps {
  value: string;
  onChange: (url: string) => void;
  onThumbnailExtracted?: (thumbnailUrl: string) => void; // optional callback when YT thumb is detected
  accept?: 'image' | 'video' | 'pdf' | 'all';
  label?: string;
  placeholder?: string;
  helperText?: string;
}

// ─── YouTube helpers ──────────────────────────────────────────────────────────

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

/** Returns the best available YouTube thumbnail URL for a video ID */
function ytThumbnail(videoId: string, quality: 'max' | 'hq' = 'max'): string {
  return quality === 'max'
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

// ─────────────────────────────────────────────────────────────────────────────

export function MediaUpload({
  value,
  onChange,
  onThumbnailExtracted,
  accept = 'all',
  label = 'Media Asset',
  placeholder = 'https://...',
  helperText,
}: MediaUploadProps) {
  const { getToken } = useAuth();
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptMime =
    accept === 'image'
      ? 'image/*'
      : accept === 'video'
      ? 'video/*'
      : accept === 'pdf'
      ? 'application/pdf'
      : 'image/*,video/*,application/pdf';

  // ── Derived state ──────────────────────────────────────────────
  const ytId = value ? extractYouTubeId(value) : null;
  const ytThumb = ytId ? ytThumbnail(ytId) : null;
  const ytThumbFallback = ytId ? ytThumbnail(ytId, 'hq') : null;

  const isImage =
    value &&
    (value.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) ||
      value.includes('image') ||
      accept === 'image');
  const isVideo =
    value &&
    (value.match(/\.(mp4|webm|ogg)($|\?)/i) ||
      ytId ||
      value.includes('vimeo.com') ||
      accept === 'video');
  const isPdf = value && (value.match(/\.pdf($|\?)/i) || accept === 'pdf');

  // ── File Upload ────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('file', file);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.data?.url) {
        onChange(data.data.url);
      } else {
        setError(data.message || 'Upload failed. You can paste a direct URL instead.');
      }
    } catch (err: any) {
      setError(err.message || 'Upload error. Try pasting direct link.');
    } finally {
      setUploading(false);
    }
  };

  // ── URL Input change — auto-fire thumbnail callback on YT links ──
  const handleUrlChange = (url: string) => {
    onChange(url);
    const id = extractYouTubeId(url);
    if (id && onThumbnailExtracted) {
      // Give caller the hqdefault thumbnail (always available, unlike maxresdefault)
      onThumbnailExtracted(ytThumbnail(id, 'hq'));
    }
  };

  return (
    <div className="space-y-2">
      {/* Header & Mode Tabs */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#8e8e9c]">{label}</label>
        <div className="flex items-center rounded-lg border border-[#23232a] bg-[#0d0d10] p-0.5">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              mode === 'upload'
                ? 'bg-[#d4f76d] text-black shadow-xs'
                : 'text-[#8e8e9c] hover:text-white'
            }`}
          >
            <UploadCloud className="h-3 w-3" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              mode === 'url'
                ? 'bg-[#d4f76d] text-black shadow-xs'
                : 'text-[#8e8e9c] hover:text-white'
            }`}
          >
            <LinkIcon className="h-3 w-3" />
            Paste Link
          </button>
        </div>
      </div>

      {/* ── Upload Mode ─────────────────────────────────────────── */}
      {mode === 'upload' ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptMime}
            onChange={handleFileChange}
            className="hidden"
          />

          {!value ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-[#23232a] bg-[#0d0d10] p-6 text-center cursor-pointer transition-all hover:border-[#d4f76d] hover:bg-[#121217] ${
                uploading ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-[#d4f76d]" />
                  <p className="text-xs font-semibold text-white">Uploading to Cloudinary...</p>
                </div>
              ) : (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#16161a] text-[#d4f76d] mb-2">
                    {accept === 'video' ? (
                      <Video className="h-5 w-5" />
                    ) : accept === 'pdf' ? (
                      <FileText className="h-5 w-5" />
                    ) : (
                      <ImageIcon className="h-5 w-5" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-white">
                    Click or drag & drop to upload {accept === 'all' ? 'media' : accept}
                  </p>
                  <p className="text-[10px] text-[#8e8e9c] mt-0.5">
                    Supports high-res files with Cloudinary CDN optimization
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="relative flex items-center justify-between rounded-xl border border-[#23232a] bg-[#0d0d10] p-3">
              <div className="flex items-center gap-3 min-w-0">
                {isImage && (
                  <img
                    src={value}
                    alt="Preview"
                    className="h-12 w-16 rounded-lg object-cover bg-black shrink-0"
                  />
                )}
                {accept === 'pdf' && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#23232a] text-[#d4f76d] shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                )}
                {accept === 'video' && !isImage && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#23232a] text-[#d4f76d] shrink-0">
                    <Video className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate max-w-xs">{value}</p>
                  <span className="text-[10px] font-semibold text-[#d4f76d] flex items-center gap-1 mt-0.5">
                    <Check className="h-3 w-3" /> Ready & Attached
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border border-[#23232a] bg-[#16161a] px-3 py-1.5 text-[11px] font-semibold text-white hover:border-[#d4f76d]"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-900/40 bg-red-950/20 text-red-400 hover:bg-red-950/40"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── URL Mode ──────────────────────────────────────────── */
        <div className="space-y-2">
          <div className="relative">
            <input
              type="url"
              placeholder={placeholder}
              value={value}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="h-10 w-full rounded-xl border border-[#23232a] bg-[#0d0d10] px-3.5 text-xs text-white placeholder:text-[#6c6c7a] focus:border-[#d4f76d] focus:outline-none"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute right-2.5 top-2.5 text-[#8e8e9c] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* ── YouTube Thumbnail Auto-Preview ── */}
          {ytId && ytThumb && (
            <div className="relative overflow-hidden rounded-xl border border-[#23232a] bg-black">
              <img
                src={ytThumb}
                alt="YouTube Thumbnail"
                className="w-full aspect-video object-cover"
                onError={(e) => {
                  // fallback to hqdefault if maxresdefault not available
                  (e.target as HTMLImageElement).src = ytThumbFallback!;
                }}
              />
              {/* YouTube badge */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 backdrop-blur-sm">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600">
                  <Play className="h-2 w-2 fill-white text-white" />
                </div>
                <span className="text-[11px] font-bold text-white">YouTube Preview</span>
              </div>
              {/* Remove button */}
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* ── Pasted Image URL quick preview ── */}
          {value && isImage && !ytId && (
            <div className="flex items-center gap-3 rounded-xl border border-[#23232a] bg-[#0d0d10] p-2">
              <img
                src={value}
                alt="Preview"
                className="h-10 w-16 rounded-md object-cover bg-black"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-[11px] text-[#8e8e9c]">URL Preview Verified</span>
            </div>
          )}

          {/* ── Vimeo / other video link confirmed ── */}
          {value && isVideo && !ytId && (
            <div className="flex items-center gap-2.5 rounded-xl border border-[#23232a] bg-[#0d0d10] px-3 py-2">
              <Video className="h-4 w-4 text-[#d4f76d] shrink-0" />
              <span className="text-[11px] text-white font-semibold">Video link attached</span>
              <Check className="h-3.5 w-3.5 text-[#d4f76d] ml-auto" />
            </div>
          )}
        </div>
      )}

      {error && <p className="text-[11px] font-semibold text-red-400">{error}</p>}
      {helperText && !error && (
        <p className="text-[10px] text-[#8e8e9c]">{helperText}</p>
      )}
    </div>
  );
}
