import { Match } from '@/types/match';
import { MatchStats } from '@/hooks/useStats';

export function computeStats(match: Match): MatchStats {
  const allPoints = match.sets.flatMap((s) => s.games.flatMap((g) => g.points));
  const allShots = allPoints.flatMap((p) => p.shots);

  const shotsByType: Record<string, number> = {};
  const shotsByZone: Record<number, number> = {};
  const shotsByPlayer: Record<string, number> = {};
  let intermediateZoneHits = 0;
  const winners = { team1: 0, team2: 0 };
  const errors = { team1: 0, team2: 0 };

  for (const shot of allShots) {
    shotsByType[shot.type] = (shotsByType[shot.type] || 0) + 1;

    if (shot.destination) {
      if (shot.destination.type === 'single') {
        shotsByZone[shot.destination.zone] = (shotsByZone[shot.destination.zone] || 0) + 1;
      } else {
        shotsByZone[shot.destination.primary] = (shotsByZone[shot.destination.primary] || 0) + 0.5;
        shotsByZone[shot.destination.secondary] = (shotsByZone[shot.destination.secondary] || 0) + 0.5;
        intermediateZoneHits++;
      }
    }

    shotsByPlayer[shot.player] = (shotsByPlayer[shot.player] || 0) + 1;

    const isT1 = shot.player === 'J1' || shot.player === 'J2';
    if (shot.status === 'W') { isT1 ? winners.team1++ : winners.team2++; }
    if (shot.status === 'X' || shot.status === 'DF') { isT1 ? errors.team1++ : errors.team2++; }
  }

  return {
    totalPoints: allPoints.length,
    totalShots: allShots.length,
    avgShotsPerPoint: allPoints.length > 0 ? Math.round((allShots.length / allPoints.length) * 10) / 10 : 0,
    winners,
    errors,
    shotsByType,
    shotsByZone,
    shotsByPlayer,
    intermediateZoneHits,
  };
}
