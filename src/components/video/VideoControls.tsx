'use client';

import { useRef, useCallback } from 'react';
import { useVideoStore } from '@/stores/videoStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VideoControls() {
  const seekBarRef = useRef<HTMLDivElement>(null);

  const isPlaying = useVideoStore((s) => s.isPlaying);
  const currentTime = useVideoStore((s) => s.currentTime);
  const duration = useVideoStore((s) => s.duration);
  const playbackRate = useVideoStore((s) => s.playbackRate);
  const overlayMode = useVideoStore((s) => s.overlayMode);
  const showPaddle = useVideoStore((s) => s.showPaddle);
  const showCourt = useVideoStore((s) => s.showCourt);
  const isCalibrating = useVideoStore((s) => s.isCalibrating);
  const clips = useVideoStore((s) => s.clips);

  const setIsPlaying = useVideoStore((s) => s.setIsPlaying);
  const setCurrentTime = useVideoStore((s) => s.setCurrentTime);
  const setPlaybackRate = useVideoStore((s) => s.setPlaybackRate);
  const setOverlayMode = useVideoStore((s) => s.setOverlayMode);
  const togglePaddle = useVideoStore((s) => s.togglePaddle);
  const toggleCourt = useVideoStore((s) => s.toggleCourt);
  const setIsCalibrating = useVideoStore((s) => s.setIsCalibrating);

  const seekTo = useCallback(
    (time: number) => {
      setCurrentTime(time);
      // Seek the actual video element
      const video = document.querySelector('video');
      if (video) video.currentTime = time;
    },
    [setCurrentTime]
  );

  const handleSeekBarClick = (e: React.MouseEvent) => {
    const bar = seekBarRef.current;
    if (!bar || duration <= 0) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTo(ratio * duration);
  };

  const stepFrame = (direction: number) => {
    seekTo(Math.max(0, Math.min(duration, currentTime + direction * (1 / 30))));
  };

  const skip = (seconds: number) => {
    seekTo(Math.max(0, Math.min(duration, currentTime + seconds)));
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const rates = [0.25, 0.5, 1, 1.5, 2];

  return (
    <Card className="p-3 space-y-3">
      {/* Seek bar with clip markers */}
      <div className="space-y-1">
        <div
          ref={seekBarRef}
          className="relative h-3 bg-border rounded-full cursor-pointer group"
          onClick={handleSeekBarClick}
        >
          {/* Clip regions */}
          {clips.map((clip) => (
            <div
              key={clip.id}
              className="absolute top-0 h-full bg-accent/30 rounded-full"
              style={{
                left: `${(clip.startTime / duration) * 100}%`,
                width: `${((clip.endTime - clip.startTime) / duration) * 100}%`,
              }}
            />
          ))}
          {/* Progress */}
          <div
            className="absolute top-0 left-0 h-full bg-primary rounded-full transition-[width] duration-75"
            style={{ width: `${progress}%` }}
          />
          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow border-2 border-primary transition-[left] duration-75 group-hover:scale-125"
            style={{ left: `calc(${progress}% - 8px)` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback controls */}
      <div className="flex items-center justify-center gap-1">
        <button onClick={() => skip(-10)} className="p-1.5 text-muted hover:text-foreground" title="-10s">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 17l-5-5 5-5" /><path d="M18 17l-5-5 5-5" />
          </svg>
        </button>
        <button onClick={() => stepFrame(-1)} className="p-1.5 text-muted hover:text-foreground" title="Frame anterior">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center hover:bg-primary/90 transition-colors"
        >
          {isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          )}
        </button>

        <button onClick={() => stepFrame(1)} className="p-1.5 text-muted hover:text-foreground" title="Frame siguiente">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        <button onClick={() => skip(10)} className="p-1.5 text-muted hover:text-foreground" title="+10s">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 17l5-5-5-5" /><path d="M6 17l5-5-5-5" />
          </svg>
        </button>
      </div>

      {/* Speed + Overlays */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Speed */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted">Vel:</span>
          {rates.map((rate) => (
            <button
              key={rate}
              onClick={() => setPlaybackRate(rate)}
              className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                playbackRate === rate
                  ? 'bg-primary text-black font-bold'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-border" />

        {/* Overlay toggles */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setOverlayMode(overlayMode === 'skeleton' ? 'off' : 'skeleton')}
            className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
              overlayMode === 'skeleton' ? 'bg-primary/20 text-primary font-bold' : 'text-muted hover:text-foreground'
            }`}
          >
            Skeleton
          </button>
          <button
            onClick={() => setOverlayMode(overlayMode === 'boundingBox' ? 'off' : 'boundingBox')}
            className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
              overlayMode === 'boundingBox' ? 'bg-primary/20 text-primary font-bold' : 'text-muted hover:text-foreground'
            }`}
          >
            BBox
          </button>
          <button
            onClick={togglePaddle}
            className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
              showPaddle ? 'bg-accent/20 text-accent font-bold' : 'text-muted hover:text-foreground'
            }`}
          >
            Pala
          </button>
          <button
            onClick={() => {
              if (!showCourt) {
                toggleCourt();
                if (!useVideoStore.getState().courtCalibration) {
                  setIsCalibrating(true);
                }
              } else {
                toggleCourt();
              }
            }}
            className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
              showCourt ? 'bg-primary/20 text-primary font-bold' : 'text-muted hover:text-foreground'
            }`}
          >
            Cancha
          </button>
          {showCourt && (
            <button
              onClick={() => setIsCalibrating(true)}
              className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                isCalibrating ? 'bg-accent text-black font-bold' : 'text-muted hover:text-foreground'
              }`}
            >
              Recalibrar
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
