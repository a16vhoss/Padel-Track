'use client';

import { create } from 'zustand';
import { Match } from '@/types/match';
import { loadMatches, deleteMatch as removeMatch } from '@/lib/persistence/storage';

interface HistoryState {
  matches: Match[];
  loadAll: () => void;
  deleteMatch: (id: string) => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  matches: [],

  loadAll: () => {
    const matches = loadMatches();
    set({ matches });
  },

  deleteMatch: (id: string) => {
    removeMatch(id);
    set((state) => ({
      matches: state.matches.filter((m) => m.id !== id),
    }));
  },
}));
