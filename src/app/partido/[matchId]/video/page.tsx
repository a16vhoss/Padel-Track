'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useMatch } from '@/hooks/useMatch';
import { useVideoStore } from '@/stores/videoStore';
import { VideoUploader } from '@/components/video/VideoUploader';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { VideoControls } from '@/components/video/VideoControls';
import { VideoAnnotationPanel } from '@/components/video/VideoAnnotationPanel';
import { ClipTimeline } from '@/components/video/ClipTimeline';
import { AnnotationsList } from '@/components/video/AnnotationsList';
import { Card } from '@/components/ui/Card';
import { AnimatePresence, motion } from 'framer-motion';

type Tab = 'anotar' | 'clips' | 'lista';

export default function VideoAnalysisPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const { match } = useMatch(matchId);
  const videoUrl = useVideoStore((s) => s.videoUrl);
  const [activeTab, setActiveTab] = useState<Tab>('anotar');

  if (!match) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        <div className="skeleton h-12 rounded-xl" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'anotar', label: 'Anotar' },
    { id: 'clips', label: 'Clips' },
    { id: 'lista', label: 'Historial' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold">Video Analysis</h2>
            <p className="text-[10px] text-muted">
              Body tracking + anotaciones en video
            </p>
          </div>
        </div>
      </Card>

      {/* Upload or Player */}
      {!videoUrl ? (
        <VideoUploader />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Video + Controls (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <VideoPlayer />
            <VideoControls />
            <ClipTimeline />
          </div>

          {/* Right: Annotation panel (1 col) */}
          <div className="space-y-3">
            {/* Tab bar */}
            <div className="flex items-center gap-1 bg-card rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 text-xs py-1.5 rounded-md transition-colors font-medium ${
                    activeTab === tab.id
                      ? 'bg-primary text-black'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === 'anotar' && <VideoAnnotationPanel />}
                {activeTab === 'clips' && <ClipTimeline />}
                {activeTab === 'lista' && <AnnotationsList />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
