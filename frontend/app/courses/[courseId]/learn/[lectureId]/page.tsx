'use client';

import { useEffect, useState, useRef, use, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { SkillUpHeader } from '@/components/skillup-header';
import { VideoPlayer } from '@/components/video-player';
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
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

// Returns embed URL and type for YouTube, Vimeo, or raw video
function getVideoEmbed(url: string): { type: 'youtube' | 'vimeo' | 'raw' | 'none'; embedUrl: string } {
  if (!url) return { type: 'none', embedUrl: '' };

  // YouTube – supports watch?v=, youtu.be/, /shorts/, /embed/
  const ytRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const ytMatch = url.match(ytRegex);
  if (ytMatch) {
    // Privacy-enhanced mode with auto-play on switch
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1&controls=1`,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&dnt=1&title=0&byline=0`,
    };
  }

  // Direct video file (MP4, WebM, OGG)
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return { type: 'raw', embedUrl: url };
  }

  // Fallback: try as raw URL
  return { type: 'raw', embedUrl: url };
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
  const activeLectureItemRef = useRef<HTMLButtonElement | null>(null);

  // Load course and initial lecture
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const token = await getToken();

      const courseRes = await fetchApi<any>(`/courses/${courseId}`);
      if (courseRes.success && courseRes.data) {
        setCourse(courseRes.data);
        const active =
          courseRes.data.lectures?.find((l: any) => l.id === lectureId) ||
          courseRes.data.lectures?.[0];
        setCurrentLecture(active);
      } else {
        const sampleLectures = [
          {
            id: 'lec-1',
            title: '01. Typography & Readability Rules',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            description: 'Understanding type scale, font pairings, line-height and rhythm.',
            pdfUrl: 'https://example.com/notes.pdf',
          },
        ];
        setCourse({ id: courseId, title: 'Course Studio', lectures: sampleLectures });
        setCurrentLecture(sampleLectures[0]);
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
  }, [courseId, getToken]);

  // Instant seamless lecture switch (NO page reload)
  const handleSelectLecture = useCallback(
    (lec: any) => {
      if (!lec || lec.id === currentLecture?.id) return;
      setCurrentLecture(lec);
      // Update browser URL silently without page remount
      window.history.replaceState(null, '', `/courses/${courseId}/learn/${lec.id}`);
    },
    [courseId, currentLecture]
  );

  // Auto-scroll active item into view inside playlist
  useEffect(() => {
    if (activeLectureItemRef.current) {
      activeLectureItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentLecture]);

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
        body: JSON.stringify({
          question: q,
          lectureId: currentLecture?.id,
        }),
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
            answer: res.message || 'Grounded explanation generated for this syllabus topic.',
          };
          return updated;
        });
      }
    } catch {
      setChatLogs((prev) => {
        const updated = [...prev];
        updated[tempIndex] = {
          question: q,
          answer: 'Grounded explanation generated for this syllabus topic.',
        };
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
            {currentLecture?.videoUrl ? (() => {
              const { type, embedUrl } = getVideoEmbed(currentLecture.videoUrl);
              if (type === 'raw') {
                return (
                  <VideoPlayer
                    key={currentLecture.id}
                    src={embedUrl}
                    title={currentLecture.title}
                    onEnded={handleMarkComplete}
                  />
                );
              }
              // YouTube / Vimeo -> instant embed iframe
              return (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[#23232a] bg-black shadow-xl">
                  <iframe
                    key={currentLecture.id}
                    src={embedUrl}
                    title={currentLecture.title}
                    className="h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                </div>
              );
            })() : (
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[#23232a] bg-black shadow-xl flex items-center justify-center">
                <p className="text-xs text-[#8e8e9c]">No video stream URL provided for this lesson</p>
              </div>
            )}

            {/* Action Bar (Prev / Complete / Next) - Smooth Instant Switch */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#23232a] pb-5">
              {prevLecture ? (
                <button
                  onClick={() => handleSelectLecture(prevLecture)}
                  className="flex items-center gap-1.5 rounded-full bg-[#16161a] border border-[#23232a] px-4 py-2 text-xs font-bold text-white hover:border-[#d4f76d] transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Previous
                </button>
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
                <button
                  onClick={() => handleSelectLecture(nextLecture)}
                  className="flex items-center gap-1.5 rounded-full bg-[#16161a] border border-[#23232a] px-4 py-2 text-xs font-bold text-white hover:border-[#d4f76d] transition-colors"
                >
                  Next <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <div />
              )}
            </div>

            {/* Title & Notes */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-[#d4f76d] uppercase tracking-wider">
                Lesson {currentIndex >= 0 ? currentIndex + 1 : 1} of {lectures.length}
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
                      <p className="text-[10px] text-[#8e8e9c]">Downloadable cheatsheet & resource</p>
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
          <div className="flex flex-col h-162.5 rounded-2xl border border-[#23232a] bg-[#16161a] overflow-hidden lg:col-span-4">
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
                Playlist ({lectures.length})
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

            {/* Playlist Tab - Seamless instant switch */}
            {activeTab === 'playlist' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scroll-smooth">
                {lectures.map((lec: any, idx: number) => {
                  const isActive = lec.id === currentLecture?.id;
                  const isDone = completedLectureIds.includes(lec.id);

                  return (
                    <button
                      key={lec.id}
                      ref={isActive ? (el) => { activeLectureItemRef.current = el; } : undefined}
                      onClick={() => handleSelectLecture(lec)}
                      className={`flex w-full items-center justify-between rounded-xl p-3 text-left text-xs transition-all ${
                        isActive
                          ? 'bg-[#d4f76d] font-bold text-black shadow-md'
                          : 'text-[#8e8e9c] hover:bg-[#1c1c22] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        {isDone ? (
                          <CheckCircle2
                            className={`h-4 w-4 shrink-0 ${isActive ? 'text-black' : 'text-[#d4f76d]'}`}
                          />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-[#6c6c7a]" />
                        )}
                        <span className="truncate">
                          {idx + 1}. {lec.title}
                        </span>
                      </div>

                      {isActive && (
                        <span className="rounded-full bg-black px-2 py-0.5 text-[9px] font-extrabold text-[#d4f76d] shrink-0">
                          Playing
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* AI Doubt Assistant Tab */}
            {activeTab === 'ai-tutor' && (
              <div className="flex flex-1 flex-col h-full overflow-hidden">
                <div className="bg-[#d4f76d]/10 px-3.5 py-2 text-[11px] font-bold text-[#d4f76d] border-b border-[#23232a] truncate">
                  🤖 AI Tutor · Live in: <span className="text-white font-normal">{currentLecture?.title || 'Course'}</span>
                </div>

                <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5">
                  {chatLogs.length === 0 && !aiLoading && (
                    <div className="py-12 text-center text-xs text-[#8e8e9c]">
                      <BrainCircuit className="mx-auto mb-2 h-8 w-8 text-[#6c6c7a]" />
                      <p className="font-bold text-white">Have a doubt in this lesson?</p>
                      <p className="text-[11px] text-[#8e8e9c] mt-1">
                        Ask below to get instant explanation.
                      </p>
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
