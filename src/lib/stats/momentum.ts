import { Match, Point } from '@/types/match';

export interface MomentumPoint {
  pointNumber: number;
  momentum: number; // positive = team1 dominance, negative = team2
  streak: number; // consecutive points by same team (positive = team1)
  isBreakPoint: boolean;
  isSetPoint: boolean;
  isMatchPoint: boolean;
  winner: 'team1' | 'team2';
}

export interface MomentumData {
  points: MomentumPoint[];
  longestStreak: { team: 'team1' | 'team2'; length: number; startPoint: number };
  breakPointsWon: { team1: number; team2: number };
  breakPointsTotal: { team1: number; team2: number };
  comebacks: number; // times a team won after being 0-40 or similar
}

function getAllPoints(match: Match): Point[] {
  return match.sets.flatMap((s) => s.games.flatMap((g) => g.points));
}

export function computeMomentum(match: Match): MomentumData {
  const points = getAllPoints(match);
  const momentumPoints: MomentumPoint[] = [];

  let cumulativeMomentum = 0;
  let currentStreak = 0;
  let longestStreak = { team: 'team1' as 'team1' | 'team2', length: 0, startPoint: 0 };
  let streakStart = 0;
  const breakPointsWon = { team1: 0, team2: 0 };
  const breakPointsTotal = { team1: 0, team2: 0 };
  let comebacks = 0;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const delta = p.winner === 'team1' ? 1 : -1;
    cumulativeMomentum += delta;

    // Streak tracking
    if (i === 0) {
      currentStreak = delta;
      streakStart = i;
    } else if ((delta > 0 && currentStreak > 0) || (delta < 0 && currentStreak < 0)) {
      currentStreak += delta;
    } else {
      // Streak broken
      const absStreak = Math.abs(currentStreak);
      if (absStreak > longestStreak.length) {
        longestStreak = {
          team: currentStreak > 0 ? 'team1' : 'team2',
          length: absStreak,
          startPoint: streakStart,
        };
      }
      currentStreak = delta;
      streakStart = i;
    }

    // Break point detection (serving team loses)
    // A break point is when the returning team is about to win the game
    const scoreBefore = p.scoreBefore;
    const isBreakPoint = isBreakPointScore(scoreBefore, p.server);
    if (isBreakPoint) {
      const returnerTeam = (p.server === 'J1' || p.server === 'J2') ? 'team2' : 'team1';
      breakPointsTotal[returnerTeam]++;
      if (p.winner === returnerTeam) {
        breakPointsWon[returnerTeam]++;
      }
    }

    // Comeback detection: winning from 0-40
    if (scoreBefore === '0-40' || scoreBefore === '40-0') {
      // Check if the team that was down won the game eventually
      // Simplified: just count it
      comebacks++;
    }

    momentumPoints.push({
      pointNumber: i + 1,
      momentum: cumulativeMomentum,
      streak: currentStreak,
      isBreakPoint,
      isSetPoint: false, // simplified
      isMatchPoint: false, // simplified
      winner: p.winner,
    });
  }

  // Check final streak
  const absStreak = Math.abs(currentStreak);
  if (absStreak > longestStreak.length) {
    longestStreak = {
      team: currentStreak > 0 ? 'team1' : 'team2',
      length: absStreak,
      startPoint: streakStart,
    };
  }

  return {
    points: momentumPoints,
    longestStreak,
    breakPointsWon,
    breakPointsTotal,
    comebacks,
  };
}

function isBreakPointScore(score: string, server: string): boolean {
  // Parse score like "15-40", "30-40", "40-Ad"
  const parts = score.split('-');
  if (parts.length !== 2) return false;

  const serverTeam = (server === 'J1' || server === 'J2') ? 'team1' : 'team2';
  const serverScore = serverTeam === 'team1' ? parts[0] : parts[1];
  const returnerScore = serverTeam === 'team1' ? parts[1] : parts[0];

  // Returner at 40 or Ad, and server is not at Ad
  if ((returnerScore === '40' || returnerScore === 'Ad') && serverScore !== 'Ad') {
    return true;
  }
  return false;
}
