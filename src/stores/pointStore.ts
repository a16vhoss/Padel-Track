'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Shot, PlayerId, ShotType, ShotModifiers, ShotStatus } from '@/types/shot';
import { ZoneDestination } from '@/types/zones';
import { generateNotation } from '@/lib/notation/generator';

interface ShotInput {
  player: PlayerId;
  type: ShotType;
  modifiers: ShotModifiers;
  destination: ZoneDestination;
  status: ShotStatus;
}

interface PointState {
  shots: Shot[];
  addShot: (input: ShotInput) => void;
  removeLast: () => void;
  clearShots: () => void;
}

export const usePointStore = create<PointState>((set, get) => ({
  shots: [],

  addShot: (input) => {
    const shots = get().shots;
    const sequenceNumber = shots.length + 1;

    const shot: Shot = {
      id: uuidv4(),
      sequenceNumber,
      player: input.player,
      type: input.type,
      modifiers: input.modifiers,
      destination: input.destination,
      status: input.status,
      notation: '',
      timestamp: Date.now(),
    };

    // Generate notation
    shot.notation = generateNotation(shot);

    set({ shots: [...shots, shot] });
  },

  removeLast: () => {
    set((state) => ({
      shots: state.shots.slice(0, -1),
    }));
  },

  clearShots: () => set({ shots: [] }),
}));
