import { Match, Point } from '@/types/match';
import { Shot, PlayerId } from '@/types/shot';
import { MatchStats } from '@/hooks/useStats';
import { ShotEffectivenessEntry } from './advancedStats';

interface InsightInput {
  match: Match;
  stats: MatchStats;
  shotEffectiveness?: ShotEffectivenessEntry[];
}

const SHOT_TYPE_NAMES: Record<string, string> = {
  S: 'saque', Re: 'resto', V: 'volea', B: 'bandeja',
  Rm: 'remate', Vi: 'vibora', G: 'globo', D: 'dejada',
  Ch: 'chiquita', Ps: 'passing shot', BP: 'bajada de pared',
  CP: 'contrapared', x4: 'por 4', Bl: 'bloqueo',
};

function getPlayerName(playerId: PlayerId, match: Match): string {
  for (const team of match.teams) {
    for (const player of team.players) {
      if (player.id === playerId) return player.shortName;
    }
  }
  return playerId;
}

function getTeamForPlayer(playerId: PlayerId): 'team1' | 'team2' {
  return playerId === 'J1' || playerId === 'J2' ? 'team1' : 'team2';
}

function getAllPoints(match: Match): Point[] {
  return match.sets.flatMap((s) => s.games.flatMap((g) => g.points));
}

export function generateInsights({ match, stats, shotEffectiveness }: InsightInput): string[] {
  const insights: string[] = [];
  const points = getAllPoints(match);
  const allShots = points.flatMap((p) => p.shots);

  if (allShots.length === 0) return insights;

  // 1. Team dominance - points won percentage
  const team1Points = points.filter((p) => p.winner === 'team1').length;
  const team2Points = points.filter((p) => p.winner === 'team2').length;
  const totalPoints = points.length;

  if (totalPoints > 0) {
    const team1Pct = Math.round((team1Points / totalPoints) * 100);
    const team2Pct = 100 - team1Pct;
    const dominantTeam = team1Pct > team2Pct ? match.teams[0].name : match.teams[1].name;
    const dominantPct = Math.max(team1Pct, team2Pct);

    if (dominantPct >= 60) {
      insights.push(`${dominantTeam} domina el partido con ${dominantPct}% de los puntos ganados`);
    }
  }

  // 2. Player with most winners
  const winnersByPlayer: Record<string, number> = {};
  for (const shot of allShots) {
    if (shot.status === 'W') {
      winnersByPlayer[shot.player] = (winnersByPlayer[shot.player] || 0) + 1;
    }
  }
  const topWinnerEntry = Object.entries(winnersByPlayer).sort((a, b) => b[1] - a[1])[0];
  if (topWinnerEntry && topWinnerEntry[1] >= 2) {
    const playerName = getPlayerName(topWinnerEntry[0] as PlayerId, match);
    insights.push(`${playerName} lidera en winners con ${topWinnerEntry[1]} golpes ganadores`);
  }

  // 3. Most effective shot type
  if (shotEffectiveness && shotEffectiveness.length > 0) {
    const effectiveShots = shotEffectiveness
      .filter((e) => e.total >= 3 && e.winnerPct > 0)
      .sort((a, b) => b.winnerPct - a.winnerPct);

    if (effectiveShots.length > 0) {
      const best = effectiveShots[0];
      const shotName = SHOT_TYPE_NAMES[best.type] ?? best.type;
      insights.push(`La ${shotName} es el golpe mas efectivo con ${best.winnerPct}% de winners`);
    }
  }

  // 4. Player with highest error rate
  const errorsByPlayer: Record<string, number> = {};
  const totalByPlayer: Record<string, number> = {};

  for (const shot of allShots) {
    totalByPlayer[shot.player] = (totalByPlayer[shot.player] || 0) + 1;
    if (shot.status === 'X' || shot.status === 'DF') {
      errorsByPlayer[shot.player] = (errorsByPlayer[shot.player] || 0) + 1;
    }
  }

  let worstPlayer: { id: string; pct: number } | null = null;
  for (const [playerId, total] of Object.entries(totalByPlayer)) {
    if (total < 3) continue;
    const errors = errorsByPlayer[playerId] || 0;
    const pct = Math.round((errors / total) * 100);
    if (!worstPlayer || pct > worstPlayer.pct) {
      worstPlayer = { id: playerId, pct };
    }
  }

  if (worstPlayer && worstPlayer.pct >= 20) {
    const playerName = getPlayerName(worstPlayer.id as PlayerId, match);
    insights.push(`${playerName} tiene la mayor tasa de error (${worstPlayer.pct}%)`);
  }

  // 5. Zone with most errors
  const errorsByZone: Record<number, number> = {};
  for (const shot of allShots) {
    if ((shot.status === 'X' || shot.status === 'DF') && shot.destination) {
      const zone = shot.destination.type === 'single'
        ? shot.destination.zone
        : shot.destination.primary;
      errorsByZone[zone] = (errorsByZone[zone] || 0) + 1;
    }
  }

  const ZONE_LABELS: Record<number, string> = {
    1: 'fondo izquierdo', 2: 'fondo interior izq', 3: 'fondo centro',
    4: 'fondo interior der', 5: 'fondo derecho',
    6: 'media izquierda', 7: 'media interior izq', 8: 'media centro',
    9: 'media interior der', 10: 'media derecha',
    11: 'red izquierda', 12: 'red interior izq', 13: 'red centro',
    14: 'red interior der', 15: 'red derecha',
  };

  const topErrorZone = Object.entries(errorsByZone).sort((a, b) => b[1] - a[1])[0];
  if (topErrorZone && Number(topErrorZone[1]) >= 2) {
    const zoneName = ZONE_LABELS[Number(topErrorZone[0])] ?? `zona ${topErrorZone[0]}`;
    insights.push(`La zona de ${zoneName} concentra ${topErrorZone[1]} errores`);
  }

  // 6. Winners comparison between teams
  const totalWinners = (stats.winners.team1 || 0) + (stats.winners.team2 || 0);
  if (totalWinners >= 4) {
    const t1Pct = Math.round(((stats.winners.team1 || 0) / totalWinners) * 100);
    if (t1Pct >= 65) {
      insights.push(`${match.teams[0].name} acumula ${t1Pct}% de todos los winners`);
    } else if (t1Pct <= 35) {
      insights.push(`${match.teams[1].name} acumula ${100 - t1Pct}% de todos los winners`);
    }
  }

  return insights.slice(0, 4); // max 4 insights
}
