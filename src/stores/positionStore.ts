'use client';

import { create } from 'zustand';
import { PlayerId, AllPlayerPositions, PlayerCoords } from '@/types/shot';
import { DEFAULT_POSITIONS } from '@/lib/positions/inferPositions';

interface PositionState {
  positions: AllPlayerPositions;
  trackingEnabled: boolean;
  needsManualInput: boolean;

  setPlayerPosition: (player: PlayerId, pos: PlayerCoords) => void;
  setAllPositions: (pos: AllPlayerPositions) => void;
  setTrackingEnabled: (enabled: boolean) => void;
  setNeedsManualInput: (needs: boolean) => void;
  resetToDefaults: () => void;
}

function getInitialTracking(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('padel-position-tracking') === 'true';
  } catch {
    return false;
  }
}

export const usePositionStore = create<PositionState>((set) => ({
  positions: { ...DEFAULT_POSITIONS },
  trackingEnabled: getInitialTracking(),
  needsManualInput: false,

  setPlayerPosition: (player, pos) =>
    set((state) => ({
      positions: { ...state.positions, [player]: pos },
      needsManualInput: false,
    })),

  setAllPositions: (positions) =>
    set({ positions, needsManualInput: false }),

  setTrackingEnabled: (trackingEnabled) => {
    try {
      localStorage.setItem('padel-position-tracking', String(trackingEnabled));
    } catch { /* ignore */ }
    set({ trackingEnabled });
  },

  setNeedsManualInput: (needsManualInput) =>
    set({ needsManualInput }),

  resetToDefaults: () =>
    set({ positions: { ...DEFAULT_POSITIONS }, needsManualInput: false }),
}));
