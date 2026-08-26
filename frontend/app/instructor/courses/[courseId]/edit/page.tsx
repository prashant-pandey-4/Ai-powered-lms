'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input, Textarea } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Plus,
  Play,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileText,
  Clock,
  Layers,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { formatPrice, formatDuration } from '@/lib/utils';

export default function EditCourseLecturesPage({
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

  // New Lecture Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingLecture, setAddingLecture] = useState(false);
  const [lectureForm, setLectureForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    pdfUrl: '',
    duration: '600', // 10 mins default
    isFree: false,
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  // Toggle Publish Status
  const handleTogglePublish = async () => {
    setPublishing(true);
    setMessage(null);

    try {
      const token = await getToken();
      const res = await fetchApi(`/courses/${courseId}/publish`, {
        method: 'POST',
        token,
      });

      if (res.success && res.data) {
        setCourse({ ...course, isPublished: res.data.isPublished });
        setMessage({
          type: 'success',
          text: res.data.isPublished ? 'Course published successfully!' : 'Course unpublished (Draft).',
        });
      } else {
        setMessage({
          type: 'error',
          text: res.message || 'Cannot publish. Ensure you have at least 1 lecture.',
        });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Publishing toggle failed' });
    } finally {
      setPublishing(false);
    }
  };

  // Add Lecture
  const handleAddLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingLecture(true);
    setMessage(null);

    try {
      const token = await getToken();
      const payload = {
        ...lectureForm,
        duration: parseInt(lectureForm.duration, 10) || 600,
      };

      const res = await fetchApi(`/lectures/course/${courseId}`, {
        method: 'POST',
        token,
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setMessage({ type: 'success', text: 'Lecture added successfully!' });
        setLectureForm({
          title: '',
          description: '',
          videoUrl: '',
          pdfUrl: '',
          duration: '600',
          isFree: false,
        });
        setShowAddForm(false);
        await loadCourse();
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to add lecture' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error adding lecture' });
    } finally {
      setAddingLecture(false);
    }
  };

  // Delete Lecture
  const handleDeleteLecture = async (lectureId: string) => {
    if (!confirm('Are you sure you want to remove this lecture?')) return;

    try {
      const token = await getToken();
      const res = await fetchApi(`/lectures/${lectureId}`, {
        method: 'DELETE',
        token,
      });

      if (res.success) {
        await loadCourse();
      } else {
        alert(res.message || 'Failed to delete lecture');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Course Not Found</h2>
        <Link href="/instructor">
          <Button className="mt-4">Back to Studio</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Link
          href="/instructor"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Instructor Studio
        </Link>

        <div className="flex items-center gap-3">
          <Link href={`/courses/${courseId}`} target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Eye className="h-3.5 w-3.5" />
              Preview Student View
            </Button>
          </Link>

          <Button
            onClick={handleTogglePublish}
            isLoading={publishing}
            variant={course.isPublished ? 'secondary' : 'default'}
            size="sm"
            className="text-xs"
          >
            {course.isPublished ? 'Unpublish Course' : 'Publish Course'}
          </Button>
        </div>
      </div>

      {/* Status Notice */}
      {message && (
        <div
          className={`mb-6 rounded-md p-4 text-xs ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Course Overview Card */}
      <Card className="mb-8 border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {course.title}
                </h1>
                {course.isPublished ? (
                  <Badge variant="success">Published</Badge>
                ) : (
                  <Badge variant="secondary">Draft</Badge>
                )}
              </div>
              <p className="text-xs text-zinc-500 line-clamp-1">{course.description}</p>
            </div>

            <div className="flex items-center gap-4 text-xs text-zinc-500 shrink-0">
              <span>{course.lectures?.length || 0} Lectures</span>
              <span>•</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {formatPrice(course.price)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lecture Management Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Curriculum & Lectures
            </h2>
            <p className="text-xs text-zinc-500">
              Add video lessons and supporting PDF notes in sequential order.
            </p>
          </div>

          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            size="sm"
            className="gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            {showAddForm ? 'Close Form' : 'Add Lecture'}
          </Button>
        </div>

        {/* Add Lecture Modal/Card */}
        {showAddForm && (
          <Card className="border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">New Lecture Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddLecture} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Lecture Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. 01. Introduction to System Architecture"
                    value={lectureForm.title}
                    onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Video URL (YouTube Unlisted / Public) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={lectureForm.videoUrl}
                    onChange={(e) => setLectureForm({ ...lectureForm, videoUrl: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      PDF Resource / Notes URL (Optional)
                    </label>
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={lectureForm.pdfUrl}
                      onChange={(e) => setLectureForm({ ...lectureForm, pdfUrl: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Duration (Seconds)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="600"
                      value={lectureForm.duration}
                      onChange={(e) => setLectureForm({ ...lectureForm, duration: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Description / Key Takeaways
                  </label>
                  <Textarea
                    rows={2}
                    placeholder="Summary of topics explained in this video..."
                    value={lectureForm.description}
                    onChange={(e) => setLectureForm({ ...lectureForm, description: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isFree"
                    checked={lectureForm.isFree}
                    onChange={(e) => setLectureForm({ ...lectureForm, isFree: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-950"
                  />
                  <label htmlFor="isFree" className="text-xs text-zinc-700 dark:text-zinc-300">
                    Free Preview (allow non-enrolled students to preview this lesson)
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" isLoading={addingLecture}>
                    Save Lecture
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Existing Lectures List */}
        {course.lectures?.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-500 dark:border-zinc-800">
            No lectures added yet. Click &ldquo;Add Lecture&rdquo; above to build your curriculum.
          </div>
        ) : (
          <div className="space-y-2">
            {course.lectures?.map((lecture: any, index: number) => (
              <div
                key={lecture.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {index + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {lecture.title}
                      </h4>
                      {lecture.isFree && (
                        <Badge variant="success" className="text-[10px]">
                          Free Preview
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-0.5">
                      <span>{formatDuration(lecture.duration)}</span>
                      {lecture.pdfUrl && <span>• PDF Attached</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <Button
                    onClick={() => handleDeleteLecture(lecture.id)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
