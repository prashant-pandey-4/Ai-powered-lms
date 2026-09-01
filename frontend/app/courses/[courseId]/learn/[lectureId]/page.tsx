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
              // YouTube / Vimeo
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

            {/* Action Bar (Prev / Complete / Next) */}
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
          <div className="flex flex-col h-162.5 rounded-2xl border border-[#23232a] bg-[#16161a] overflow-hidden lg:col-span-4 shadow-2xl">
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
                <BrainCircuit className="h-4 w-4 text-[#d4f76d]" />
                AI Tutor
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
                {/* Chat Log Area */}
                <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatLogs.length === 0 && !aiLoading && (
                    <div className="py-10 text-center text-xs text-[#8e8e9c] space-y-3">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d4f76d]/15 text-[#d4f76d]">
                        <BrainCircuit className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">Ask any doubt</p>
                        <p className="text-[11px] text-[#8e8e9c] mt-0.5">
                          Instant explanation and code help for this video.
                        </p>
                      </div>

                      {/* Quick Prompt Pills */}
                      <div className="pt-2 flex flex-col gap-1.5">
                        {quickPrompts.map((prompt, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => askAi(prompt)}
                            className="rounded-xl border border-[#23232a] bg-[#16161a] px-3 py-2 text-left text-[11px] text-[#f4f4f5] hover:border-[#d4f76d] hover:text-[#d4f76d] transition-colors"
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
                        <div className="rounded-2xl bg-[#23232a] px-4 py-2.5 text-white max-w-[85%] font-medium">
                          {log.question}
                        </div>
                      </div>

                      {/* AI Mentor Answer */}
                      <div className="flex items-start gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d4f76d] text-black shadow-md">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="group relative flex-1 rounded-2xl border border-[#23232a] bg-[#1c1c22] p-4 text-xs text-[#f4f4f5] leading-relaxed shadow-lg">
                          <div className="whitespace-pre-wrap font-sans">
                            {log.answer}
                          </div>

                          {/* Copy Button */}
                          {log.answer && (
                            <button
                              onClick={() => copyToClipboard(log.answer, idx)}
                              className="absolute top-3 right-3 rounded-lg border border-[#23232a] bg-[#16161a] p-1.5 text-[#8e8e9c] opacity-0 group-hover:opacity-100 hover:text-white transition-all"
                              title="Copy answer"
                            >
                              {copiedIndex === idx ? (
                                <Check className="h-3 w-3 text-[#d4f76d]" />
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
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d4f76d] text-black animate-pulse shadow-md">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="rounded-2xl border border-[#23232a] bg-[#16161a] p-3 text-xs text-[#d4f76d] flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#d4f76d] animate-ping" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Prompts Bar (When chat is active) */}
                {chatLogs.length > 0 && !aiLoading && (
                  <div className="px-3 py-1.5 border-t border-[#23232a] flex gap-1.5 overflow-x-auto no-scrollbar bg-[#121216]">
                    {quickPrompts.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => askAi(p)}
                        className="shrink-0 rounded-full border border-[#23232a] bg-[#16161a] px-2.5 py-1 text-[10px] text-[#8e8e9c] hover:border-[#d4f76d] hover:text-white transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input Form */}
                <form onSubmit={handleAskQuestion} className="border-t border-[#23232a] p-3 flex gap-2 bg-[#16161a]">
                  <input
                    type="text"
                    placeholder="Ask a doubt about this lesson..."
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    disabled={aiLoading}
                    className="flex-1 rounded-full border border-[#23232a] bg-[#0d0d10] px-4 py-2 text-xs text-white placeholder:text-[#6c6c7a] focus:border-[#d4f76d] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !userQuestion.trim()}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d4f76d] text-black hover:bg-[#c4ea5c] transition-all disabled:opacity-40"
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
