import { Match, Point } from '@/types/match';
import { Shot, PlayerId, ShotType } from '@/types/shot';
import { FloorZoneId } from '@/types/zones';

// ---------------------------------------------------------------------------
// Filter types
// ---------------------------------------------------------------------------

export type AnalysisFilter =
  | { type: 'all' }
  | { type: 'team'; team: 'team1' | 'team2' }
  | { type: 'player'; player: PlayerId }
  | { type: 'set'; set: number };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAllPoints(match: Match): Point[] {
  return match.sets.flatMap((s) => s.games.flatMap((g) => g.points));
}

function isTeam1Player(p: PlayerId): boolean {
  return p === 'J1' || p === 'J2';
}

function getZoneId(shot: Shot): FloorZoneId | null {
  if (!shot.destination) return null;
  if (shot.destination.type === 'single') return shot.destination.zone;
  return shot.destination.primary;
}

// ---------------------------------------------------------------------------
// filterShots
// ---------------------------------------------------------------------------

export function filterShots(match: Match, filter: AnalysisFilter): Shot[] {
  const points = getAllPoints(match);
  const allShots = points.flatMap((p) => p.shots);

  switch (filter.type) {
    case 'all':
      return allShots;
    case 'team':
      return allShots.filter((s) =>
        filter.team === 'team1' ? isTeam1Player(s.player) : !isTeam1Player(s.player),
      );
    case 'player':
      return allShots.filter((s) => s.player === filter.player);
    case 'set': {
      const setPoints = match.sets
        .filter((s) => s.setNumber === filter.set)
        .flatMap((s) => s.games.flatMap((g) => g.points));
      return setPoints.flatMap((p) => p.shots);
    }
  }
}

// ---------------------------------------------------------------------------
// computeHeatmap
// ---------------------------------------------------------------------------

export interface HeatmapData {
  counts: Record<number, number>;
  max: number;
}

export function computeHeatmap(match: Match, filter: AnalysisFilter): HeatmapData {
  const shots = filterShots(match, filter);
  const counts: Record<number, number> = {};

  for (const shot of shots) {
    if (!shot.destination) continue;
    if (shot.destination.type === 'single') {
      counts[shot.destination.zone] = (counts[shot.destination.zone] || 0) + 1;
    } else if (shot.destination.type === 'intermediate') {
      counts[shot.destination.primary] = (counts[shot.destination.primary] || 0) + 0.5;
      counts[shot.destination.secondary] = (counts[shot.destination.secondary] || 0) + 0.5;
    }
  }

  return { counts, max: Math.max(...Object.values(counts), 0) };
}

// ---------------------------------------------------------------------------
// computeWinnersErrors
// ---------------------------------------------------------------------------

export interface WinnersErrorsData {
  winners: Record<number, number>;
  errors: Record<number, number>;
}

export function computeWinnersErrors(match: Match, filter: AnalysisFilter): WinnersErrorsData {
  const shots = filterShots(match, filter);
  const winners: Record<number, number> = {};
  const errors: Record<number, number> = {};

  for (const shot of shots) {
    const zone = getZoneId(shot);
    if (zone === null) continue;

    if (shot.status === 'W') {
      winners[zone] = (winners[zone] || 0) + 1;
    }
    if (shot.status === 'X' || shot.status === 'DF') {
      errors[zone] = (errors[zone] || 0) + 1;
    }
  }

  return { winners, errors };
}

// ---------------------------------------------------------------------------
// computeZoneFlow
// ---------------------------------------------------------------------------

export interface ZoneTransition {
  from: FloorZoneId;
  to: FloorZoneId;
  count: number;
}

export function computeZoneFlow(match: Match, filter: AnalysisFilter): ZoneTransition[] {
  const points = getAllPoints(match);
  const flowMap = new Map<string, ZoneTransition>();

  for (const point of points) {
    // Apply filter at shot level
    const shots = point.shots.filter((s) => {
      switch (filter.type) {
        case 'all': return true;
        case 'team': return filter.team === 'team1' ? isTeam1Player(s.player) : !isTeam1Player(s.player);
        case 'player': return s.player === filter.player;
        case 'set': return point.setNumber === filter.set;
      }
    });

    for (let i = 0; i < shots.length - 1; i++) {
      const fromZone = getZoneId(shots[i]);
      const toZone = getZoneId(shots[i + 1]);
      if (fromZone === null || toZone === null || fromZone === toZone) continue;

      const key = `${fromZone}-${toZone}`;
      const existing = flowMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        flowMap.set(key, { from: fromZone, to: toZone, count: 1 });
      }
    }
  }

  // Sort by count descending and limit to top 15
  return Array.from(flowMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
}

// ---------------------------------------------------------------------------
// computeShotEffectiveness
// ---------------------------------------------------------------------------

export interface ShotEffectivenessEntry {
  type: ShotType;
  total: number;
  winners: number;
  errors: number;
  neutral: number;
  winnerPct: number;
  errorPct: number;
  neutralPct: number;
}

export function computeShotEffectiveness(
  match: Match,
  filter: AnalysisFilter,
): ShotEffectivenessEntry[] {
  const shots = filterShots(match, filter);
  const byType = new Map<ShotType, { total: number; winners: number; errors: number }>();

  for (const shot of shots) {
    const entry = byType.get(shot.type) || { total: 0, winners: 0, errors: 0 };
    entry.total++;
    if (shot.status === 'W') entry.winners++;
    if (shot.status === 'X' || shot.status === 'DF') entry.errors++;
    byType.set(shot.type, entry);
  }

  return Array.from(byType.entries())
    .map(([type, { total, winners, errors }]) => {
      const neutral = total - winners - errors;
      return {
        type,
        total,
        winners,
        errors,
        neutral,
        winnerPct: total > 0 ? Math.round((winners / total) * 100) : 0,
        errorPct: total > 0 ? Math.round((errors / total) * 100) : 0,
        neutralPct: total > 0 ? Math.round((neutral / total) * 100) : 0,
      };
    })
    .filter((e) => e.total > 0)
    .sort((a, b) => b.total - a.total);
}

// ---------------------------------------------------------------------------
// computePointTimeline
// ---------------------------------------------------------------------------

export interface TimelinePoint {
  pointNumber: number;
  setNumber: number;
  gameNumber: number;
  winner: 'team1' | 'team2';
  cause: string;
  scoreAfter: string;
  shotCount: number;
}

export function computePointTimeline(match: Match): TimelinePoint[] {
  return getAllPoints(match).map((p) => ({
    pointNumber: p.pointNumber,
    setNumber: p.setNumber,
    gameNumber: p.gameNumber,
    winner: p.winner,
    cause: p.cause,
    scoreAfter: p.scoreAfter,
    shotCount: p.shots.length,
  }));
}

// ---------------------------------------------------------------------------
// getPointsForReplay
// ---------------------------------------------------------------------------

export interface ReplayPoint {
  index: number;
  label: string;
  shots: Shot[];
  winner: 'team1' | 'team2';
}

export function getPointsForReplay(match: Match): ReplayPoint[] {
  return getAllPoints(match).map((p, i) => ({
    index: i,
    label: `P${i + 1}: ${p.scoreBefore}, ${p.shots.length} golpes`,
    shots: p.shots,
    winner: p.winner,
  }));
}
