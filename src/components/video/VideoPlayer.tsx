'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useVideoStore } from '@/stores/videoStore';
import { initPoseDetection, detectPoses, disposePoseDetection } from '@/lib/video/poseDetection';
import {
  drawSkeleton,
  drawBoundingBoxes,
  drawPaddleEstimate,
  drawCourtOverlay,
  drawCalibrationGuide,
  drawAnnotationMarkers,
} from '@/lib/video/drawOverlays';

export function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const videoUrl = useVideoStore((s) => s.videoUrl);
  const isPlaying = useVideoStore((s) => s.isPlaying);
  const playbackRate = useVideoStore((s) => s.playbackRate);
  const overlayMode = useVideoStore((s) => s.overlayMode);
  const showPaddle = useVideoStore((s) => s.showPaddle);
  const showCourt = useVideoStore((s) => s.showCourt);
  const courtCalibration = useVideoStore((s) => s.courtCalibration);
  const isCalibrating = useVideoStore((s) => s.isCalibrating);
  const calibrationStep = useVideoStore((s) => s.calibrationStep);
  const isDetecting = useVideoStore((s) => s.isDetecting);
  const annotations = useVideoStore((s) => s.annotations);
  const duration = useVideoStore((s) => s.duration);

  const setIsPlaying = useVideoStore((s) => s.setIsPlaying);
  const setCurrentTime = useVideoStore((s) => s.setCurrentTime);
  const setDuration = useVideoStore((s) => s.setDuration);
  const setPoses = useVideoStore((s) => s.setPoses);
  const setIsDetecting = useVideoStore((s) => s.setIsDetecting);
  const setCalibrationPoint = useVideoStore((s) => s.setCalibrationPoint);

  // Initialize pose detection
  useEffect(() => {
    if (!videoUrl) return;
    let cancelled = false;

    initPoseDetection()
      .then(() => {
        if (!cancelled) setIsDetecting(true);
      })
      .catch((err) => {
        console.error('Pose detection init failed:', err);
        setIsDetecting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [videoUrl, setIsDetecting]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disposePoseDetection();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Sync playback rate
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Render loop
  const renderFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.paused && !video.seeking) {
      rafRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas to video display size
    const rect = video.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Detect poses
    if (isDetecting && !video.paused) {
      const timestampMs = performance.now();
      const poses = detectPoses(video, timestampMs);
      if (poses.length > 0) {
        setPoses(poses);
      }
    }

    // Get current poses from store for drawing (works for paused too)
    const store = useVideoStore.getState();
    const currentPoses = store.poses;

    // Draw overlays
    if (overlayMode === 'skeleton' && currentPoses.length > 0) {
      drawSkeleton(ctx, currentPoses, w, h);
    } else if (overlayMode === 'boundingBox' && currentPoses.length > 0) {
      drawBoundingBoxes(ctx, currentPoses, w, h);
    }

    // Paddle estimate
    if (showPaddle && currentPoses.length > 0) {
      drawPaddleEstimate(ctx, currentPoses, w, h);
    }

    // Court overlay
    if (showCourt && courtCalibration && !isCalibrating) {
      drawCourtOverlay(ctx, courtCalibration, w, h);
    }

    // Calibration guide
    if (isCalibrating) {
      drawCalibrationGuide(ctx, calibrationStep, courtCalibration, w, h);
    }

    // Annotation markers
    if (annotations.length > 0) {
      drawAnnotationMarkers(
        ctx,
        annotations,
        video.currentTime,
        w,
        h,
        store.duration
      );
    }

    // Update current time
    setCurrentTime(video.currentTime);

    rafRef.current = requestAnimationFrame(renderFrame);
  }, [isDetecting, overlayMode, showPaddle, showCourt, courtCalibration, isCalibrating, calibrationStep, annotations, setPoses, setCurrentTime, duration]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [renderFrame]);

  // Play/pause sync
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  }, [isPlaying, setIsPlaying]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCalibrating) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setCalibrationPoint(calibrationStep, { x, y });
  };

  if (!videoUrl) return null;

  return (
    <div ref={containerRef} className="relative w-full rounded-xl overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full block"
        playsInline
        preload="auto"
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          setDuration(v.duration);
        }}
        onEnded={() => setIsPlaying(false)}
        onSeeked={() => {
          // Trigger a re-detect on seek
          const video = videoRef.current;
          if (video && isDetecting) {
            const poses = detectPoses(video, performance.now());
            if (poses.length > 0) setPoses(poses);
          }
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto"
        style={{ cursor: isCalibrating ? 'crosshair' : 'default' }}
        onClick={handleCanvasClick}
      />
      {/* Detection status badge */}
      {isDetecting && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/70 rounded-full px-2.5 py-1">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] text-white font-medium">Pose AI</span>
        </div>
      )}
    </div>
  );
}
