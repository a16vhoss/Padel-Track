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
  filter?: { type: 'player'; player: PlayerId } | { type: 'team'; team: 'team1' | 'team2' } | { type: 'all' },
  setFilter?: number,
): ServeStats {
  let points = getAllPoints(match);
  if (setFilter !== undefined) {
    points = points.filter((p) => p.setNumber === setFilter);
  }
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
  // First serve %: how many first serves went in out of total points served
  const totalPointsServed = points.filter((p) => {
    const server = p.server;
    if (filter) {
      if (filter.type === 'player' && server !== filter.player) return false;
      if (filter.type === 'team' && !isPlayerInTeam(server, filter.team)) return false;
    }
    return p.shots.some((s) => s.type === 'S' && s.player === server);
  }).length;
  stats.firstServePct = totalPointsServed > 0 ? Math.round((stats.firstServeIn / totalPointsServed) * 100) : 0;
  const secondServeAttempts = totalPointsServed - stats.firstServeIn;
  stats.secondServePct = secondServeAttempts > 0 ? Math.round((stats.secondServeIn / secondServeAttempts) * 100) : 0;
  stats.firstServeWinPct = stats.firstServePointsTotal > 0 ? Math.round((stats.firstServePointsWon / stats.firstServePointsTotal) * 100) : 0;
  stats.secondServeWinPct = stats.secondServePointsTotal > 0 ? Math.round((stats.secondServePointsWon / stats.secondServePointsTotal) * 100) : 0;

  return stats;
}

// ---------------------------------------------------------------------------
// Return Stats
// ---------------------------------------------------------------------------

export interface ReturnStats {
  pointsWon: number;
  pointsTotal: number;
  winPct: number;
  breakPointsWon: number;
  breakPointsTotal: number;
  breakPct: number;
  gamesWonOnReturn: number;
  gamesTotalOnReturn: number;
  returnWinners: number;
  returnErrors: number;
}

export function computeReturnStats(
  match: Match,
  teamFilter: 'team1' | 'team2',
  setFilter?: number,
): ReturnStats {
  const stats: ReturnStats = {
    pointsWon: 0, pointsTotal: 0, winPct: 0,
    breakPointsWon: 0, breakPointsTotal: 0, breakPct: 0,
    gamesWonOnReturn: 0, gamesTotalOnReturn: 0,
    returnWinners: 0, returnErrors: 0,
  };

  const sets = setFilter !== undefined
    ? match.sets.filter((s) => s.setNumber === setFilter)
    : match.sets;

  for (const set of sets) {
    for (const game of set.games) {
      const serverTeam = isPlayerInTeam(game.server, 'team1') ? 'team1' : 'team2';
      if (serverTeam === teamFilter) continue; // we want games where teamFilter is returning

      stats.gamesTotalOnReturn++;
      if (game.winner === teamFilter) stats.gamesWonOnReturn++;

      for (const point of game.points) {
        stats.pointsTotal++;
        if (point.winner === teamFilter) stats.pointsWon++;

        // Check break points
        const scoreParts = point.scoreBefore.split('-');
        if (scoreParts.length === 2) {
          const returnerScore = serverTeam === 'team1' ? scoreParts[1] : scoreParts[0];
          const serverScore = serverTeam === 'team1' ? scoreParts[0] : scoreParts[1];
          if ((returnerScore === '40' || returnerScore === 'Ad') && serverScore !== 'Ad') {
            stats.breakPointsTotal++;
            if (point.winner === teamFilter) stats.breakPointsWon++;
          }
        }

        // Return shot quality
        const returnShots = point.shots.filter((s) =>
          s.type === 'Re' && isPlayerInTeam(s.player, teamFilter)
        );
        for (const shot of returnShots) {
          if (shot.status === 'W') stats.returnWinners++;
          if (shot.status === 'X') stats.returnErrors++;
        }
      }
    }
  }

  stats.winPct = stats.pointsTotal > 0 ? Math.round((stats.pointsWon / stats.pointsTotal) * 100) : 0;
  stats.breakPct = stats.breakPointsTotal > 0 ? Math.round((stats.breakPointsWon / stats.breakPointsTotal) * 100) : 0;

  return stats;
}

// ---------------------------------------------------------------------------
// Serve Direction Stats
// ---------------------------------------------------------------------------

export interface ServeDirectionEntry {
  server: PlayerId;
  side: 'derecha' | 'izquierda';
  zone: number;
  count: number;
  winners: number;
  errors: number;
}

export interface ServeDirectionStats {
  byServer: Record<string, ServeDirectionEntry[]>;
}

export function computeServeDirections(
  match: Match,
  setFilter?: number,
): ServeDirectionStats {
  let points = getAllPoints(match);
  if (setFilter !== undefined) {
    points = points.filter((p) => p.setNumber === setFilter);
  }

  const entries = new Map<string, ServeDirectionEntry>();

  for (const point of points) {
    const server = point.server;
    const side = point.serveSide;
    const serves = point.shots.filter((s) => s.type === 'S' && s.player === server);

    for (const serve of serves) {
      if (!serve.destination) continue;
      const zone = serve.destination.type === 'single'
        ? serve.destination.zone
        : serve.destination.primary;

      const key = `${server}-${side}-${zone}`;
      const existing = entries.get(key) || {
        server, side, zone, count: 0, winners: 0, errors: 0,
      };
      existing.count++;
      if (serve.status === 'W') existing.winners++;
      if (serve.status === 'X' || serve.status === 'DF') existing.errors++;
      entries.set(key, existing);
    }
  }

  const all = Array.from(entries.values());
  const byServer: Record<string, ServeDirectionEntry[]> = {};
  for (const entry of all) {
    if (!byServer[entry.server]) byServer[entry.server] = [];
    byServer[entry.server].push(entry);
  }

  // Sort each server's entries by count descending
  for (const key of Object.keys(byServer)) {
    byServer[key].sort((a, b) => b.count - a.count);
  }

  return { byServer };
}
