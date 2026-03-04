'use client';

import { create } from 'zustand';
import { League, LeagueTeam, LeagueStanding } from '@/types/league';
import { v4 as uuidv4 } from 'uuid';

const LEAGUES_KEY = 'tacticalpadel_leagues';

function loadLeagues(): League[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(LEAGUES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLeagues(leagues: League[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LEAGUES_KEY, JSON.stringify(leagues));
}

interface LeagueState {
  leagues: League[];

  loadAll: () => void;
  createLeague: (name: string, type: 'league' | 'tournament', teams: LeagueTeam[]) => string;
  deleteLeague: (id: string) => void;
  addMatchToLeague: (leagueId: string, matchId: string) => void;
  updateStandings: (leagueId: string, standings: LeagueStanding[]) => void;
  getLeague: (id: string) => League | undefined;
}

export const useLeagueStore = create<LeagueState>((set, get) => ({
  leagues: [],

  loadAll: () => {
    set({ leagues: loadLeagues() });
  },

  createLeague: (name, type, teams) => {
    const id = uuidv4();
    const league: League = {
      id,
      name,
      type,
      teams,
      matchIds: [],
      standings: teams.map((t) => ({
        teamId: t.id,
        teamName: t.name,
        played: 0,
        won: 0,
        lost: 0,
        setsWon: 0,
        setsLost: 0,
        gamesWon: 0,
        gamesLost: 0,
        points: 0,
      })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'active',
    };

    const leagues = [...get().leagues, league];
    saveLeagues(leagues);
    set({ leagues });
    return id;
  },

  deleteLeague: (id) => {
    const leagues = get().leagues.filter((l) => l.id !== id);
    saveLeagues(leagues);
    set({ leagues });
  },

  addMatchToLeague: (leagueId, matchId) => {
    const leagues = get().leagues.map((l) => {
      if (l.id !== leagueId) return l;
      return {
        ...l,
        matchIds: [...l.matchIds, matchId],
        updatedAt: Date.now(),
      };
    });
    saveLeagues(leagues);
    set({ leagues });
  },

  updateStandings: (leagueId, standings) => {
    const leagues = get().leagues.map((l) => {
      if (l.id !== leagueId) return l;
      return { ...l, standings, updatedAt: Date.now() };
    });
    saveLeagues(leagues);
    set({ leagues });
  },

  getLeague: (id) => {
    return get().leagues.find((l) => l.id === id);
  },
}));
