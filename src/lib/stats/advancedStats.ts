import { Match, Point } from '@/types/match';
import { Shot, PlayerId, ShotType } from '@/types/shot';
import { FloorZoneId, WallZoneId } from '@/types/zones';

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

// ---------------------------------------------------------------------------
// computeWallHeatmap
// ---------------------------------------------------------------------------

export interface WallHeatmapData {
  zones: Record<string, { total: number; winners: number; errors: number }>;
  max: number;
}

export function computeWallHeatmap(
  match: Match,
  playerFilter?: PlayerId,
  setFilter?: number,
): WallHeatmapData {
  let points = getAllPoints(match);
  if (setFilter !== undefined) {
    points = points.filter((p) => p.setNumber === setFilter);
  }

  const zones: Record<string, { total: number; winners: number; errors: number }> = {};

  for (const point of points) {
    for (const shot of point.shots) {
      if (playerFilter && shot.player !== playerFilter) continue;
      for (const wall of shot.modifiers.wallBounces) {
        if (!zones[wall]) zones[wall] = { total: 0, winners: 0, errors: 0 };
        zones[wall].total++;
        if (shot.status === 'W') zones[wall].winners++;
        if (shot.status === 'X') zones[wall].errors++;
      }
    }
  }

  const max = Math.max(...Object.values(zones).map((z) => z.total), 0);
  return { zones, max };
}

// ---------------------------------------------------------------------------
// computePlayerRadarStats
// ---------------------------------------------------------------------------

export interface PlayerRadarStats {
  attack: number;
  defense: number;
  serve: number;
  return_: number;
  net: number;
  consistency: number;
}

export function computePlayerRadarStats(
  match: Match,
  playerId: PlayerId,
  setFilter?: number,
): PlayerRadarStats {
  let points = getAllPoints(match);
  if (setFilter !== undefined) {
    points = points.filter((p) => p.setNumber === setFilter);
  }

  const playerTeam = (playerId === 'J1' || playerId === 'J2') ? 'team1' : 'team2';
  let totalShots = 0;
  let winners = 0;
  let errors = 0;
  let netZoneWinners = 0;
  let servePoints = 0;
  let firstServeIn = 0;
  let aces = 0;
  let returnPoints = 0;
  let returnPointsWon = 0;
  let defensivePoints = 0;
  let defensiveNonErrors = 0;

  for (const point of points) {
    const playerShots = point.shots.filter((s) => s.player === playerId);
    totalShots += playerShots.length;

    for (const shot of playerShots) {
      if (shot.status === 'W') {
        winners++;
        // Net zone: floor zones 11-15
        const zone = getZoneId(shot);
        if (zone !== null && zone >= 11 && zone <= 15) netZoneWinners++;
      }
      if (shot.status === 'X' || shot.status === 'DF') errors++;
    }

    // Serve stats for this player
    if (point.server === playerId) {
      servePoints++;
      const serves = point.shots.filter((s) => s.type === 'S' && s.player === playerId);
      if (serves.length > 0 && serves[0].status !== 'X' && serves[0].status !== 'DF') {
        firstServeIn++;
      }
      if (serves.length > 0 && serves[0].status === 'W') aces++;
    }

    // Return stats: point where this player's team is returning
    const serverTeam = (point.server === 'J1' || point.server === 'J2') ? 'team1' : 'team2';
    if (serverTeam !== playerTeam) {
      const hasReturn = point.shots.some((s) => s.player === playerId && s.type === 'Re');
      if (hasReturn) {
        returnPoints++;
        if (point.winner === playerTeam) returnPointsWon++;
      }
    }

    // Defense: points where opponent hits toward player
    const opponentShots = point.shots.filter((s) => s.player !== playerId &&
      ((playerId === 'J1' || playerId === 'J2') ? (s.player === 'J3' || s.player === 'J4') : (s.player === 'J1' || s.player === 'J2'))
    );
    if (opponentShots.length > 0) {
      defensivePoints++;
      const playerErrors = playerShots.filter((s) => s.status === 'X' || s.status === 'DF').length;
      if (playerErrors === 0) defensiveNonErrors++;
    }
  }

  // Normalize all to 0-100
  const attack = totalShots > 0 ? Math.min(100, Math.round((winners / totalShots) * 400)) : 0;
  const defense = defensivePoints > 0 ? Math.round((defensiveNonErrors / defensivePoints) * 100) : 0;
  const serve = servePoints > 0
    ? Math.round(((firstServeIn / servePoints) * 70 + (aces / Math.max(servePoints, 1)) * 30) * 100 / 100)
    : 0;
  const return_ = returnPoints > 0 ? Math.round((returnPointsWon / returnPoints) * 100) : 0;
  const net = winners > 0 ? Math.min(100, Math.round((netZoneWinners / Math.max(winners, 1)) * 200)) : 0;
  const consistency = totalShots > 0 ? Math.round((1 - errors / totalShots) * 100) : 0;

  return { attack, defense, serve, return_, net, consistency };
}
