import { Match } from '@/types/match';
import { FloorZoneId } from '@/types/zones';

export function getHeatmapData(match: Match): Record<number, number> {
  const counts: Record<number, number> = {};
  const allPoints = match.sets.flatMap((s) => s.games.flatMap((g) => g.points));

  for (const point of allPoints) {
    for (const shot of point.shots) {
      if (shot.destination.type === 'single') {
        counts[shot.destination.zone] = (counts[shot.destination.zone] || 0) + 1;
      } else {
        counts[shot.destination.primary] = (counts[shot.destination.primary] || 0) + 0.5;
        counts[shot.destination.secondary] = (counts[shot.destination.secondary] || 0) + 0.5;
      }
    }
  }

  return counts;
}
