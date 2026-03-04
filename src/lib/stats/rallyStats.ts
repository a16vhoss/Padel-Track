import { Match, Point } from '@/types/match';

export interface RallyLengthBucket {
  label: string;
  range: [number, number];
  count: number;
  team1Wins: number;
  team2Wins: number;
  team1WinPct: number;
}

export interface RallyStats {
  averageRallyLength: number;
  medianRallyLength: number;
  maxRallyLength: number;
  minRallyLength: number;
  buckets: RallyLengthBucket[];
  distributionBySet: Array<{
    set: number;
    average: number;
    total: number;
  }>;
}

function getAllPoints(match: Match): Point[] {
  return match.sets.flatMap((s) => s.games.flatMap((g) => g.points));
}

export function computeRallyStats(match: Match): RallyStats {
  const points = getAllPoints(match);
  if (points.length === 0) {
    return {
      averageRallyLength: 0,
      medianRallyLength: 0,
      maxRallyLength: 0,
      minRallyLength: 0,
      buckets: [],
      distributionBySet: [],
    };
  }

  const lengths = points.map((p) => p.shots.length);
  const sorted = [...lengths].sort((a, b) => a - b);

  const average = Math.round((lengths.reduce((a, b) => a + b, 0) / lengths.length) * 10) / 10;
  const median = sorted[Math.floor(sorted.length / 2)];
  const max = sorted[sorted.length - 1];
  const min = sorted[0];

  // Buckets
  const bucketDefs: Array<{ label: string; range: [number, number] }> = [
    { label: '1 golpe', range: [1, 1] },
    { label: '2-3 golpes', range: [2, 3] },
    { label: '4-6 golpes', range: [4, 6] },
    { label: '7-10 golpes', range: [7, 10] },
    { label: '11+ golpes', range: [11, 999] },
  ];

  const buckets: RallyLengthBucket[] = bucketDefs.map(({ label, range }) => {
    const inBucket = points.filter((p) => p.shots.length >= range[0] && p.shots.length <= range[1]);
    const t1Wins = inBucket.filter((p) => p.winner === 'team1').length;
    const count = inBucket.length;
    return {
      label,
      range,
      count,
      team1Wins: t1Wins,
      team2Wins: count - t1Wins,
      team1WinPct: count > 0 ? Math.round((t1Wins / count) * 100) : 0,
    };
  });

  // Distribution by set
  const distributionBySet = match.sets.map((s, i) => {
    const setPoints = s.games.flatMap((g) => g.points);
    const setLengths = setPoints.map((p) => p.shots.length);
    const setAvg = setLengths.length > 0
      ? Math.round((setLengths.reduce((a, b) => a + b, 0) / setLengths.length) * 10) / 10
      : 0;
    return {
      set: i + 1,
      average: setAvg,
      total: setPoints.length,
    };
  });

  return {
    averageRallyLength: average,
    medianRallyLength: median,
    maxRallyLength: max,
    minRallyLength: min,
    buckets,
    distributionBySet,
  };
}
