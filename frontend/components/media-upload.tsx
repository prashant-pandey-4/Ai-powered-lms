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
  Sparkles,
} from 'lucide-react';

interface MediaUploadProps {
  value: string;
  onChange: (url: string) => void;
  onThumbnailExtracted?: (thumbnailUrl: string) => void;
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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptMime =
    accept === 'image'
      ? 'image/*'
      : accept === 'video'
      ? 'video/*'
      : accept === 'pdf'
      ? 'application/pdf'
      : 'image/*,video/*,application/pdf';

  const ytId = value ? extractYouTubeId(value) : null;
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

  const uploadFile = async (file: File) => {
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
      if (data.success && data.data?.url) {
        onChange(data.data.url);
      } else {
        setError(data.message || 'Upload failed. Please try again or paste a link.');
      }
    } catch {
      setError('Network error during upload. Please try pasting a direct link.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
    const id = extractYouTubeId(url);
    if (id && onThumbnailExtracted) {
      onThumbnailExtracted(ytThumbnail(id, 'hq'));
    }
  };

  return (
    <div className="space-y-2">
      {/* Header & Mode Tabs */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-app flex items-center gap-1.5">
          {label}
        </label>
        <div className="flex items-center rounded-xl border border-app bg-card p-0.5">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
              mode === 'upload'
                ? 'bg-[#f97316] text-white shadow-sm font-bold'
                : 'text-muted hover:text-app'
            }`}
          >
            <UploadCloud className="h-3 w-3" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
              mode === 'url'
                ? 'bg-[#f97316] text-white shadow-sm font-bold'
                : 'text-muted hover:text-app'
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
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-[#f97316] bg-[#f97316]/5 scale-[0.99]'
                  : 'border-app bg-card-2/60 hover:border-[#f97316]/60 hover:bg-card-2'
              } ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <Loader2 className="h-7 w-7 animate-spin text-[#f97316]" />
                  <p className="text-xs font-bold text-app">Uploading to Cloudinary CDN...</p>
                  <p className="text-[10px] text-muted">Optimizing media compression</p>
                </div>
              ) : (
                <>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f97316]/10 text-[#f97316] mb-2.5 transition-transform group-hover:scale-110">
                    {accept === 'video' ? (
                      <Video className="h-5 w-5" />
                    ) : accept === 'pdf' ? (
                      <FileText className="h-5 w-5" />
                    ) : (
                      <ImageIcon className="h-5 w-5" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-app">
                    Click to browse or drag & drop {accept === 'all' ? 'media file' : accept}
                  </p>
                  <p className="text-[10px] text-muted mt-1">
                    High-res JPG, PNG, WebP with automated Cloudinary global CDN delivery
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="relative flex items-center justify-between rounded-2xl border border-app bg-card p-3 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                {isImage && (
                  <img
                    src={value}
                    alt="Preview"
                    className="h-12 w-20 rounded-xl object-cover border border-app bg-black shrink-0 shadow-xs"
                  />
                )}
                {accept === 'pdf' && (
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f97316]/10 text-[#f97316] shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                )}
                {accept === 'video' && !isImage && (
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f97316]/10 text-[#f97316] shrink-0">
                    <Video className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-app truncate max-w-xs">{value}</p>
                  <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 mt-0.5">
                    <Check className="h-3 w-3 stroke-[3]" /> CDN Optimized & Attached
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border border-app bg-card-2 px-3 py-1.5 text-[11px] font-bold text-app hover:border-[#f97316]/50 transition-colors"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  title="Remove file"
                >
                  <X className="h-4 w-4" />
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
              className="h-10 w-full rounded-xl border border-app bg-app px-3.5 pr-9 text-xs text-app placeholder:text-subtle focus:border-[#f97316] focus:outline-none transition-colors"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute right-3 top-3 text-muted hover:text-app"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {value && (
            <div className="flex items-center gap-2 rounded-xl border border-app bg-card p-2 text-xs">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Preview:</span>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="truncate text-[#f97316] hover:underline text-[11px] font-medium"
              >
                {value}
              </a>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-[11px] font-semibold text-red-400">{error}</p>}
      {helperText && <p className="text-[10px] text-muted leading-relaxed">{helperText}</p>}
    </div>
  );
}
