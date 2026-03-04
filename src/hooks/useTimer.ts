'use client';

import { useEffect, useRef } from 'react';
import { useTimerStore } from '@/stores/timerStore';
import { useSettingsStore } from '@/stores/settingsStore';

export function useTimer() {
  const showTimers = useSettingsStore((s) => s.showTimers);
  const {
    matchElapsedMs,
    pointElapsedMs,
    isRunning,
    startMatch,
    startPoint,
    endPoint,
    pauseTimer,
    resumeTimer,
    tick,
    resetAll,
  } = useTimerStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && showTimers) {
      intervalRef.current = setInterval(tick, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, showTimers, tick]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    matchTime: formatTime(matchElapsedMs),
    pointTime: formatTime(pointElapsedMs),
    matchElapsedMs,
    pointElapsedMs,
    isRunning,
    showTimers,
    startMatch,
    startPoint,
    endPoint,
    pauseTimer,
    resumeTimer,
    resetAll,
  };
}
