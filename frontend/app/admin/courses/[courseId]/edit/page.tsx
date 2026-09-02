'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { SkillUpHeader } from '@/components/skillup-header';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  ListVideo,
  Flame,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { formatDuration } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { MediaUpload } from '@/components/media-upload';
import { PlaylistImporterModal } from '@/components/playlist-importer-modal';
import { toast } from 'sonner';

export default function AdminEditCourseLecturesPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const router = useRouter();
  const { getToken } = useAuth();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  // New Lecture Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingLecture, setAddingLecture] = useState(false);
  const [lectureForm, setLectureForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    pdfUrl: '',
    duration: '600',
    isFree: false,
  });

  const loadCourse = async () => {
    try {
      const res = await fetchApi<any>(`/courses/${courseId}`);
      if (res.success && res.data) {
        setCourse(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const handleTogglePublish = async () => {
    setPublishing(true);
    try {
      const token = await getToken();
      const res = await fetchApi(`/courses/${courseId}/publish`, { method: 'POST', token });
      if (res.success && res.data) {
        setCourse({ ...course, isPublished: res.data.isPublished });
        toast.success(res.data.isPublished ? 'Course published successfully!' : 'Course moved to draft.');
      } else {
        toast.error(res.message || 'Cannot publish — ensure you have at least 1 lecture.');
      }
    } catch {
      toast.error('Publishing toggle failed. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteCourse = async () => {
    toast('Delete this course permanently?', {
      description: 'All lectures and enrollments will be lost.',
      action: {
        label: 'Delete',
        onClick: async () => {
          setDeletingCourse(true);
          try {
            const token = await getToken();
            const res = await fetchApi(`/courses/${courseId}`, { method: 'DELETE', token });
            if (res.success) {
              toast.success('Course deleted.');
              router.push('/admin');
            } else {
              toast.error(res.message || 'Failed to delete course.');
            }
          } catch {
            toast.error('Network error deleting course.');
          } finally {
            setDeletingCourse(false);
          }
        },
      },
      cancel: { label: 'Cancel', onClick: () => {} },
    });
  };

  const handleAddLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingLecture(true);

    try {
      const token = await getToken();
      const payload = {
        title: lectureForm.title,
        description: lectureForm.description,
        videoUrl: lectureForm.videoUrl,
        pdfUrl: lectureForm.pdfUrl || undefined,
        duration: parseInt(lectureForm.duration, 10) || 600,
        isFree: lectureForm.isFree,
      };

      const res = await fetchApi(`/courses/${courseId}/lectures`, {
        method: 'POST',
        token,
        body: JSON.stringify(payload),
      });

      if (res.success) {
        toast.success('Lesson added to syllabus!');
        setLectureForm({
          title: '',
          description: '',
          videoUrl: '',
          pdfUrl: '',
          duration: '600',
          isFree: false,
        });
        setShowAddForm(false);
        loadCourse();
      } else {
        toast.error(res.message || 'Failed to add lesson.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error.');
    } finally {
      setAddingLecture(false);
    }
  };

  const handleDeleteLecture = async (lectureId: string, title: string) => {
    toast(`Delete "${title}"?`, {
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            const token = await getToken();
            const res = await fetchApi(`/courses/${courseId}/lectures/${lectureId}`, {
              method: 'DELETE',
              token,
            });
            if (res.success) {
              toast.success('Lesson removed.');
              loadCourse();
            } else {
              toast.error(res.message || 'Failed to delete lecture.');
            }
          } catch {
            toast.error('Network error.');
          }
        },
      },
      cancel: { label: 'Cancel', onClick: () => {} },
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-app p-8 space-y-6">
        <Skeleton className="h-10 w-48 bg-card" />
        <Skeleton className="h-64 w-full rounded-2xl bg-card" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-app p-8 text-center">
        <h2 className="text-xl font-bold text-app">Course Not Found</h2>
        <Link href="/admin" className="mt-4">
          <button className="rounded-full glow-amber-btn px-6 py-2.5 text-xs font-bold text-white">
            Return to Studio
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-app bg-grid-pattern">
      <SkillUpHeader title="Admin Studio — Manage Course" />

      <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-[#f97316] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Studio Overview
          </Link>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href={`/courses/${courseId}`} target="_blank">
              <button className="flex items-center gap-1.5 rounded-full border border-app bg-card px-4 py-2 text-xs font-bold text-white hover:border-[#f97316] transition-colors">
                <Eye className="h-3.5 w-3.5" />
                Preview Student View
              </button>
            </Link>

            <button
              onClick={handleTogglePublish}
              disabled={publishing}
              className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
                course.isPublished
                  ? 'border border-app bg-card-2 text-white hover:border-[#f97316]'
                  : 'glow-amber-btn text-white'
              }`}
            >
              {publishing
                ? 'Updating...'
                : course.isPublished
                ? 'Unpublish (Set to Draft)'
                : 'Publish Course Live'}
            </button>

            <button
              onClick={handleDeleteCourse}
              disabled={deletingCourse}
              className="flex items-center gap-1.5 rounded-full border border-red-900/50 bg-red-950/20 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-950/50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Course
            </button>
          </div>
        </div>

        {/* Course Overview Card */}
        <div className="rounded-3xl border border-app bg-card p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <h1 className="text-xl sm:text-2xl font-black text-app">{course.title}</h1>
                <span
                  className={`rounded-md px-2.5 py-0.5 text-[10px] font-bold ${
                    course.isPublished
                      ? 'bg-[#f97316]/15 text-[#f97316]'
                      : 'bg-card-2 text-muted'
                  }`}
                >
                  {course.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="text-xs text-muted line-clamp-1">{course.description}</p>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted shrink-0 font-semibold">
              <span>{course.lectures?.length || 0} Lessons</span>
              <span>•</span>
              <span className="font-extrabold text-[#f97316]">100% Free</span>
            </div>
          </div>
        </div>

        {/* Curriculum Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-app">Curriculum & Video Lessons</h2>
              <p className="text-xs text-muted">
                Add sequential video lectures, supporting PDF notes, or 1-click import a full YouTube playlist.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPlaylistModal(true)}
                className="flex items-center gap-1.5 rounded-full border border-app bg-card px-4 py-2 text-xs font-bold text-[#f97316] hover:border-[#f97316] transition-all"
              >
                <ListVideo className="h-3.5 w-3.5" />
                Import YouTube Playlist
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 rounded-full glow-amber-btn px-4 py-2 text-xs font-bold text-white transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                {showAddForm ? 'Close Form' : 'Add Lesson'}
              </button>
            </div>
          </div>

          {/* Add Lecture Card */}
          {showAddForm && (
            <div className="rounded-3xl border border-app bg-card p-6 space-y-4 shadow-2xl">
              <h3 className="text-sm font-bold text-app">New Lesson Details</h3>

              <form onSubmit={handleAddLecture} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted">
                    Lesson Title <span className="text-[#f97316]">*</span>
                  </label>
                  <input
                    required
                    placeholder="e.g. Episode 01: Introduction to Next.js Architecture"
                    value={lectureForm.title}
                    onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })}
                    className="h-10 w-full rounded-xl border border-app bg-app px-3.5 text-xs text-white placeholder:text-subtle focus:border-[#f97316] focus:outline-none"
                  />
                </div>

                {/* Video Media Upload / URL */}
                <MediaUpload
                  accept="video"
                  label="Video Stream Asset (Upload MP4 or Paste YouTube/Vimeo Link)"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={lectureForm.videoUrl}
                  onChange={(url) => setLectureForm({ ...lectureForm, videoUrl: url })}
                  helperText="Upload an MP4/WebM video file directly, or paste a YouTube link."
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <MediaUpload
                    accept="pdf"
                    label="Lesson Notes / PDF Resource (Optional)"
                    placeholder="https://example.com/notes.pdf"
                    value={lectureForm.pdfUrl}
                    onChange={(url) => setLectureForm({ ...lectureForm, pdfUrl: url })}
                    helperText="Upload a study PDF or cheatsheet for students."
                  />

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted">
                      Duration (Seconds)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="600"
                      value={lectureForm.duration}
                      onChange={(e) => setLectureForm({ ...lectureForm, duration: e.target.value })}
                      className="h-10 w-full rounded-xl border border-app bg-app px-3.5 text-xs text-white placeholder:text-subtle focus:border-[#f97316] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted">
                    Description & Key Concepts
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Summary of topics covered in this lesson..."
                    value={lectureForm.description}
                    onChange={(e) => setLectureForm({ ...lectureForm, description: e.target.value })}
                    className="w-full rounded-xl border border-app bg-app p-3 text-xs text-white placeholder:text-subtle focus:border-[#f97316] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-app">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="rounded-full border border-app bg-card-2 px-4 py-2 text-xs font-bold text-white hover:bg-[#22232a]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingLecture}
                    className="rounded-full glow-amber-btn px-5 py-2 text-xs font-bold text-white disabled:opacity-50"
                  >
                    {addingLecture ? 'Saving...' : 'Save Lesson'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Existing Lectures List */}
          {course.lectures?.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-app p-12 text-center text-xs text-muted bg-card">
              No lessons added yet. Click &ldquo;Add Lesson&rdquo; or &ldquo;Import YouTube Playlist&rdquo; above.
            </div>
          ) : (
            <div className="space-y-2">
              {course.lectures?.map((lecture: any, index: number) => (
                <div
                  key={lecture.id}
                  className="flex items-center justify-between rounded-2xl border border-app bg-card p-4 transition-colors hover:border-[#f97316]/30 shadow-lg"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card-2 text-xs font-black text-[#f97316]">
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-app truncate">
                          {lecture.title}
                        </h4>
                        {lecture.isFree && (
                          <span className="rounded-md bg-[#f97316]/15 px-2 py-0.5 text-[9px] font-bold text-[#f97316]">
                            Free Preview
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-muted mt-0.5">
                        <span>{formatDuration(lecture.duration)}</span>
                        {lecture.pdfUrl && <span>• PDF Notes Attached</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <button
                      onClick={() => handleDeleteLecture(lecture.id, lecture.title)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-900/40 bg-red-950/20 text-red-400 hover:bg-red-950/40 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 1-Click YouTube Playlist Importer Modal */}
      <PlaylistImporterModal
        courseId={courseId}
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        onSuccess={() => {
          loadCourse();
          toast.success('YouTube Playlist imported! All lessons added to syllabus.');
        }}
      />
    </div>
  );
}
