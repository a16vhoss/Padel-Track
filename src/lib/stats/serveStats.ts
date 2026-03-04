import { Match, Point } from '@/types/match';
import { Shot, PlayerId } from '@/types/shot';

export interface ServeStats {
  totalServes: number;
  firstServeIn: number;
  firstServePct: number;
  secondServeIn: number;
  secondServePct: number;
  aces: number;
  doubleFaults: number;
  firstServePointsWon: number;
  firstServePointsTotal: number;
  firstServeWinPct: number;
  secondServePointsWon: number;
  secondServePointsTotal: number;
  secondServeWinPct: number;
  serveByZone: Record<number, number>;
  serveBySide: { derecha: number; izquierda: number };
}

function getAllPoints(match: Match): Point[] {
  return match.sets.flatMap((s) => s.games.flatMap((g) => g.points));
}

function isPlayerInTeam(player: PlayerId, team: 'team1' | 'team2'): boolean {
  return team === 'team1' ? (player === 'J1' || player === 'J2') : (player === 'J3' || player === 'J4');
}

export function computeServeStats(
  match: Match,
  filter?: { type: 'player'; player: PlayerId } | { type: 'team'; team: 'team1' | 'team2' } | { type: 'all' }
): ServeStats {
  const points = getAllPoints(match);
  const stats: ServeStats = {
    totalServes: 0,
    firstServeIn: 0,
    firstServePct: 0,
    secondServeIn: 0,
    secondServePct: 0,
    aces: 0,
    doubleFaults: 0,
    firstServePointsWon: 0,
    firstServePointsTotal: 0,
    firstServeWinPct: 0,
    secondServePointsWon: 0,
    secondServePointsTotal: 0,
    secondServeWinPct: 0,
    serveByZone: {},
    serveBySide: { derecha: 0, izquierda: 0 },
  };

  for (const point of points) {
    const server = point.server;

    // Apply filter
    if (filter) {
      if (filter.type === 'player' && server !== filter.player) continue;
      if (filter.type === 'team' && !isPlayerInTeam(server, filter.team)) continue;
    }

    const serves = point.shots.filter((s) => s.type === 'S' && s.player === server);
    if (serves.length === 0) continue;

    stats.totalServes += serves.length;
    stats.serveBySide[point.serveSide]++;

    // First serve
    const firstServe = serves[0];
    const isFirstServeIn = firstServe.status !== 'X' && firstServe.status !== 'DF';

    if (isFirstServeIn) {
      stats.firstServeIn++;
      stats.firstServePointsTotal++;

      // Check if server's team won this point
      const serverTeam = isPlayerInTeam(server, 'team1') ? 'team1' : 'team2';
      if (point.winner === serverTeam) {
        stats.firstServePointsWon++;
      }

      if (firstServe.status === 'W') {
        stats.aces++;
      }

      // Zone tracking
      if (firstServe.destination) {
        const zone = firstServe.destination.type === 'single'
          ? firstServe.destination.zone
          : firstServe.destination.primary;
        stats.serveByZone[zone] = (stats.serveByZone[zone] || 0) + 1;
      }
    } else {
      // First serve fault
      if (firstServe.status === 'DF') {
        stats.doubleFaults++;
      } else if (serves.length > 1) {
        // Second serve
        const secondServe = serves[1];
        const isSecondServeIn = secondServe.status !== 'X' && secondServe.status !== 'DF';

        if (isSecondServeIn) {
          stats.secondServeIn++;
          stats.secondServePointsTotal++;

          const serverTeam = isPlayerInTeam(server, 'team1') ? 'team1' : 'team2';
          if (point.winner === serverTeam) {
            stats.secondServePointsWon++;
          }
        } else if (secondServe.status === 'DF') {
          stats.doubleFaults++;
        }

        if (secondServe.destination) {
          const zone = secondServe.destination.type === 'single'
            ? secondServe.destination.zone
            : secondServe.destination.primary;
          stats.serveByZone[zone] = (stats.serveByZone[zone] || 0) + 1;
        }
      }
    }
  }

  // Calculate percentages
  const firstServeAttempts = stats.firstServeIn + (stats.totalServes - stats.firstServeIn);
  stats.firstServePct = firstServeAttempts > 0 ? Math.round((stats.firstServeIn / stats.totalServes) * 100) : 0;
  stats.secondServePct = stats.secondServePointsTotal > 0 ? Math.round((stats.secondServeIn / (stats.totalServes - stats.firstServeIn)) * 100) : 0;
  stats.firstServeWinPct = stats.firstServePointsTotal > 0 ? Math.round((stats.firstServePointsWon / stats.firstServePointsTotal) * 100) : 0;
  stats.secondServeWinPct = stats.secondServePointsTotal > 0 ? Math.round((stats.secondServePointsWon / stats.secondServePointsTotal) * 100) : 0;

  return stats;
}
