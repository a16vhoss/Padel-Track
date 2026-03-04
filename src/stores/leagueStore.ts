'use client';

import { create } from 'zustand';
import { League, LeagueTeam, LeagueStanding } from '@/types/league';
import { Match } from '@/types/match';
import { v4 as uuidv4 } from 'uuid';
import { getMatch } from '@/lib/persistence/storage';

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
  recalculateStandings: (leagueId: string) => void;
  addTeamToLeague: (leagueId: string, team: LeagueTeam) => void;
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

  recalculateStandings: (leagueId) => {
    const league = get().leagues.find((l) => l.id === leagueId);
    if (!league) return;

    // Load all finished matches for this league
    const matches: Match[] = league.matchIds
      .map((id) => getMatch(id))
      .filter((m): m is Match => m !== null && m.status === 'finished');

    // Build standings from team names in matches
    const teamStats: Record<string, LeagueStanding> = {};

    // Init from existing league teams
    for (const team of league.teams) {
      teamStats[team.name] = {
        teamId: team.id,
        teamName: team.name,
        played: 0, won: 0, lost: 0,
        setsWon: 0, setsLost: 0,
        gamesWon: 0, gamesLost: 0,
        points: 0,
      };
    }

    for (const match of matches) {
      const t1Name = match.teams[0].name;
      const t2Name = match.teams[1].name;

      // Ensure teams exist in standings
      if (!teamStats[t1Name]) {
        teamStats[t1Name] = {
          teamId: match.teams[0].id, teamName: t1Name,
          played: 0, won: 0, lost: 0, setsWon: 0, setsLost: 0, gamesWon: 0, gamesLost: 0, points: 0,
        };
      }
      if (!teamStats[t2Name]) {
        teamStats[t2Name] = {
          teamId: match.teams[1].id, teamName: t2Name,
          played: 0, won: 0, lost: 0, setsWon: 0, setsLost: 0, gamesWon: 0, gamesLost: 0, points: 0,
        };
      }

      teamStats[t1Name].played++;
      teamStats[t2Name].played++;

      // Count sets and games
      for (const set of match.sets) {
        if (set.winner) {
          teamStats[t1Name].setsWon += set.score.team1;
          teamStats[t1Name].setsLost += set.score.team2;
          teamStats[t2Name].setsWon += set.score.team2;
          teamStats[t2Name].setsLost += set.score.team1;
          teamStats[t1Name].gamesWon += set.score.team1;
          teamStats[t1Name].gamesLost += set.score.team2;
          teamStats[t2Name].gamesWon += set.score.team2;
          teamStats[t2Name].gamesLost += set.score.team1;
        }
      }

      // Winner gets 3 points
      if (match.winner === 'team1') {
        teamStats[t1Name].won++;
        teamStats[t1Name].points += 3;
        teamStats[t2Name].lost++;
      } else if (match.winner === 'team2') {
        teamStats[t2Name].won++;
        teamStats[t2Name].points += 3;
        teamStats[t1Name].lost++;
      }
    }

    const standings = Object.values(teamStats);
    get().updateStandings(leagueId, standings);
  },

  addTeamToLeague: (leagueId, team) => {
    const leagues = get().leagues.map((l) => {
      if (l.id !== leagueId) return l;
      // Avoid duplicate
      if (l.teams.some((t) => t.name === team.name)) return l;
      const newStanding: LeagueStanding = {
        teamId: team.id, teamName: team.name,
        played: 0, won: 0, lost: 0, setsWon: 0, setsLost: 0, gamesWon: 0, gamesLost: 0, points: 0,
      };
      return {
        ...l,
        teams: [...l.teams, team],
        standings: [...l.standings, newStanding],
        updatedAt: Date.now(),
      };
    });
    saveLeagues(leagues);
    set({ leagues });
  },

  getLeague: (id) => {
    return get().leagues.find((l) => l.id === id);
  },
}));
