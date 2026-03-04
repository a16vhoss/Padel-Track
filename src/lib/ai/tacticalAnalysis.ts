import { Match, Point } from '@/types/match';
import { Shot, PlayerId, ShotType } from '@/types/shot';

export interface TacticalRecommendation {
  type: 'strength' | 'weakness' | 'opportunity' | 'strategy';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  basedOn: string;
}

export interface MatchNarrative {
  title: string;
  summary: string;
  keyMoments: string[];
  playerHighlights: Record<string, string[]>;
  tacticalSummary: string;
}

const SHOT_NAMES: Record<string, string> = {
  S: 'saque', Re: 'resto', V: 'volea', B: 'bandeja',
  Rm: 'remate', Vi: 'vibora', G: 'globo', D: 'dejada',
  Ch: 'chiquita', Ps: 'passing shot', BP: 'bajada de pared',
  CP: 'contrapared', x4: 'por 4', Bl: 'bloqueo',
};

const ZONE_NAMES: Record<number, string> = {
  1: 'fondo izq', 2: 'fondo int-izq', 3: 'fondo centro',
  4: 'fondo int-der', 5: 'fondo der',
  6: 'media izq', 7: 'media int-izq', 8: 'media centro',
  9: 'media int-der', 10: 'media der',
  11: 'red izq', 12: 'red int-izq', 13: 'red centro',
  14: 'red int-der', 15: 'red der',
};

function getAllPoints(match: Match): Point[] {
  return match.sets.flatMap((s) => s.games.flatMap((g) => g.points));
}

function getPlayerName(pid: PlayerId, match: Match): string {
  for (const team of match.teams) {
    for (const p of team.players) {
      if (p.id === pid) return p.shortName;
    }
  }
  return pid;
}

function getPlayerTeam(pid: PlayerId): 'team1' | 'team2' {
  return pid === 'J1' || pid === 'J2' ? 'team1' : 'team2';
}

export function generateTacticalRecommendations(match: Match): TacticalRecommendation[] {
  const points = getAllPoints(match);
  const allShots = points.flatMap((p) => p.shots);
  const recommendations: TacticalRecommendation[] = [];

  if (allShots.length < 5) return recommendations;

  // Analyze by player
  const players: PlayerId[] = ['J1', 'J2', 'J3', 'J4'];

  for (const pid of players) {
    const playerShots = allShots.filter((s) => s.player === pid);
    if (playerShots.length < 3) continue;
    const playerName = getPlayerName(pid, match);
    const team = getPlayerTeam(pid);

    // Shot type effectiveness
    const shotTypeStats = new Map<ShotType, { total: number; winners: number; errors: number }>();
    for (const s of playerShots) {
      const entry = shotTypeStats.get(s.type) || { total: 0, winners: 0, errors: 0 };
      entry.total++;
      if (s.status === 'W') entry.winners++;
      if (s.status === 'X' || s.status === 'DF') entry.errors++;
      shotTypeStats.set(s.type, entry);
    }

    // Find best and worst shots
    for (const [type, stats] of shotTypeStats) {
      if (stats.total < 2) continue;
      const winRate = (stats.winners / stats.total) * 100;
      const errRate = (stats.errors / stats.total) * 100;
      const shotName = SHOT_NAMES[type] ?? type;

      if (winRate >= 50 && stats.winners >= 2) {
        recommendations.push({
          type: 'strength',
          title: `${playerName}: ${shotName} letal`,
          description: `${playerName} tiene ${Math.round(winRate)}% de winners con la ${shotName} (${stats.winners}/${stats.total}). Aprovechar esta arma.`,
          priority: 'high',
          basedOn: `${stats.total} golpes analizados`,
        });
      }

      if (errRate >= 50 && stats.errors >= 2) {
        recommendations.push({
          type: 'weakness',
          title: `${playerName}: errores en ${shotName}`,
          description: `${playerName} tiene ${Math.round(errRate)}% de error en la ${shotName} (${stats.errors}/${stats.total}). Trabajar este golpe en entrenamiento.`,
          priority: 'high',
          basedOn: `${stats.total} golpes analizados`,
        });
      }
    }

    // Zone analysis — where does this player make most errors?
    const errorsByZone: Record<number, number> = {};
    for (const s of playerShots) {
      if ((s.status === 'X' || s.status === 'DF') && s.destination) {
        const zone = s.destination.type === 'single' ? s.destination.zone : s.destination.primary;
        errorsByZone[zone] = (errorsByZone[zone] || 0) + 1;
      }
    }

    const topErrorZone = Object.entries(errorsByZone).sort((a, b) => b[1] - a[1])[0];
    if (topErrorZone && Number(topErrorZone[1]) >= 2) {
      const zoneName = ZONE_NAMES[Number(topErrorZone[0])] ?? `zona ${topErrorZone[0]}`;
      recommendations.push({
        type: 'opportunity',
        title: `Atacar zona ${zoneName} de ${playerName}`,
        description: `${playerName} acumula ${topErrorZone[1]} errores en ${zoneName}. Dirigir golpes a esa zona.`,
        priority: 'medium',
        basedOn: `${playerShots.length} golpes analizados`,
      });
    }
  }

  // Team-level strategies
  const team1Points = points.filter((p) => p.winner === 'team1').length;
  const team2Points = points.filter((p) => p.winner === 'team2').length;

  // Rally length analysis
  const shortRallies = points.filter((p) => p.shots.length <= 3);
  const longRallies = points.filter((p) => p.shots.length >= 7);

  if (shortRallies.length > longRallies.length * 2) {
    const shortWins1 = shortRallies.filter((p) => p.winner === 'team1').length;
    const dominant = shortWins1 > shortRallies.length / 2 ? match.teams[0].name : match.teams[1].name;
    recommendations.push({
      type: 'strategy',
      title: 'Puntos cortos dominan',
      description: `${Math.round((shortRallies.length / points.length) * 100)}% de los puntos son rallies cortos (≤3 golpes). ${dominant} los domina. Considerar alargar los rallies si estás perdiendo.`,
      priority: 'medium',
      basedOn: `${points.length} puntos analizados`,
    });
  }

  // Wall usage recommendation
  const wallShots = allShots.filter((s) => s.modifiers.wallBounces.length > 0);
  if (wallShots.length >= 3) {
    const wallPoints = new Set(points.filter((p) => p.shots.some((s) => s.modifiers.wallBounces.length > 0)));
    const wallWins1 = Array.from(wallPoints).filter((p) => p.winner === 'team1').length;
    const wallTotal = wallPoints.size;
    if (wallTotal >= 3) {
      const pct1 = Math.round((wallWins1 / wallTotal) * 100);
      const betterTeam = pct1 > 50 ? match.teams[0].name : match.teams[1].name;
      recommendations.push({
        type: 'strategy',
        title: 'Juego de pared',
        description: `En puntos con pared, ${betterTeam} gana el ${Math.max(pct1, 100 - pct1)}% de las veces. ${pct1 > 50 ? 'Seguir buscando la pared' : 'Evitar el juego de pared'}.`,
        priority: 'low',
        basedOn: `${wallTotal} puntos con pared`,
      });
    }
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  }).slice(0, 12);
}

export function generateMatchNarrative(match: Match): MatchNarrative {
  const points = getAllPoints(match);
  const allShots = points.flatMap((p) => p.shots);
  const team1Name = match.teams[0].name;
  const team2Name = match.teams[1].name;

  // Basic stats
  const t1Points = points.filter((p) => p.winner === 'team1').length;
  const t2Points = points.filter((p) => p.winner === 'team2').length;
  const totalShots = allShots.length;
  const avgRally = points.length > 0 ? Math.round((totalShots / points.length) * 10) / 10 : 0;

  // Result
  const setScores = match.sets
    .filter((s) => s.winner !== null)
    .map((s) => `${s.score.team1}-${s.score.team2}`)
    .join(', ');

  const winnerName = match.winner === 'team1' ? team1Name : match.winner === 'team2' ? team2Name : null;

  const title = winnerName
    ? `${winnerName} gana ${setScores}`
    : `Partido en curso: ${team1Name} vs ${team2Name}`;

  const summary = winnerName
    ? `${winnerName} se impuso a ${match.winner === 'team1' ? team2Name : team1Name} por ${setScores}. Se jugaron ${points.length} puntos con un promedio de ${avgRally} golpes por rally.`
    : `Partido en curso entre ${team1Name} y ${team2Name}. Llevan ${points.length} puntos jugados.`;

  // Key moments
  const keyMoments: string[] = [];

  // Find longest rally
  const longestRally = points.reduce((max, p) => p.shots.length > max.shots.length ? p : max, points[0]);
  if (longestRally && longestRally.shots.length >= 5) {
    const winnerTeam = longestRally.winner === 'team1' ? team1Name : team2Name;
    keyMoments.push(`Rally mas largo: ${longestRally.shots.length} golpes (ganado por ${winnerTeam})`);
  }

  // Streaks
  let maxStreak = 0;
  let currentStreak = 0;
  let streakTeam: 'team1' | 'team2' = 'team1';
  for (const p of points) {
    if (currentStreak === 0 || p.winner === streakTeam) {
      currentStreak++;
      streakTeam = p.winner;
    } else {
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
      currentStreak = 1;
      streakTeam = p.winner;
    }
  }
  if (currentStreak > maxStreak) maxStreak = currentStreak;
  if (maxStreak >= 3) {
    keyMoments.push(`Racha maxima: ${maxStreak} puntos consecutivos`);
  }

  // Player highlights
  const playerHighlights: Record<string, string[]> = {};
  const pids: PlayerId[] = ['J1', 'J2', 'J3', 'J4'];
  for (const pid of pids) {
    const name = getPlayerName(pid, match);
    const pShots = allShots.filter((s) => s.player === pid);
    if (pShots.length === 0) continue;

    const highlights: string[] = [];
    const winners = pShots.filter((s) => s.status === 'W').length;
    const errors = pShots.filter((s) => s.status === 'X' || s.status === 'DF').length;

    if (winners > 0) highlights.push(`${winners} winners`);
    if (errors > 0) highlights.push(`${errors} errores`);
    highlights.push(`${pShots.length} golpes totales`);

    playerHighlights[name] = highlights;
  }

  const tacticalSummary = `El partido se definio por ${avgRally > 5 ? 'rallies largos' : avgRally > 3 ? 'intercambios moderados' : 'puntos rapidos'}. ${t1Points > t2Points ? team1Name : team2Name} domino con ${Math.max(t1Points, t2Points)} puntos ganados (${Math.round((Math.max(t1Points, t2Points) / points.length) * 100)}%).`;

  return {
    title,
    summary,
    keyMoments,
    playerHighlights,
    tacticalSummary,
  };
}
