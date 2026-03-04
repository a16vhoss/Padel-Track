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

export function computeMomentum(match: Match, setFilter?: number): MomentumData {
  let points = getAllPoints(match);
  if (setFilter !== undefined) {
    points = points.filter((p) => p.setNumber === setFilter);
  }
  const momentumPoints: MomentumPoint[] = [];

  let cumulativeMomentum = 0;
  let currentStreak = 0;
  let longestStreak = { team: 'team1' as 'team1' | 'team2', length: 0, startPoint: 0 };
  let streakStart = 0;
  const breakPointsWon = { team1: 0, team2: 0 };
  const breakPointsTotal = { team1: 0, team2: 0 };
  let comebacks = 0;

  // Pre-compute comebacks: track games where a team was 0-40 down and won
  const comebackGames = new Set<string>();
  const setsToCheck = setFilter !== undefined
    ? match.sets.filter((s) => s.setNumber === setFilter)
    : match.sets;
  for (const set of setsToCheck) {
    for (const game of set.games) {
      if (!game.winner || game.isTiebreak) continue;
      const serverTeam = (game.server === 'J1' || game.server === 'J2') ? 'team1' : 'team2';
      let serverWas040 = false;
      let returnerWas040 = false;
      for (const pt of game.points) {
        if (pt.scoreBefore === '0-40') serverWas040 = true;
        if (pt.scoreBefore === '40-0') returnerWas040 = true;
      }
      if (serverWas040 && game.winner === serverTeam) {
        comebackGames.add(`${set.setNumber}-${game.gameNumber}-server`);
      }
      if (returnerWas040 && game.winner !== serverTeam) {
        comebackGames.add(`${set.setNumber}-${game.gameNumber}-returner`);
      }
    }
  }
  comebacks = comebackGames.size;

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

    // Break point detection
    const scoreBefore = p.scoreBefore;
    const isBreakPoint = isBreakPointScore(scoreBefore, p.server);
    if (isBreakPoint) {
      const returnerTeam = (p.server === 'J1' || p.server === 'J2') ? 'team2' : 'team1';
      breakPointsTotal[returnerTeam]++;
      if (p.winner === returnerTeam) {
        breakPointsWon[returnerTeam]++;
      }
    }

    // Set point & match point detection
    const isSetPoint = isSetPointScore(match, p);
    const isMatchPoint = isMatchPointScore(match, p);

    momentumPoints.push({
      pointNumber: i + 1,
      momentum: cumulativeMomentum,
      streak: currentStreak,
      isBreakPoint,
      isSetPoint,
      isMatchPoint,
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

function isSetPointScore(match: Match, point: Point): boolean {
  // A set point: one team is at game score where winning this game wins the set
  const set = match.sets.find((s) => s.setNumber === point.setNumber);
  if (!set) return false;
  const { team1, team2 } = set.score;
  const tiebreakAt = match.config.tiebreakAt;
  const scoreBefore = point.scoreBefore;

  // Check if serving team or returning team is at game point AND winning would give them the set
  const serverTeam = (point.server === 'J1' || point.server === 'J2') ? 'team1' : 'team2';
  const parts = scoreBefore.split('-');
  if (parts.length !== 2) return false;
  const serverScore = serverTeam === 'team1' ? parts[0] : parts[1];
  const returnerScore = serverTeam === 'team1' ? parts[1] : parts[0];

  // Server at game point (40 or Ad) and would win the set
  const serverSetGames = serverTeam === 'team1' ? team1 : team2;
  const returnerSetGames = serverTeam === 'team1' ? team2 : team1;

  if ((serverScore === '40' || serverScore === 'Ad') && returnerScore !== 'Ad') {
    if (serverSetGames >= tiebreakAt - 1 && serverSetGames > returnerSetGames) return true;
    if (serverSetGames >= tiebreakAt && returnerSetGames >= tiebreakAt) return true; // tiebreak scenario
  }
  if ((returnerScore === '40' || returnerScore === 'Ad') && serverScore !== 'Ad') {
    if (returnerSetGames >= tiebreakAt - 1 && returnerSetGames > serverSetGames) return true;
    if (returnerSetGames >= tiebreakAt && serverSetGames >= tiebreakAt) return true;
  }
  return false;
}

function isMatchPointScore(match: Match, point: Point): boolean {
  if (!isSetPointScore(match, point)) return false;
  // Check if winning this set would win the match
  const setsToWin = match.config.setsToWin;
  const serverTeam = (point.server === 'J1' || point.server === 'J2') ? 'team1' : 'team2';
  const returnerTeam = serverTeam === 'team1' ? 'team2' : 'team1';

  const setsWon = { team1: 0, team2: 0 };
  for (const s of match.sets) {
    if (s.winner) setsWon[s.winner]++;
  }

  // If either team is one set away from winning
  return setsWon[serverTeam] === setsToWin - 1 || setsWon[returnerTeam] === setsToWin - 1;
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
