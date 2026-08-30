'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchApi } from '@/lib/api';
import {
  Sparkles,
  X,
  Play,
  CheckCircle2,
  Clock,
  Loader2,
  ListVideo,
  ArrowRight,
} from 'lucide-react';

interface PlaylistImporterModalProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PlaylistImporterModal({
  courseId,
  isOpen,
  onClose,
  onSuccess,
}: PlaylistImporterModalProps) {
  const { getToken } = useAuth();
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [error, setError] = useState('');
  const [isFreeFirst, setIsFreeFirst] = useState(true);

  if (!isOpen) return null;

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistUrl.trim()) return;

    setLoadingPreview(true);
    setError('');
    setPreviewData(null);

    try {
      const token = await getToken();
      const res = await fetchApi<any>('/courses/preview-playlist', {
        method: 'POST',
        token,
        body: JSON.stringify({ playlistUrl }),
      });

      if (res.success && res.data) {
        setPreviewData(res.data);
      } else {
        setError(res.message || 'Could not fetch playlist. Please check URL.');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching YouTube playlist');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setError('');

    try {
      const token = await getToken();
      const res = await fetchApi<any>(`/courses/${courseId}/import-playlist`, {
        method: 'POST',
        token,
        body: JSON.stringify({
          playlistUrl,
          isFreeFirstLecture: isFreeFirst,
        }),
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to import playlist lessons.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to import playlist.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[#23232a] bg-[#16161a] shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#23232a] p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d4f76d]/15 text-[#d4f76d]">
              <ListVideo className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                1-Click YouTube Playlist Importer
                <span className="rounded-full bg-[#d4f76d]/20 px-2 py-0.5 text-[10px] font-bold text-[#d4f76d]">
                  Auto-Syllabus
                </span>
              </h3>
              <p className="text-[11px] text-[#8e8e9c]">
                Paste any YouTube playlist link to auto-generate all course lessons & durations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8e8e9c] hover:bg-[#23232a] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Input Form */}
          <form onSubmit={handlePreview} className="space-y-3">
            <label className="text-xs font-semibold text-[#8e8e9c]">
              YouTube Playlist Link
            </label>
            <div className="flex gap-2">
              <input
                required
                type="url"
                placeholder="https://www.youtube.com/playlist?list=PL..."
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                className="h-10 flex-1 rounded-xl border border-[#23232a] bg-[#0d0d10] px-3.5 text-xs text-white placeholder:text-[#6c6c7a] focus:border-[#d4f76d] focus:outline-none"
              />
              <button
                type="submit"
                disabled={loadingPreview}
                className="flex items-center gap-1.5 rounded-xl bg-[#d4f76d] px-4 py-2 text-xs font-bold text-black hover:bg-[#c4ea5c] transition-all disabled:opacity-50 shrink-0"
              >
                {loadingPreview ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {loadingPreview ? 'Fetching...' : 'Preview'}
              </button>
            </div>
          </form>

          {error && (
            <div className="rounded-xl border border-red-800/40 bg-red-950/40 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Preview Playlist Results */}
          {previewData && (
            <div className="space-y-4 rounded-xl border border-[#23232a] bg-[#0d0d10] p-4">
              <div className="flex items-center justify-between border-b border-[#23232a] pb-3">
                <div>
                  <h4 className="text-xs font-bold text-white">{previewData.title}</h4>
                  <p className="text-[11px] text-[#8e8e9c]">
                    Found <span className="text-[#d4f76d] font-bold">{previewData.videoCount}</span> video lessons ready for import
                  </p>
                </div>
              </div>

              {/* Free preview toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="freeFirst"
                  checked={isFreeFirst}
                  onChange={(e) => setIsFreeFirst(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#d4f76d]"
                />
                <label htmlFor="freeFirst" className="text-xs text-[#8e8e9c]">
                  Mark 1st video as <span className="text-white font-semibold">Free Preview Demo</span>
                </label>
              </div>

              {/* Videos Scroll List */}
              <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                {previewData.videos?.map((v: any) => (
                  <div
                    key={v.videoId}
                    className="flex items-center justify-between rounded-lg border border-[#23232a] bg-[#16161a] p-2.5 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#23232a] text-[10px] font-bold text-white">
                        {v.order}
                      </span>
                      {v.thumbnail && (
                        <img
                          src={v.thumbnail}
                          alt={v.title}
                          className="h-8 w-14 rounded object-cover shrink-0"
                        />
                      )}
                      <p className="text-xs font-semibold text-white truncate max-w-sm">
                        {v.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-[#8e8e9c] shrink-0 ml-2">
                      <Clock className="h-3 w-3" />
                      <span>{v.durationFormatted}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[#23232a] p-4 bg-[#16161a]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#23232a] bg-[#1c1c22] px-5 py-2 text-xs font-bold text-white hover:bg-[#23232a]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!previewData || importing}
            onClick={handleImport}
            className="flex items-center gap-2 rounded-full bg-[#d4f76d] px-6 py-2 text-xs font-bold text-black hover:bg-[#c4ea5c] transition-all disabled:opacity-50"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing {previewData?.videoCount || ''} Lessons...
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4" />
                Import All Into Course Syllabus
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
