import { Match } from './match';
import { PlayerId } from './shot';

export interface LeaguePlayer {
  id: string;
  name: string;
  shortName: string;
  avatar?: string;
}

export interface LeagueTeam {
  id: string;
  name: string;
  players: [LeaguePlayer, LeaguePlayer];
}

export interface LeagueStanding {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  lost: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  points: number; // 3 per match win, 1 per set won? or simple 2/0
}

export interface TournamentBracketMatch {
  id: string;
  round: number;
  position: number;
  team1Id: string | null;
  team2Id: string | null;
  matchId: string | null; // link to actual Match
  winner: string | null;
  score?: string;
}

export interface League {
  id: string;
  name: string;
  type: 'league' | 'tournament';
  teams: LeagueTeam[];
  matchIds: string[]; // linked Match ids
  standings: LeagueStanding[];
  bracket?: TournamentBracketMatch[];
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'finished';
}
