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
            toast.error('Failed to delete course.');
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
      const payload = { ...lectureForm, duration: parseInt(lectureForm.duration, 10) || 600 };
      const res = await fetchApi(`/lectures/course/${courseId}`, {
        method: 'POST', token, body: JSON.stringify(payload),
      });
      if (res.success) {
        toast.success('Lesson added to syllabus!');
        setLectureForm({ title: '', description: '', videoUrl: '', pdfUrl: '', duration: '600', isFree: false });
        setShowAddForm(false);
        await loadCourse();
      } else {
        toast.error(res.message || 'Failed to add lesson.');
      }
    } catch {
      toast.error('Error adding lesson.');
    } finally {
      setAddingLecture(false);
    }
  };

  const handleDeleteLecture = async (lectureId: string, title: string) => {
    toast(`Remove "${title}"?`, {
      action: {
        label: 'Remove',
        onClick: async () => {
          try {
            const token = await getToken();
            const res = await fetchApi(`/lectures/${lectureId}`, { method: 'DELETE', token });
            if (res.success) {
              toast.success('Lesson removed.');
              await loadCourse();
            } else {
              toast.error(res.message || 'Failed to remove lesson.');
            }
          } catch {
            toast.error('Error removing lesson.');
          }
        },
      },
      cancel: { label: 'Cancel', onClick: () => {} },
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#0d0d10] p-8 space-y-6">
        <Skeleton className="h-10 w-48 bg-[#16161a]" />
        <Skeleton className="h-64 w-full rounded-2xl bg-[#16161a]" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d0d10] text-center p-8">
        <h2 className="text-xl font-bold text-white">Course Not Found</h2>
        <Link href="/admin" className="mt-4">
          <button className="rounded-full bg-[#d4f76d] px-6 py-2.5 text-xs font-bold text-black">
            Back to Admin Panel
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0d10]">
      <SkillUpHeader title="Admin — Course Management" />

      <div className="mx-auto w-full max-w-5xl p-6 lg:p-8 space-y-6">
        {/* Top Actions Bar */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#8e8e9c] hover:text-[#d4f76d] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Admin Panel
          </Link>

          <div className="flex items-center gap-3">
            <Link href={`/courses/${courseId}`} target="_blank">
              <button className="flex items-center gap-1.5 rounded-full border border-[#23232a] bg-[#16161a] px-4 py-2 text-xs font-bold text-white hover:border-[#d4f76d] transition-colors">
                <Eye className="h-3.5 w-3.5" />
                Preview Student View
              </button>
            </Link>

            <button
              onClick={handleTogglePublish}
              disabled={publishing}
              className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
                course.isPublished
                  ? 'border border-[#23232a] bg-[#1c1c22] text-white hover:bg-[#23232a]'
                  : 'bg-[#d4f76d] text-black hover:bg-[#c4ea5c]'
              }`}
            >
              {publishing
                ? 'Updating...'
                : course.isPublished
                ? 'Unpublish (Set to Draft)'
                : 'Publish Course'}
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
        <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <h1 className="text-xl font-bold text-white">{course.title}</h1>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    course.isPublished
                      ? 'bg-[#d4f76d] text-black'
                      : 'bg-[#23232a] text-[#8e8e9c]'
                  }`}
                >
                  {course.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="text-xs text-[#8e8e9c] line-clamp-1">{course.description}</p>
            </div>

            <div className="flex items-center gap-4 text-xs text-[#8e8e9c] shrink-0">
              <span>{course.lectures?.length || 0} Lessons</span>
              <span>•</span>
              <span className="font-extrabold text-[#d4f76d]">Free</span>
            </div>
          </div>
        </div>

        {/* Curriculum Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Curriculum & Video Lessons</h2>
              <p className="text-xs text-[#8e8e9c]">
                Add sequential video lectures, supporting PDF notes, or import an entire YouTube playlist.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPlaylistModal(true)}
                className="flex items-center gap-1.5 rounded-full border border-[#23232a] bg-[#16161a] px-4 py-2 text-xs font-bold text-[#d4f76d] hover:border-[#d4f76d] transition-all"
              >
                <ListVideo className="h-3.5 w-3.5" />
                Import YouTube Playlist
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 rounded-full bg-[#d4f76d] px-4 py-2 text-xs font-bold text-black hover:bg-[#c4ea5c] transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                {showAddForm ? 'Close Form' : 'Add Lesson'}
              </button>
            </div>
          </div>

          {/* Add Lecture Card */}
          {showAddForm && (
            <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">New Lesson Details</h3>

              <form onSubmit={handleAddLecture} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#8e8e9c]">
                    Lesson Title <span className="text-[#d4f76d]">*</span>
                  </label>
                  <input
                    required
                    placeholder="e.g. 01. Introduction to Next.js Architecture"
                    value={lectureForm.title}
                    onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })}
                    className="h-10 w-full rounded-xl border border-[#23232a] bg-[#0d0d10] px-3.5 text-xs text-white placeholder:text-[#6c6c7a] focus:border-[#d4f76d] focus:outline-none"
                  />
                </div>

                {/* Video Media Upload / URL */}
                <MediaUpload
                  accept="video"
                  label="Video Stream Asset (Upload MP4 or Paste YouTube/Vimeo Link)"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={lectureForm.videoUrl}
                  onChange={(url) => setLectureForm({ ...lectureForm, videoUrl: url })}
                  helperText="Upload an MP4/WebM video file directly, or paste a YouTube Unlisted / Public link."
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* PDF Document Upload */}
                  <MediaUpload
                    accept="pdf"
                    label="Lesson Notes / PDF Resource (Optional)"
                    placeholder="https://example.com/notes.pdf"
                    value={lectureForm.pdfUrl}
                    onChange={(url) => setLectureForm({ ...lectureForm, pdfUrl: url })}
                    helperText="Upload a study PDF or cheatsheet for students."
                  />

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#8e8e9c]">
                      Duration (Seconds)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="600"
                      value={lectureForm.duration}
                      onChange={(e) => setLectureForm({ ...lectureForm, duration: e.target.value })}
                      className="h-10 w-full rounded-xl border border-[#23232a] bg-[#0d0d10] px-3.5 text-xs text-white placeholder:text-[#6c6c7a] focus:border-[#d4f76d] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#8e8e9c]">
                    Description & Key Concepts
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Summary of topics covered in this lesson..."
                    value={lectureForm.description}
                    onChange={(e) => setLectureForm({ ...lectureForm, description: e.target.value })}
                    className="w-full rounded-xl border border-[#23232a] bg-[#0d0d10] p-3 text-xs text-white placeholder:text-[#6c6c7a] focus:border-[#d4f76d] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isFree"
                    checked={lectureForm.isFree}
                    onChange={(e) => setLectureForm({ ...lectureForm, isFree: e.target.checked })}
                    className="h-4 w-4 rounded accent-[#d4f76d]"
                  />
                  <label htmlFor="isFree" className="text-xs text-[#8e8e9c]">
                    Free Preview (allow students to preview before enrolling/purchasing)
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#23232a]">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="rounded-full border border-[#23232a] bg-[#1c1c22] px-4 py-2 text-xs font-bold text-white hover:bg-[#23232a]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingLecture}
                    className="rounded-full bg-[#d4f76d] px-5 py-2 text-xs font-bold text-black hover:bg-[#c4ea5c] disabled:opacity-50"
                  >
                    {addingLecture ? 'Saving...' : 'Save Lesson'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Existing Lectures List */}
          {course.lectures?.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#23232a] p-8 text-center text-xs text-[#8e8e9c]">
              No lessons added yet. Click &ldquo;Add Lesson&rdquo; above to build your course syllabus.
            </div>
          ) : (
            <div className="space-y-2">
              {course.lectures?.map((lecture: any, index: number) => (
                <div
                  key={lecture.id}
                  className="flex items-center justify-between rounded-xl border border-[#23232a] bg-[#16161a] p-4 transition-colors hover:border-[#34343d]"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#23232a] text-xs font-bold text-white">
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white truncate">
                          {lecture.title}
                        </h4>
                        {lecture.isFree && (
                          <span className="rounded-full bg-[#d4f76d]/15 px-2 py-0.5 text-[9px] font-bold text-[#d4f76d]">
                            Free Preview
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-[#8e8e9c] mt-0.5">
                        <span>{formatDuration(lecture.duration)}</span>
                        {lecture.pdfUrl && <span>• PDF Attached</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <button
                      onClick={() => handleDeleteLecture(lecture.id, lecture.title)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#23232a] bg-[#1c1c22] text-[#8e8e9c] hover:border-red-800 hover:text-red-400 transition-colors"
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
