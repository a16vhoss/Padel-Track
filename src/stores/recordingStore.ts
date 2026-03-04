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

  setPlayer: (p: PlayerId) => void;
  setShotType: (t: ShotType) => void;
  setDirection: (d: ShotDirection | undefined) => void;
  setPower: (p: ShotPower) => void;
  setSpin: (s: ShotSpin) => void;
  toggleWallBounce: (w: WallZoneId) => void;
  setDestination: (d: ZoneDestination | null) => void;
  setStatus: (s: ShotStatus) => void;
  reset: () => void;
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
};

export const useRecordingStore = create<RecordingState>((set) => ({
  ...initialState,

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
  reset: () => set(initialState),
}));
