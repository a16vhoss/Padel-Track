'use client';

import { useState } from 'react';
import { useVideoStore } from '@/stores/videoStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ClipTimeline() {
  const currentTime = useVideoStore((s) => s.currentTime);
  const duration = useVideoStore((s) => s.duration);
  const clips = useVideoStore((s) => s.clips);
  const activeClipId = useVideoStore((s) => s.activeClipId);
  const annotations = useVideoStore((s) => s.annotations);
  const addClip = useVideoStore((s) => s.addClip);
  const removeClip = useVideoStore((s) => s.removeClip);
  const setActiveClip = useVideoStore((s) => s.setActiveClip);
  const setCurrentTime = useVideoStore((s) => s.setCurrentTime);

  const [isMarking, setIsMarking] = useState(false);
  const [clipStart, setClipStart] = useState(0);

  const seekTo = (time: number) => {
    setCurrentTime(time);
    const video = document.querySelector('video');
    if (video) video.currentTime = time;
  };

  const handleStartClip = () => {
    setClipStart(currentTime);
    setIsMarking(true);
  };

  const handleEndClip = () => {
    const end = currentTime;
    if (end <= clipStart) return;
    const pointNum = clips.length + 1;
    addClip(clipStart, end, `Punto ${pointNum}`);
    setIsMarking(false);
  };

  const handleCancelClip = () => {
    setIsMarking(false);
  };

  return (
    <div className="space-y-3">
      {/* Clip marking controls */}
      <div className="flex items-center gap-2">
        {!isMarking ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStartClip}
            className="flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
              <line x1="7" y1="2" x2="7" y2="22" />
              <line x1="17" y1="2" x2="17" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="2" y1="7" x2="7" y2="7" />
              <line x1="2" y1="17" x2="7" y2="17" />
              <line x1="17" y1="7" x2="22" y2="7" />
              <line x1="17" y1="17" x2="22" y2="17" />
            </svg>
            Marcar inicio de punto
          </Button>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-1.5 text-xs text-accent">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Inicio: {formatTime(clipStart)}
            </div>
            <Button variant="primary" size="sm" onClick={handleEndClip}>
              Marcar fin
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancelClip}>
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {/* Clips list */}
      {clips.length > 0 && (
        <Card className="p-2 space-y-1.5">
          <p className="text-[10px] text-muted font-semibold mb-1">
            Clips ({clips.length})
          </p>
          {clips.map((clip) => {
            const clipAnnotations = annotations.filter((a) => a.clipId === clip.id);
            const isActive = activeClipId === clip.id;

            return (
              <div
                key={clip.id}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-primary/15 ring-1 ring-primary/40'
                    : 'bg-card-hover hover:bg-card-hover/80'
                }`}
                onClick={() => {
                  setActiveClip(isActive ? null : clip.id);
                  seekTo(clip.startTime);
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold truncate">{clip.label}</span>
                    {clipAnnotations.length > 0 && (
                      <span className="text-[9px] bg-primary/20 text-primary px-1 rounded">
                        {clipAnnotations.length} anot.
                      </span>
                    )}
                  </div>
                  <span className="text-muted">
                    {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                    <span className="ml-1">({formatTime(clip.endTime - clip.startTime)})</span>
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeClip(clip.id);
                  }}
                  className="text-muted hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            );
          })}
        </Card>
      )}

      {/* Visual timeline */}
      {clips.length > 0 && duration > 0 && (
        <div className="relative h-6 bg-border/50 rounded-full overflow-hidden">
          {clips.map((clip) => {
            const left = (clip.startTime / duration) * 100;
            const width = ((clip.endTime - clip.startTime) / duration) * 100;
            const isActive = activeClipId === clip.id;

            return (
              <div
                key={clip.id}
                className={`absolute top-0 h-full rounded-full cursor-pointer transition-all ${
                  isActive ? 'bg-primary/60' : 'bg-primary/25 hover:bg-primary/40'
                }`}
                style={{ left: `${left}%`, width: `${width}%` }}
                onClick={() => {
                  setActiveClip(isActive ? null : clip.id);
                  seekTo(clip.startTime);
                }}
                title={clip.label}
              />
            );
          })}
          {/* Playhead */}
          <div
            className="absolute top-0 w-0.5 h-full bg-white"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
