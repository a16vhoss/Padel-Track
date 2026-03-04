import { PlayerId, Shot } from './shot';

export interface Player {
  id: PlayerId;
  name: string;
  shortName: string; // initials or short version
}

export interface Team {
  id: 'team1' | 'team2';
  name: string;
  players: [Player, Player]; // exactly 2 players
  color: string;
}

export type ServeSide = 'derecha' | 'izquierda';

export interface Point {
  id: string;
  pointNumber: number;
  setNumber: number;
  gameNumber: number;
  scoreBefore: string; // e.g., "15-0"
  scoreAfter: string;
  server: PlayerId;
  serveSide: ServeSide;
  shots: Shot[];
  winner: 'team1' | 'team2';
  cause: string;
  notation: string; // Full compact notation for the point
  timestamp: number;
  durationMs?: number; // point duration in milliseconds
  serveNumber?: 1 | 2; // which serve started this point
}

export interface Game {
  id: string;
  gameNumber: number;
  server: PlayerId;
  points: Point[];
  winner: 'team1' | 'team2' | null; // null if in progress
  isTiebreak: boolean;
  score: { team1: number; team2: number };
}

export interface Set {
  id: string;
  setNumber: number;
  games: Game[];
  winner: 'team1' | 'team2' | null;
  score: { team1: number; team2: number };
  hasTiebreak: boolean;
}

export interface MatchConfig {
  setsToWin: number; // typically 2 (best of 3)
  goldenPoint: boolean; // golden point at deuce
  tiebreakAt: number; // typically 6 (6-6)
}

export type CourtSide = 'derecha' | 'reves';

export interface PlayerPositions {
  J1: CourtSide;
  J2: CourtSide;
  J3: CourtSide;
  J4: CourtSide;
}

export interface UndoEntry {
  matchSnapshot: string; // JSON stringified Match
  description: string;
  timestamp: number;
}

export type MatchStatus = 'setup' | 'live' | 'finished';

export interface Match {
  id: string;
  teams: [Team, Team];
  sets: Set[];
  config: MatchConfig;
  status: MatchStatus;
  currentSet: number;
  currentGame: number;
  winner: 'team1' | 'team2' | null;
  createdAt: number;
  updatedAt: number;
  playerPositions?: PlayerPositions;
  undoHistory?: UndoEntry[];
  totalDurationMs?: number; // total match duration
  startedAt?: number; // when the match actually started (first point)
  finishedAt?: number; // when the match ended
}
