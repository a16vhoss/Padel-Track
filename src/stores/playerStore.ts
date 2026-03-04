'use client';

import { create } from 'zustand';
import { PlayerProfile } from '@/types/player';
import { v4 as uuid } from 'uuid';

const PLAYERS_KEY = 'tacticalpadel_players';

function loadPlayers(): PlayerProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(PLAYERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function savePlayers(players: PlayerProfile[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
}

interface PlayerState {
  players: PlayerProfile[];
  loadAll: () => void;
  addPlayer: (name: string, shortName: string) => void;
  deletePlayer: (id: string) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  players: [],

  loadAll: () => {
    set({ players: loadPlayers() });
  },

  addPlayer: (name, shortName) => {
    const player: PlayerProfile = {
      id: uuid(),
      name,
      shortName: shortName || name.slice(0, 3).toUpperCase(),
      createdAt: Date.now(),
    };
    const players = [player, ...get().players];
    savePlayers(players);
    set({ players });
  },

  deletePlayer: (id) => {
    const players = get().players.filter((p) => p.id !== id);
    savePlayers(players);
    set({ players });
  },
}));
