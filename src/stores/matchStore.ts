'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Match, Point, Game } from '@/types/match';
import { Shot } from '@/types/shot';
import { MatchScore } from '@/types/scoring';
import { ScoringEngine, createScoringEngine } from '@/lib/scoring/engine';
import { generatePointNotation } from '@/lib/notation/generator';
import { saveMatch, getMatch } from '@/lib/persistence/storage';

interface MatchState {
  match: Match | null;
  scoring: MatchScore | null;
  engine: ScoringEngine | null;

  loadMatch: (id: string) => void;
  setMatch: (match: Match) => void;
  pointWon: (team: 'team1' | 'team2', shots: Shot[]) => void;
  getCurrentGameScore: () => { team1: string; team2: string };
}

export const useMatchStore = create<MatchState>((set, get) => ({
  match: null,
  scoring: null,
  engine: null,

  loadMatch: (id: string) => {
    const match = getMatch(id);
    if (!match) return;

    const engine = createScoringEngine(match.config);

    // Replay all points to restore scoring state
    for (const s of match.sets) {
      for (const g of s.games) {
        for (const p of g.points) {
          engine.pointWon(p.winner);
        }
      }
    }

    set({ match, engine, scoring: engine.getScore() });
  },

  setMatch: (match: Match) => {
    const engine = createScoringEngine(match.config);
    set({ match, engine, scoring: engine.getScore() });
  },

  pointWon: (team, shots) => {
    const { match, engine } = get();
    if (!match || !engine) return;

    const scoring = engine.getScore();
    const scoreBefore = `${scoring.currentGame.team1}-${scoring.currentGame.team2}`;

    // Score the point
    const events = engine.pointWon(team);
    const newScoring = engine.getScore();
    const scoreAfter = `${newScoring.currentGame.team1}-${newScoring.currentGame.team2}`;

    // Build the point record
    const point: Point = {
      id: uuidv4(),
      pointNumber: match.sets.flatMap((s) => s.games).flatMap((g) => g.points).length + 1,
      setNumber: match.sets.length,
      gameNumber: match.sets[match.sets.length - 1].games.length + 1,
      scoreBefore,
      scoreAfter,
      server: scoring.server,
      serveSide: scoring.serveSide,
      shots,
      winner: team,
      cause: determineCause(shots),
      notation: generatePointNotation(shots),
      timestamp: Date.now(),
    };

    // Update match structure
    const updatedMatch = { ...match };
    let currentSet = updatedMatch.sets[updatedMatch.sets.length - 1];

    // Ensure current game exists
    if (currentSet.games.length === 0 || currentSet.games[currentSet.games.length - 1].winner !== null) {
      const newGame: Game = {
        id: uuidv4(),
        gameNumber: currentSet.games.length + 1,
        server: scoring.server,
        points: [],
        winner: null,
        isTiebreak: false,
        score: { team1: 0, team2: 0 },
      };
      currentSet.games.push(newGame);
    }

    const currentGame = currentSet.games[currentSet.games.length - 1];
    currentGame.points.push(point);

    // Check if game was won
    const hasNewGame = events.some((e) => e.type === 'NEW_GAME');
    const hasNewSet = events.some((e) => e.type === 'NEW_SET');
    const matchOver = events.find((e) => e.type === 'MATCH_OVER');

    if (hasNewGame || hasNewSet || matchOver) {
      currentGame.winner = team;
      currentGame.score = { ...currentSet.score };
      currentSet.score[team]++;
    }

    if (hasNewSet) {
      currentSet.winner = team;
      if (!matchOver) {
        updatedMatch.sets.push({
          id: uuidv4(),
          setNumber: updatedMatch.sets.length + 1,
          games: [],
          winner: null,
          score: { team1: 0, team2: 0 },
          hasTiebreak: false,
        });
      }
    }

    if (matchOver) {
      updatedMatch.status = 'finished';
      updatedMatch.winner = team;
    }

    updatedMatch.updatedAt = Date.now();
    updatedMatch.currentSet = updatedMatch.sets.length - 1;

    // Persist
    saveMatch(updatedMatch);

    set({ match: updatedMatch, scoring: newScoring });
  },

  getCurrentGameScore: () => {
    const { scoring } = get();
    if (!scoring) return { team1: '0', team2: '0' };
    return {
      team1: String(scoring.currentGame.team1),
      team2: String(scoring.currentGame.team2),
    };
  },
}));

function determineCause(shots: Shot[]): string {
  if (shots.length === 0) return '';
  const lastShot = shots[shots.length - 1];
  switch (lastShot.status) {
    case 'W': return `winner_${lastShot.type}`;
    case 'X': return `error_${lastShot.type}`;
    case 'N': return `no_llega`;
    case 'DF': return 'doble_falta';
    default: return '';
  }
}
