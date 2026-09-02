'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipForward,
  SkipBack,
  Loader2,
} from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  title?: string;
  onEnded?: () => void;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const QUALITIES = [
  { label: '1080p HD', suffix: 'q_80,w_1920' },
  { label: '720p HD', suffix: 'q_70,w_1280' },
  { label: '480p', suffix: 'q_60,w_854' },
  { label: '360p', suffix: 'q_50,w_640' },
  { label: 'Auto', suffix: '' },
];

function buildCloudinaryUrl(src: string, quality: string): string {
  if (!quality || !src.includes('cloudinary.com')) return src;
  // Insert transformation before /upload/
  return src.replace('/upload/', `/upload/${quality}/`);
}

function formatTime(seconds: number): string {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const ss = String(s % 60).padStart(2, '0');
  const mm = String(m % 60).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function VideoPlayer({ src, title, onEnded }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState('Auto');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'speed' | 'quality'>('speed');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(false);

  const qualityEntry = QUALITIES.find((q) => q.label === selectedQuality) || QUALITIES[4];
  const effectiveSrc = buildCloudinaryUrl(src, qualityEntry.suffix);

  // Save current time when quality changes so video resumes at same position
  const [resumeTime, setResumeTime] = useState(0);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.src = effectiveSrc;
    video.currentTime = resumeTime;
    if (playing) video.play();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = muted;
  }, [volume, muted]);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
    resetControlsTimer();
  };

  const seek = (val: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = val;
    setCurrentTime(val);
    resetControlsTimer();
  };

  const skip = (secs: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(video.currentTime + secs, 0), duration);
    resetControlsTimer();
  };

  const toggleMute = () => {
    setMuted((m) => !m);
    resetControlsTimer();
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    resetControlsTimer();
  };

  const changeQuality = (label: string) => {
    setResumeTime(currentTime);
    setSelectedQuality(label);
    setShowSettings(false);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedProgress = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-[#23232a] bg-black shadow-xl select-none"
      onMouseMove={resetControlsTimer}
      onTouchStart={resetControlsTimer}
      onClick={() => {
        if (!showSettings) togglePlay();
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={effectiveSrc}
        className="h-full w-full"
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          setCurrentTime(v.currentTime);
          if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1));
        }}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          setLoading(false);
        }}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setShowControls(true);
          onEnded?.();
        }}
        onContextMenu={(e) => e.preventDefault()}
        controlsList="nodownload"
        playsInline
      />

      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
          <Loader2 className="h-10 w-10 animate-spin text-[#f97316]" />
        </div>
      )}

      {/* Big Center Play Button (shows when paused) */}
      {!playing && !loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm ring-2 ring-white/20">
            <Play className="h-7 w-7 text-white ml-1" />
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${
          showControls || !playing ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        <div className="relative z-10 px-4 pb-3 space-y-2">
          {/* Progress Bar */}
          <div className="group/bar relative h-1.5 w-full cursor-pointer rounded-full bg-white/20"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              seek(pct * duration);
            }}
          >
            {/* Buffered */}
            <div
              className="absolute h-full rounded-full bg-white/30"
              style={{ width: `${bufferedProgress}%` }}
            />
            {/* Played */}
            <div
              className="absolute h-full rounded-full bg-[#f97316]"
              style={{ width: `${progress}%` }}
            />
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-[#f97316] shadow-md opacity-0 group-hover/bar:opacity-100 transition-opacity"
              style={{ left: `calc(${progress}% - 7px)` }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Skip Back 10s */}
              <button
                onClick={() => skip(-10)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors"
                title="Rewind 10s"
              >
                <SkipBack className="h-4 w-4" />
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f97316] text-black hover:bg-[#ea580c] transition-colors"
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>

              {/* Skip Forward 10s */}
              <button
                onClick={() => skip(10)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors"
                title="Forward 10s"
              >
                <SkipForward className="h-4 w-4" />
              </button>

              {/* Volume */}
              <button onClick={toggleMute} className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors">
                {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  setMuted(Number(e.target.value) === 0);
                }}
                className="w-20 accent-[#f97316] cursor-pointer h-1"
              />

              {/* Time */}
              <span className="text-[11px] font-mono text-white/80 tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Speed badge */}
              <span className="text-[10px] font-bold text-[#f97316]">{speed}×</span>

              {/* Settings */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings((s) => !s)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors"
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                </button>

                {showSettings && (
                  <div className="absolute bottom-10 right-0 w-52 rounded-xl border border-[#23232a] bg-[#16161a] shadow-2xl overflow-hidden z-50">
                    {/* Tabs */}
                    <div className="grid grid-cols-2 border-b border-[#23232a]">
                      <button
                        onClick={() => setSettingsTab('speed')}
                        className={`py-2 text-[11px] font-bold transition-colors ${settingsTab === 'speed' ? 'bg-[#f97316]/10 text-[#f97316]' : 'text-[#8e8e9c] hover:text-white'}`}
                      >
                        Speed
                      </button>
                      <button
                        onClick={() => setSettingsTab('quality')}
                        className={`py-2 text-[11px] font-bold transition-colors ${settingsTab === 'quality' ? 'bg-[#f97316]/10 text-[#f97316]' : 'text-[#8e8e9c] hover:text-white'}`}
                      >
                        Quality
                      </button>
                    </div>

                    {/* Speed Options */}
                    {settingsTab === 'speed' && (
                      <div className="py-1">
                        {SPEEDS.map((s) => (
                          <button
                            key={s}
                            onClick={() => { setSpeed(s); setShowSettings(false); }}
                            className={`flex w-full items-center justify-between px-4 py-2 text-xs transition-colors ${speed === s ? 'text-[#f97316] font-bold' : 'text-white hover:bg-[#23232a]'}`}
                          >
                            <span>{s === 1 ? 'Normal' : `${s}×`}</span>
                            {speed === s && <span className="h-1.5 w-1.5 rounded-full bg-[#f97316]" />}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Quality Options */}
                    {settingsTab === 'quality' && (
                      <div className="py-1">
                        {QUALITIES.map((q) => (
                          <button
                            key={q.label}
                            onClick={() => changeQuality(q.label)}
                            className={`flex w-full items-center justify-between px-4 py-2 text-xs transition-colors ${selectedQuality === q.label ? 'text-[#f97316] font-bold' : 'text-white hover:bg-[#23232a]'}`}
                          >
                            <span>{q.label}</span>
                            {selectedQuality === q.label && <span className="h-1.5 w-1.5 rounded-full bg-[#f97316]" />}
                          </button>
                        ))}
                        {!src.includes('cloudinary.com') && (
                          <p className="px-4 pb-2 text-[10px] text-[#8e8e9c]">Quality selector works for Cloudinary uploads only.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
