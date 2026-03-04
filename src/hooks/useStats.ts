'use client';

import { useMemo } from 'react';
import { Match, Point } from '@/types/match';
import { Shot } from '@/types/shot';

export interface MatchStats {
  totalPoints: number;
  totalShots: number;
  avgShotsPerPoint: number;
  winners: { team1: number; team2: number };
  errors: { team1: number; team2: number };
  shotsByType: Record<string, number>;
  shotsByZone: Record<number, number>;
  shotsByPlayer: Record<string, number>;
  intermediateZoneHits: number;
}

function getAllPoints(match: Match): Point[] {
  return match.sets.flatMap((s) => s.games.flatMap((g) => g.points));
}

function isTeam1Player(player: string): boolean {
  return player === 'J1' || player === 'J2';
}

export function useStats(match: Match | null): MatchStats {
  return useMemo(() => {
    if (!match) {
      return {
        totalPoints: 0,
        totalShots: 0,
        avgShotsPerPoint: 0,
        winners: { team1: 0, team2: 0 },
        errors: { team1: 0, team2: 0 },
        shotsByType: {},
        shotsByZone: {},
        shotsByPlayer: {},
        intermediateZoneHits: 0,
      };
    }

    const points = getAllPoints(match);
    const allShots = points.flatMap((p) => p.shots);

    const shotsByType: Record<string, number> = {};
    const shotsByZone: Record<number, number> = {};
    const shotsByPlayer: Record<string, number> = {};
    let intermediateZoneHits = 0;
    const winners = { team1: 0, team2: 0 };
    const errors = { team1: 0, team2: 0 };

    for (const shot of allShots) {
      // By type
      shotsByType[shot.type] = (shotsByType[shot.type] || 0) + 1;

      // By zone
      if (shot.destination) {
        if (shot.destination.type === 'single') {
          shotsByZone[shot.destination.zone] = (shotsByZone[shot.destination.zone] || 0) + 1;
        } else {
          shotsByZone[shot.destination.primary] = (shotsByZone[shot.destination.primary] || 0) + 0.5;
          shotsByZone[shot.destination.secondary] = (shotsByZone[shot.destination.secondary] || 0) + 0.5;
          intermediateZoneHits++;
        }
      }

      // By player
      shotsByPlayer[shot.player] = (shotsByPlayer[shot.player] || 0) + 1;

      // Winners & errors
      if (shot.status === 'W') {
        if (isTeam1Player(shot.player)) winners.team1++;
        else winners.team2++;
      }
      if (shot.status === 'X' || shot.status === 'DF') {
        if (isTeam1Player(shot.player)) errors.team1++;
        else errors.team2++;
      }
    }

    return {
      totalPoints: points.length,
      totalShots: allShots.length,
      avgShotsPerPoint: points.length > 0 ? Math.round((allShots.length / points.length) * 10) / 10 : 0,
      winners,
      errors,
      shotsByType,
      shotsByZone,
      shotsByPlayer,
      intermediateZoneHits,
    };
  }, [match]);
}
