'use client';

import { useRef, useCallback } from 'react';
import { useVideoStore } from '@/stores/videoStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function VideoUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const setVideoUrl = useVideoStore((s) => s.setVideoUrl);
  const videoUrl = useVideoStore((s) => s.videoUrl);
  const videoFileName = useVideoStore((s) => s.videoFileName);
  const reset = useVideoStore((s) => s.reset);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('video/')) return;
      const url = URL.createObjectURL(file);
      setVideoUrl(url, file.name);
    },
    [setVideoUrl]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  if (videoUrl) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
          <span className="text-muted truncate">{videoFileName || 'Video cargado'}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={reset}>
          Cambiar
        </Button>
      </div>
    );
  }

  return (
    <Card
      className="border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer"
      onDrop={handleDrop}
      onDragOver={(e: React.DragEvent) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
    >
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold">Sube un video de partido</p>
          <p className="text-xs text-muted mt-1">
            Arrastra o haz clic para seleccionar
          </p>
          <p className="text-[10px] text-muted mt-0.5">
            MP4, MOV, WebM
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleChange}
      />
    </Card>
  );
}
