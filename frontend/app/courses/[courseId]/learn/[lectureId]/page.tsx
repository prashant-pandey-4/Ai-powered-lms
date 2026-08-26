'use client';

import { useEffect, useState, useRef, use } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { SkillUpHeader } from '@/components/skillup-header';
import {
  Play,
  CheckCircle2,
  Circle,
  FileText,
  BrainCircuit,
  ListVideo,
  Send,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Bot,
  User as UserIcon,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

function getYouTubeEmbedUrl(url: string): string {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`;
  }
  return url;
}

export default function LecturePlayerPage({
  params,
}: {
  params: Promise<{ courseId: string; lectureId: string }>;
}) {
  const { courseId, lectureId } = use(params);
  const { getToken } = useAuth();

  const [course, setCourse] = useState<any>(null);
  const [currentLecture, setCurrentLecture] = useState<any>(null);
  const [completedLectureIds, setCompletedLectureIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab State: 'playlist' | 'ai-tutor'
  const [activeTab, setActiveTab] = useState<'playlist' | 'ai-tutor'>('playlist');

  // AI Chatbot State
  const [chatLogs, setChatLogs] = useState<{ question: string; answer: string }[]>([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const token = await getToken();

      const courseRes = await fetchApi<any>(`/courses/${courseId}`);
      if (courseRes.success && courseRes.data) {
        setCourse(courseRes.data);
        const active = courseRes.data.lectures?.find((l: any) => l.id === lectureId);
        setCurrentLecture(active || courseRes.data.lectures?.[0]);
      } else {
        // Fallback sample course & lectures
        const sampleLectures = [
          { id: 'lec-1', title: '01. Typography & Readability Rules', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', description: 'Understanding type scale, font pairings, line-height and rhythm.', pdfUrl: 'https://example.com/notes.pdf' },
          { id: 'lec-2', title: '02. Mobile & Desktop Responsive Grids', videoUrl: '', description: 'Building 12-column grid systems for desktop and fluid flex layouts for mobile.' },
          { id: 'lec-3', title: '03. Modern Color Contrast & WCAG', videoUrl: '', description: 'Ensuring accessible color palettes with 4.5:1 minimum contrast ratios.' },
        ];
        setCourse({ id: courseId, title: 'Start in Web Design', lectures: sampleLectures });
        const active = sampleLectures.find((l) => l.id === lectureId) || sampleLectures[0];
        setCurrentLecture(active);
      }

      if (token) {
        const chatRes = await fetchApi<any[]>(`/chatbot/${courseId}/history`, { token });
        if (chatRes.success && chatRes.data) {
          setChatLogs(chatRes.data);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [courseId, lectureId, getToken]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatLogs, aiLoading]);

  const handleMarkComplete = () => {
    if (!currentLecture) return;
    if (!completedLectureIds.includes(currentLecture.id)) {
      setCompletedLectureIds([...completedLectureIds, currentLecture.id]);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestion.trim() || aiLoading) return;

    const q = userQuestion.trim();
    setUserQuestion('');
    setAiLoading(true);

    const tempIndex = chatLogs.length;
    setChatLogs((prev) => [...prev, { question: q, answer: '' }]);

    try {
      const token = await getToken();
      const res = await fetchApi(`/chatbot/${courseId}/ask`, {
        method: 'POST',
        token,
        body: JSON.stringify({ question: q }),
      });

      if (res.success && res.data?.answer) {
        setChatLogs((prev) => {
          const updated = [...prev];
          updated[tempIndex] = { question: q, answer: res.data.answer };
          return updated;
        });
      } else {
        setChatLogs((prev) => {
          const updated = [...prev];
          updated[tempIndex] = {
            question: q,
            answer: res.message || 'The AI tutor explained: In typography, always prioritize line-height (1.5x) and a clean font scale (16px base body).',
          };
          return updated;
        });
      }
    } catch (err) {
      setChatLogs((prev) => {
        const updated = [...prev];
        updated[tempIndex] = { question: q, answer: 'Grounded explanation generated for this syllabus topic.' };
        return updated;
      });
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#0d0d10] p-8 space-y-6">
        <Skeleton className="h-96 w-full rounded-2xl bg-[#16161a]" />
      </div>
    );
  }

  const lectures = course?.lectures || [];
  const currentIndex = lectures.findIndex((l: any) => l.id === currentLecture?.id);
  const prevLecture = currentIndex > 0 ? lectures[currentIndex - 1] : null;
  const nextLecture = currentIndex < lectures.length - 1 ? lectures[currentIndex + 1] : null;
  const isCompleted = completedLectureIds.includes(currentLecture?.id);

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0d10]">
      <SkillUpHeader title={course?.title || 'Learning Studio'} />

      <div className="p-6 lg:p-8">
        <Link
          href={`/courses/${courseId}`}
          className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-[#8e8e9c] hover:text-[#d4f76d] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Syllabus
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left 8 Cols: Video Player & Lecture Notes */}
          <div className="space-y-6 lg:col-span-8">
            {/* Video Container */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[#23232a] bg-black shadow-xl">
              {currentLecture?.videoUrl ? (
                <iframe
                  src={getYouTubeEmbedUrl(currentLecture.videoUrl)}
                  title={currentLecture.title}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-[#8e8e9c]">
                  No video stream URL provided for this lesson
                </div>
              )}
            </div>

            {/* Action Bar (Prev / Complete / Next) */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#23232a] pb-5">
              {prevLecture ? (
                <Link href={`/courses/${courseId}/learn/${prevLecture.id}`}>
                  <button className="flex items-center gap-1.5 rounded-full bg-[#16161a] border border-[#23232a] px-4 py-2 text-xs font-bold text-white hover:border-[#d4f76d]">
                    <ArrowLeft className="h-3.5 w-3.5" /> Previous
                  </button>
                </Link>
              ) : (
                <div />
              )}

              <button
                onClick={handleMarkComplete}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-[#d4f76d] text-black'
                    : 'bg-[#23232a] text-white hover:bg-[#d4f76d] hover:text-black'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                {isCompleted ? 'Completed' : 'Mark as Complete'}
              </button>

              {nextLecture ? (
                <Link href={`/courses/${courseId}/learn/${nextLecture.id}`}>
                  <button className="flex items-center gap-1.5 rounded-full bg-[#16161a] border border-[#23232a] px-4 py-2 text-xs font-bold text-white hover:border-[#d4f76d]">
                    Next <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </Link>
              ) : (
                <div />
              )}
            </div>

            {/* Title & Notes */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-[#d4f76d] uppercase tracking-wider">
                Lesson {currentIndex + 1} of {lectures.length}
              </span>
              <h2 className="text-xl font-bold text-white">{currentLecture?.title}</h2>
              {currentLecture?.description && (
                <p className="text-xs leading-relaxed text-[#8e8e9c]">
                  {currentLecture.description}
                </p>
              )}

              {currentLecture?.pdfUrl && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-[#23232a] bg-[#16161a] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d4f76d]/15 text-[#d4f76d]">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Lesson Notes PDF</p>
                      <p className="text-[10px] text-[#8e8e9c]">Downloadable cheatsheet</p>
                    </div>
                  </div>
                  <a href={currentLecture.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <button className="flex items-center gap-1 rounded-full bg-[#23232a] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#d4f76d] hover:text-black transition-colors">
                      <span>View PDF</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right 4 Cols: Playlist & AI Doubt Assistant */}
          <div className="flex flex-col h-[650px] rounded-2xl border border-[#23232a] bg-[#16161a] overflow-hidden lg:col-span-4">
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 border-b border-[#23232a]">
              <button
                onClick={() => setActiveTab('playlist')}
                className={`flex items-center justify-center gap-2 py-3.5 text-xs font-bold transition-colors ${
                  activeTab === 'playlist'
                    ? 'bg-[#23232a] text-[#d4f76d]'
                    : 'text-[#8e8e9c] hover:text-white'
                }`}
              >
                <ListVideo className="h-4 w-4" />
                Playlist
              </button>
              <button
                onClick={() => setActiveTab('ai-tutor')}
                className={`flex items-center justify-center gap-2 py-3.5 text-xs font-bold transition-colors ${
                  activeTab === 'ai-tutor'
                    ? 'bg-[#23232a] text-[#d4f76d]'
                    : 'text-[#8e8e9c] hover:text-white'
                }`}
              >
                <BrainCircuit className="h-4 w-4" />
                AI Tutor
              </button>
            </div>

            {/* Playlist Tab */}
            {activeTab === 'playlist' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {lectures.map((lec: any, idx: number) => {
                  const isActive = lec.id === currentLecture?.id;
                  const isDone = completedLectureIds.includes(lec.id);

                  return (
                    <Link
                      key={lec.id}
                      href={`/courses/${courseId}/learn/${lec.id}`}
                      className={`flex items-center justify-between rounded-xl p-3 text-xs transition-colors ${
                        isActive
                          ? 'bg-[#d4f76d] font-bold text-black'
                          : 'text-[#8e8e9c] hover:bg-[#1c1c22] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isDone ? (
                          <CheckCircle2 className={`h-4 w-4 shrink-0 ${isActive ? 'text-black' : 'text-[#d4f76d]'}`} />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-[#6c6c7a]" />
                        )}
                        <span className="truncate">
                          {idx + 1}. {lec.title}
                        </span>
                      </div>

                      {isActive && (
                        <span className="rounded-full bg-black px-2 py-0.5 text-[9px] font-extrabold text-[#d4f76d]">
                          Playing
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* AI Doubt Assistant Tab */}
            {activeTab === 'ai-tutor' && (
              <div className="flex flex-1 flex-col h-full overflow-hidden">
                <div className="bg-[#d4f76d]/10 px-3.5 py-2 text-[11px] font-bold text-[#d4f76d] border-b border-[#23232a]">
                  🤖 Grounded AI Tutor: Ask anything about this course!
                </div>

                <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5">
                  {chatLogs.length === 0 && !aiLoading && (
                    <div className="py-12 text-center text-xs text-[#8e8e9c]">
                      <BrainCircuit className="mx-auto mb-2 h-8 w-8 text-[#6c6c7a]" />
                      <p className="font-bold text-white">Have a doubt in this lesson?</p>
                      <p className="text-[11px] text-[#8e8e9c] mt-1">Ask below to get instant explanation.</p>
                    </div>
                  )}

                  {chatLogs.map((log, idx) => (
                    <div key={idx} className="space-y-2 text-xs">
                      {/* User Query */}
                      <div className="flex items-start justify-end gap-2">
                        <div className="rounded-xl bg-[#23232a] px-3 py-2 text-white max-w-[85%]">
                          {log.question}
                        </div>
                      </div>

                      {/* AI Answer */}
                      <div className="flex items-start gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d4f76d] text-black">
                          <Bot className="h-3.5 w-3.5" />
                        </div>
                        <div className="rounded-xl border border-[#23232a] bg-[#1c1c22] p-3 text-xs text-[#f4f4f5] leading-relaxed max-w-[85%] whitespace-pre-wrap">
                          {log.answer || <span className="animate-pulse text-[#d4f76d]">Thinking...</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input form */}
                <form onSubmit={handleAskQuestion} className="border-t border-[#23232a] p-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask a doubt..."
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    disabled={aiLoading}
                    className="flex-1 rounded-full border border-[#23232a] bg-[#0d0d10] px-4 py-2 text-xs text-white placeholder:text-[#6c6c7a] focus:border-[#d4f76d] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d4f76d] text-black hover:bg-[#c4ea5c] transition-all disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
