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
  Copy,
  Check,
  Flame,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

// Returns embed URL and type for YouTube, Vimeo, or raw video
function getVideoEmbed(url: string): { type: 'youtube' | 'vimeo' | 'raw' | 'none'; embedUrl: string } {
  if (!url) return { type: 'none', embedUrl: '' };

  const ytRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const ytMatch = url.match(ytRegex);
  if (ytMatch) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1&controls=1`,
    };
  }

  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&dnt=1&title=0&byline=0`,
    };
  }

  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return { type: 'raw', embedUrl: url };
  }

  return { type: 'raw', embedUrl: url };
}

const quickPrompts = [
  'Summarize this lesson in 3 key points',
  'Explain with a simple code example',
  'What is a common interview question on this topic?',
];

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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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
            title: 'Episode 01: Typography & Readability Rules',
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

  // Instant seamless lecture switch
  const handleSelectLecture = useCallback(
    (lec: any) => {
      if (!lec || lec.id === currentLecture?.id) return;
      setCurrentLecture(lec);
      window.history.replaceState(null, '', `/courses/${courseId}/learn/${lec.id}`);
    },
    [courseId, currentLecture]
  );

  // Auto-scroll active item in playlist
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

  const askAi = async (questionText: string) => {
    if (!questionText.trim() || aiLoading) return;

    setUserQuestion('');
    setAiLoading(true);

    const tempIndex = chatLogs.length;
    setChatLogs((prev) => [...prev, { question: questionText, answer: '' }]);

    try {
      const token = await getToken();
      const res = await fetchApi(`/chatbot/${courseId}/ask`, {
        method: 'POST',
        token,
        body: JSON.stringify({
          question: questionText,
          lectureId: currentLecture?.id,
        }),
      });

      const finalAnswer =
        res.success && res.data?.answer
          ? res.data.answer
          : res.message || 'Here is the explanation for this topic. Try testing with small examples first.';

      setChatLogs((prev) => {
        const updated = [...prev];
        updated[tempIndex] = { question: questionText, answer: finalAnswer };
        return updated;
      });
    } catch {
      setChatLogs((prev) => {
        const updated = [...prev];
        updated[tempIndex] = {
          question: questionText,
          answer: 'Please review the core logic taught in this lecture and test with simple cases.',
        };
        return updated;
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    askAi(userQuestion);
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#060709] p-8 space-y-6">
        <Skeleton className="h-96 w-full rounded-2xl bg-[#111217]" />
      </div>
    );
  }

  const lectures = course?.lectures || [];
  const currentIndex = lectures.findIndex((l: any) => l.id === currentLecture?.id);
  const prevLecture = currentIndex > 0 ? lectures[currentIndex - 1] : null;
  const nextLecture = currentIndex < lectures.length - 1 ? lectures[currentIndex + 1] : null;
  const isCompleted = completedLectureIds.includes(currentLecture?.id);

  return (
    <div className="flex min-h-screen flex-col bg-[#060709] bg-grid-pattern">
      <SkillUpHeader title={course?.title || 'Learning Studio'} />

      <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-6">
        <Link
          href={`/courses/${courseId}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#9ca3af] hover:text-[#f97316] transition-colors"
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
              // YouTube / Vimeo
              return (
                <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-[#22232a] bg-black shadow-2xl">
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
              <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-[#22232a] bg-black shadow-2xl flex items-center justify-center">
                <p className="text-xs text-[#9ca3af]">No video stream URL provided for this lesson</p>
              </div>
            )}

            {/* Action Bar (Prev / Complete / Next) */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#22232a] pb-5">
              {prevLecture ? (
                <button
                  onClick={() => handleSelectLecture(prevLecture)}
                  className="flex items-center gap-1.5 rounded-full bg-[#111217] border border-[#22232a] px-4 py-2 text-xs font-bold text-white hover:border-[#f97316] transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Previous
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleMarkComplete}
                className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-[#f97316] text-white shadow-lg shadow-[#f97316]/25'
                    : 'bg-[#17181f] border border-[#22232a] text-white hover:bg-[#f97316] hover:text-white'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                {isCompleted ? 'Lesson Completed' : 'Mark as Complete'}
              </button>

              {nextLecture ? (
                <button
                  onClick={() => handleSelectLecture(nextLecture)}
                  className="flex items-center gap-1.5 rounded-full bg-[#111217] border border-[#22232a] px-4 py-2 text-xs font-bold text-white hover:border-[#f97316] transition-colors"
                >
                  Next <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <div />
              )}
            </div>

            {/* Title & Notes */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-[#f97316] uppercase tracking-wider">
                Episode {currentIndex >= 0 ? currentIndex + 1 : 1} of {lectures.length}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">{currentLecture?.title}</h2>
              {currentLecture?.description && (
                <p className="text-xs sm:text-sm leading-relaxed text-[#9ca3af]">
                  {currentLecture.description}
                </p>
              )}

              {currentLecture?.pdfUrl && (
                <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#22232a] bg-[#111217] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f97316]/15 text-[#f97316]">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Lesson Notes & Cheatsheet PDF</p>
                      <p className="text-[10px] text-[#9ca3af]">Downloadable code & interview notes</p>
                    </div>
                  </div>
                  <a href={currentLecture.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <button className="flex items-center gap-1 rounded-full bg-[#17181f] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#f97316] hover:text-white transition-colors border border-[#22232a]">
                      <span>View PDF</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right 4 Cols: Playlist & AI Doubt Assistant */}
          <div className="flex flex-col h-162.5 rounded-3xl border border-[#22232a] bg-[#111217] overflow-hidden lg:col-span-4 shadow-2xl">
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 border-b border-[#22232a]">
              <button
                onClick={() => setActiveTab('playlist')}
                className={`flex items-center justify-center gap-2 py-3.5 text-xs font-bold transition-colors ${
                  activeTab === 'playlist'
                    ? 'bg-[#17181f] text-[#f97316] border-b-2 border-[#f97316]'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                <ListVideo className="h-4 w-4" />
                Syllabus ({lectures.length})
              </button>
              <button
                onClick={() => setActiveTab('ai-tutor')}
                className={`flex items-center justify-center gap-2 py-3.5 text-xs font-bold transition-colors ${
                  activeTab === 'ai-tutor'
                    ? 'bg-[#17181f] text-[#f97316] border-b-2 border-[#f97316]'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                <BrainCircuit className="h-4 w-4 text-[#f97316]" />
                AI Mentor
              </button>
            </div>

            {/* Playlist Tab */}
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
                          ? 'bg-gradient-to-r from-[#f97316] to-[#ea580c] font-bold text-white shadow-lg shadow-[#f97316]/25'
                          : 'text-[#9ca3af] hover:bg-[#17181f] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        {isDone ? (
                          <CheckCircle2
                            className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-[#f97316]'}`}
                          />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-[#6b7280]" />
                        )}
                        <span className="truncate">
                          {idx + 1}. {lec.title}
                        </span>
                      </div>

                      {isActive && (
                        <span className="rounded-full bg-black/40 px-2 py-0.5 text-[9px] font-extrabold text-white shrink-0">
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
                {/* Chat Log Area */}
                <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatLogs.length === 0 && !aiLoading && (
                    <div className="py-10 text-center text-xs text-[#9ca3af] space-y-3">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f97316]/15 text-[#f97316]">
                        <BrainCircuit className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">Ask any coding doubt</p>
                        <p className="text-[11px] text-[#9ca3af] mt-0.5">
                          Instant explanation & code help for this video.
                        </p>
                      </div>

                      {/* Quick Prompt Pills */}
                      <div className="pt-2 flex flex-col gap-1.5">
                        {quickPrompts.map((prompt, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => askAi(prompt)}
                            className="rounded-xl border border-[#22232a] bg-[#17181f] px-3 py-2 text-left text-[11px] text-[#f4f4f5] hover:border-[#f97316] hover:text-[#f97316] transition-colors"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {chatLogs.map((log, idx) => (
                    <div key={idx} className="space-y-2 text-xs">
                      {/* User Query */}
                      <div className="flex items-start justify-end gap-2">
                        <div className="rounded-2xl bg-[#22232a] px-4 py-2.5 text-white max-w-[85%] font-medium">
                          {log.question}
                        </div>
                      </div>

                      {/* AI Mentor Answer */}
                      <div className="flex items-start gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f97316] text-white shadow-md">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="group relative flex-1 rounded-2xl border border-[#22232a] bg-[#17181f] p-4 text-xs text-[#f4f4f5] leading-relaxed shadow-lg">
                          <div className="whitespace-pre-wrap font-sans">
                            {log.answer}
                          </div>

                          {/* Copy Button */}
                          {log.answer && (
                            <button
                              onClick={() => copyToClipboard(log.answer, idx)}
                              className="absolute top-3 right-3 rounded-lg border border-[#22232a] bg-[#111217] p-1.5 text-[#9ca3af] opacity-0 group-hover:opacity-100 hover:text-white transition-all"
                              title="Copy answer"
                            >
                              {copiedIndex === idx ? (
                                <Check className="h-3 w-3 text-[#f97316]" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Thinking Indicator */}
                  {aiLoading && (
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f97316] text-white animate-pulse shadow-md">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="rounded-2xl border border-[#22232a] bg-[#17181f] p-3 text-xs text-[#f97316] flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#f97316] animate-ping" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Prompts Bar */}
                {chatLogs.length > 0 && !aiLoading && (
                  <div className="px-3 py-1.5 border-t border-[#22232a] flex gap-1.5 overflow-x-auto no-scrollbar bg-[#0f1014]">
                    {quickPrompts.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => askAi(p)}
                        className="shrink-0 rounded-full border border-[#22232a] bg-[#17181f] px-2.5 py-1 text-[10px] text-[#9ca3af] hover:border-[#f97316] hover:text-white transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input Form */}
                <form onSubmit={handleAskQuestion} className="border-t border-[#22232a] p-3 flex gap-2 bg-[#111217]">
                  <input
                    type="text"
                    placeholder="Ask a doubt about this lesson..."
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    disabled={aiLoading}
                    className="flex-1 rounded-full border border-[#22232a] bg-[#060709] px-4 py-2 text-xs text-white placeholder:text-[#6b7280] focus:border-[#f97316] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !userQuestion.trim()}
                    className="flex h-9 w-9 items-center justify-center rounded-full glow-amber-btn text-white hover:scale-105 transition-all disabled:opacity-40"
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
