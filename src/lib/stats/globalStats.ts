import { Match, Point } from '@/types/match';
import { Shot } from '@/types/shot';

export interface GlobalStats {
  totalMatches: number;
  finishedMatches: number;
  liveMatches: number;
  totalPoints: number;
  totalShots: number;
  avgShotsPerPoint: number;
  totalDurationMs: number;
  winners: { team1: number; team2: number };
  errors: { team1: number; team2: number };
  shotsByType: Record<string, number>;
  shotsByPlayer: Record<string, number>;
  playerNames: Record<string, string>;
  matchHistory: Array<{
    date: number;
    totalPoints: number;
    effectiveness: number;
    winner: string | null;
  }>;
}

function isTeam1Player(player: string): boolean {
  return player === 'J1' || player === 'J2';
}

function getAllPoints(match: Match): Point[] {
  return match.sets.flatMap((s) => s.games.flatMap((g) => g.points));
}

export function computeGlobalStats(matches: Match[]): GlobalStats {
  const shotsByType: Record<string, number> = {};
  const shotsByPlayer: Record<string, number> = {};
  const playerNames: Record<string, string> = {};
  const winners = { team1: 0, team2: 0 };
  const errors = { team1: 0, team2: 0 };
  let totalPoints = 0;
  let totalShots = 0;
  let totalDurationMs = 0;

  const matchHistory: GlobalStats['matchHistory'] = [];

  for (const match of matches) {
    // Collect player names
    for (const team of match.teams) {
      for (const player of team.players) {
        playerNames[player.id] = player.name;
      }
    }

    totalDurationMs += match.totalDurationMs || 0;

    const points = getAllPoints(match);
    totalPoints += points.length;

    let matchWinners = 0;
    let matchShots = 0;

    for (const point of points) {
      for (const shot of point.shots) {
        totalShots++;
        matchShots++;

        shotsByType[shot.type] = (shotsByType[shot.type] || 0) + 1;
        shotsByPlayer[shot.player] = (shotsByPlayer[shot.player] || 0) + 1;

        if (shot.status === 'W') {
          matchWinners++;
          if (isTeam1Player(shot.player)) winners.team1++;
          else winners.team2++;
        }
        if (shot.status === 'X' || shot.status === 'DF') {
          if (isTeam1Player(shot.player)) errors.team1++;
          else errors.team2++;
        }
      }
    }

    matchHistory.push({
      date: match.createdAt,
      totalPoints: points.length,
      effectiveness: matchShots > 0 ? Math.round((matchWinners / matchShots) * 100) : 0,
      winner: match.winner
        ? match.teams[match.winner === 'team1' ? 0 : 1].name
        : null,
    });
  }

  return {
    totalMatches: matches.length,
    finishedMatches: matches.filter((m) => m.status === 'finished').length,
    liveMatches: matches.filter((m) => m.status === 'live').length,
    totalPoints,
    totalShots,
    avgShotsPerPoint: totalPoints > 0 ? Math.round((totalShots / totalPoints) * 10) / 10 : 0,
    totalDurationMs,
    winners,
    errors,
    shotsByType,
    shotsByPlayer,
    playerNames,
    matchHistory: matchHistory.sort((a, b) => a.date - b.date),
  };
}
