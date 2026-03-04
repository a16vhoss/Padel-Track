import { Match } from '@/types/match';
import { PlayerId } from '@/types/shot';

export interface MatchComparisonEntry {
  matchId: string;
  date: string;
  opponent: string;
  result: string;
  totalPoints: number;
  totalShots: number;
  avgShotsPerPoint: number;
  winners: number;
  errors: number;
  winnerRate: number;
  errorRate: number;
  aces: number;
  doubleFaults: number;
}

export interface ComparisonTrend {
  metric: string;
  values: number[];
  labels: string[];
  trend: 'improving' | 'declining' | 'stable';
  changePercent: number;
}

export interface MatchComparison {
  matches: MatchComparisonEntry[];
  trends: ComparisonTrend[];
  summary: string;
}

function getTeamForPlayer(player: PlayerId): 'team1' | 'team2' {
  return player === 'J1' || player === 'J2' ? 'team1' : 'team2';
}

export function compareMatches(
  matches: Match[],
  perspective?: { type: 'team'; team: 'team1' | 'team2' } | { type: 'player'; player: PlayerId }
): MatchComparison {
  const entries: MatchComparisonEntry[] = matches.map((match) => {
    const allPoints = match.sets.flatMap((s) => s.games.flatMap((g) => g.points));
    const allShots = allPoints.flatMap((p) => p.shots);

    let filteredShots = allShots;
    if (perspective) {
      if (perspective.type === 'player') {
        filteredShots = allShots.filter((s) => s.player === perspective.player);
      } else if (perspective.type === 'team') {
        filteredShots = allShots.filter((s) => getTeamForPlayer(s.player) === perspective.team);
      }
    }

    const winners = filteredShots.filter((s) => s.status === 'W').length;
    const errors = filteredShots.filter((s) => s.status === 'X' || s.status === 'DF').length;
    const total = filteredShots.length;
    const aces = filteredShots.filter((s) => s.type === 'S' && s.status === 'W').length;
    const dfs = filteredShots.filter((s) => s.status === 'DF').length;

    const setScores = match.sets
      .filter((s) => s.winner !== null)
      .map((s) => `${s.score.team1}-${s.score.team2}`)
      .join(', ');

    return {
      matchId: match.id,
      date: new Date(match.createdAt).toLocaleDateString('es-ES'),
      opponent: match.teams[1].name,
      result: match.winner ? `${match.winner === 'team1' ? 'Victoria' : 'Derrota'} (${setScores})` : 'En curso',
      totalPoints: allPoints.length,
      totalShots: total,
      avgShotsPerPoint: allPoints.length > 0 ? Math.round((total / allPoints.length) * 10) / 10 : 0,
      winners,
      errors,
      winnerRate: total > 0 ? Math.round((winners / total) * 100) : 0,
      errorRate: total > 0 ? Math.round((errors / total) * 100) : 0,
      aces,
      doubleFaults: dfs,
    };
  });

  // Compute trends
  const trends: ComparisonTrend[] = [];

  if (entries.length >= 2) {
    const metrics: Array<{ metric: string; key: keyof MatchComparisonEntry }> = [
      { metric: '% Winners', key: 'winnerRate' },
      { metric: '% Errores', key: 'errorRate' },
      { metric: 'Golpes/Punto', key: 'avgShotsPerPoint' },
    ];

    for (const { metric, key } of metrics) {
      const values = entries.map((e) => e[key] as number);
      const labels = entries.map((e) => e.date);
      const first = values[0];
      const last = values[values.length - 1];
      const changePercent = first !== 0 ? Math.round(((last - first) / first) * 100) : 0;
      const trend: 'improving' | 'declining' | 'stable' =
        Math.abs(changePercent) < 5 ? 'stable' :
        (key === 'errorRate' ? (changePercent < 0 ? 'improving' : 'declining') :
         (changePercent > 0 ? 'improving' : 'declining'));

      trends.push({ metric, values, labels, trend, changePercent });
    }
  }

  // Summary
  let summary = '';
  if (entries.length >= 2) {
    const improving = trends.filter((t) => t.trend === 'improving');
    const declining = trends.filter((t) => t.trend === 'declining');
    if (improving.length > declining.length) {
      summary = `Tendencia positiva: mejora en ${improving.map((t) => t.metric).join(', ')}`;
    } else if (declining.length > improving.length) {
      summary = `Areas de atención: ${declining.map((t) => t.metric).join(', ')} en declive`;
    } else {
      summary = 'Rendimiento estable en los últimos partidos';
    }
  } else {
    summary = 'Se necesitan al menos 2 partidos para ver tendencias';
  }

  return { matches: entries, trends, summary };
}
