'use client';

import { create } from 'zustand';

interface TimerState {
  matchStartTime: number | null;
  pointStartTime: number | null;
  matchElapsedMs: number;
  pointElapsedMs: number;
  isRunning: boolean;

  startMatch: () => void;
  startPoint: () => void;
  endPoint: () => number; // returns point duration in ms
  pauseTimer: () => void;
  resumeTimer: () => void;
  tick: () => void;
  resetAll: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  matchStartTime: null,
  pointStartTime: null,
  matchElapsedMs: 0,
  pointElapsedMs: 0,
  isRunning: false,

  startMatch: () => {
    const now = Date.now();
    set({ matchStartTime: now, isRunning: true });
  },

  startPoint: () => {
    set({ pointStartTime: Date.now(), pointElapsedMs: 0 });
  },

  endPoint: () => {
    const { pointStartTime } = get();
    const duration = pointStartTime ? Date.now() - pointStartTime : 0;
    set({ pointStartTime: null, pointElapsedMs: 0 });
    return duration;
  },

  pauseTimer: () => {
    const { matchStartTime, pointStartTime } = get();
    const now = Date.now();
    set({
      isRunning: false,
      matchElapsedMs: matchStartTime ? now - matchStartTime : 0,
      pointElapsedMs: pointStartTime ? now - pointStartTime : 0,
    });
  },

  resumeTimer: () => {
    const { matchElapsedMs, pointElapsedMs } = get();
    const now = Date.now();
    set({
      isRunning: true,
      matchStartTime: now - matchElapsedMs,
      pointStartTime: pointElapsedMs > 0 ? now - pointElapsedMs : null,
    });
  },

  tick: () => {
    const { matchStartTime, pointStartTime, isRunning } = get();
    if (!isRunning) return;
    const now = Date.now();
    set({
      matchElapsedMs: matchStartTime ? now - matchStartTime : 0,
      pointElapsedMs: pointStartTime ? now - pointStartTime : 0,
    });
  },

  resetAll: () => {
    set({
      matchStartTime: null,
      pointStartTime: null,
      matchElapsedMs: 0,
      pointElapsedMs: 0,
      isRunning: false,
    });
  },
}));
