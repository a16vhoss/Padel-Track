'use client';

import { create } from 'zustand';
import { PlayerId, ShotType, ShotDirection, ShotPower, ShotSpin, ShotStatus } from '@/types/shot';
import { ZoneDestination, WallZoneId } from '@/types/zones';

interface RecordingState {
  player: PlayerId | null;
  shotType: ShotType | null;
  direction: ShotDirection | undefined;
  power: ShotPower;
  spin: ShotSpin;
  wallBounces: WallZoneId[];
  destination: ZoneDestination | null;
  status: ShotStatus;
  quickMode: boolean;
  currentStep: number;

  setPlayer: (p: PlayerId) => void;
  setShotType: (t: ShotType) => void;
  setDirection: (d: ShotDirection | undefined) => void;
  setPower: (p: ShotPower) => void;
  setSpin: (s: ShotSpin) => void;
  toggleWallBounce: (w: WallZoneId) => void;
  setDestination: (d: ZoneDestination | null) => void;
  setStatus: (s: ShotStatus) => void;
  setQuickMode: (q: boolean) => void;
  setCurrentStep: (step: number) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  reset: () => void;
}

function getInitialQuickMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('padel-quick-mode') === 'true';
  } catch {
    return false;
  }
}

const initialState = {
  player: null as PlayerId | null,
  shotType: null as ShotType | null,
  direction: undefined as ShotDirection | undefined,
  power: '' as ShotPower,
  spin: '' as ShotSpin,
  wallBounces: [] as WallZoneId[],
  destination: null as ZoneDestination | null,
  status: '' as ShotStatus,
  currentStep: 0,
};

export const useRecordingStore = create<RecordingState>((set) => ({
  ...initialState,
  quickMode: getInitialQuickMode(),

  setPlayer: (player) => set({ player }),
  setShotType: (shotType) => set({ shotType }),
  setDirection: (direction) => set({ direction }),
  setPower: (power) => set({ power }),
  setSpin: (spin) => set({ spin }),
  toggleWallBounce: (w) =>
    set((state) => ({
      wallBounces: state.wallBounces.includes(w)
        ? state.wallBounces.filter((x) => x !== w)
        : [...state.wallBounces, w],
    })),
  setDestination: (destination) => set({ destination }),
  setStatus: (status) => set({ status }),
  setQuickMode: (quickMode) => {
    try {
      localStorage.setItem('padel-quick-mode', String(quickMode));
    } catch {}
    set({ quickMode });
  },
  setCurrentStep: (currentStep) => set({ currentStep }),
  goToNextStep: () =>
    set((state) => {
      const maxStep = state.quickMode ? 2 : 3;
      return { currentStep: Math.min(state.currentStep + 1, maxStep) };
    }),
  goToPrevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 0),
    })),
  reset: () => set(initialState),
}));
