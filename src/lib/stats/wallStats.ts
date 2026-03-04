import { Match, Point } from '@/types/match';
import { Shot, PlayerId } from '@/types/shot';
import { WallZoneId } from '@/types/zones';

export interface WallUsageStats {
  totalWallShots: number;
  wallShotsByZone: Record<string, number>;
  wallShotsByPlayer: Record<string, number>;
  wallWinRate: number;
  wallWins: number;
  wallLosses: number;
  mostUsedWalls: Array<{ wall: WallZoneId; count: number }>;
  wallVsNoWall: {
    withWall: { wins: number; total: number; winPct: number };
    withoutWall: { wins: number; total: number; winPct: number };
  };
  wallByHeight: {
    baja: { count: number; winRate: number };
    alta: { count: number; winRate: number };
  };
}

function getAllPoints(match: Match): Point[] {
  return match.sets.flatMap((s) => s.games.flatMap((g) => g.points));
}

function getWallHeight(wallId: WallZoneId): 'baja' | 'alta' {
  const num = parseInt(wallId.replace('P', ''));
  // P1-P4: fondo baja, P5-P8: fondo alta
  // P9-P12: lat izq baja, P13-P16: lat izq alta
  // P17-P20: lat der baja, P21-P24: lat der alta
  if (num <= 4 || (num >= 9 && num <= 12) || (num >= 17 && num <= 20)) return 'baja';
  return 'alta';
}

export function computeWallStats(match: Match, playerFilter?: PlayerId, setFilter?: number): WallUsageStats {
  let points = getAllPoints(match);
  if (setFilter !== undefined) {
    points = points.filter((p) => p.setNumber === setFilter);
  }
  const wallShotsByZone: Record<string, number> = {};
  const wallShotsByPlayer: Record<string, number> = {};
  let totalWallShots = 0;
  let wallWins = 0;
  let wallLosses = 0;
  let noWallWins = 0;
  let noWallTotal = 0;
  let wallTotal = 0;
  const bajaCount = { count: 0, wins: 0 };
  const altaCount = { count: 0, wins: 0 };

  for (const point of points) {
    const pointHasWall = point.shots.some((s) => {
      if (playerFilter && s.player !== playerFilter) return false;
      return s.modifiers.wallBounces.length > 0;
    });

    // Win tracking only makes sense with a player/team filter
    const filterTeam = playerFilter
      ? ((playerFilter === 'J1' || playerFilter === 'J2') ? 'team1' : 'team2')
      : null;

    if (pointHasWall) {
      wallTotal++;
      if (filterTeam) {
        if (point.winner === filterTeam) wallWins++;
        else wallLosses++;
      }
    } else {
      noWallTotal++;
      if (filterTeam && point.winner === filterTeam) {
        noWallWins++;
      }
    }

    for (const shot of point.shots) {
      if (playerFilter && shot.player !== playerFilter) continue;

      for (const wall of shot.modifiers.wallBounces) {
        totalWallShots++;
        wallShotsByZone[wall] = (wallShotsByZone[wall] || 0) + 1;
        wallShotsByPlayer[shot.player] = (wallShotsByPlayer[shot.player] || 0) + 1;

        const height = getWallHeight(wall);
        if (height === 'baja') {
          bajaCount.count++;
          const team = (shot.player === 'J1' || shot.player === 'J2') ? 'team1' : 'team2';
          if (point.winner === team) bajaCount.wins++;
        } else {
          altaCount.count++;
          const team = (shot.player === 'J1' || shot.player === 'J2') ? 'team1' : 'team2';
          if (point.winner === team) altaCount.wins++;
        }
      }
    }
  }

  const mostUsedWalls = Object.entries(wallShotsByZone)
    .map(([wall, count]) => ({ wall: wall as WallZoneId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    totalWallShots,
    wallShotsByZone,
    wallShotsByPlayer,
    wallWinRate: wallTotal > 0 ? Math.round((wallWins / wallTotal) * 100) : 0,
    wallWins,
    wallLosses,
    mostUsedWalls,
    wallVsNoWall: {
      withWall: {
        wins: wallWins,
        total: wallTotal,
        winPct: wallTotal > 0 ? Math.round((wallWins / wallTotal) * 100) : 0,
      },
      withoutWall: {
        wins: noWallWins,
        total: noWallTotal,
        winPct: noWallTotal > 0 ? Math.round((noWallWins / noWallTotal) * 100) : 0,
      },
    },
    wallByHeight: {
      baja: {
        count: bajaCount.count,
        winRate: bajaCount.count > 0 ? Math.round((bajaCount.wins / bajaCount.count) * 100) : 0,
      },
      alta: {
        count: altaCount.count,
        winRate: altaCount.count > 0 ? Math.round((altaCount.wins / altaCount.count) * 100) : 0,
      },
    },
  };
}
