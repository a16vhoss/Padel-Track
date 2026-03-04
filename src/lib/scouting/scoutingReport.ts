import { Match } from '@/types/match';
import { PlayerId, ShotType } from '@/types/shot';
import { PlayerProfile, ScoutingReport, ScoutingInsight, ShotPreference } from '@/types/scouting';

const SHOT_NAMES: Record<string, string> = {
  S: 'Saque', Re: 'Resto', V: 'Volea', B: 'Bandeja',
  Rm: 'Remate', Vi: 'Vibora', G: 'Globo', D: 'Dejada',
  Ch: 'Chiquita', Ps: 'Passing', BP: 'Bajada', CP: 'Contrapared',
  x4: 'Por 4', Bl: 'Bloqueo',
};

function getPlayerName(pid: PlayerId, match: Match): string {
  for (const team of match.teams) {
    for (const p of team.players) {
      if (p.id === pid) return p.name;
    }
  }
  return pid;
}

function getPlayerTeam(pid: PlayerId): 'team1' | 'team2' {
  return pid === 'J1' || pid === 'J2' ? 'team1' : 'team2';
}

export function buildPlayerProfile(
  matches: Match[],
  playerId: PlayerId,
): PlayerProfile {
  const allShots = matches.flatMap((m) =>
    m.sets.flatMap((s) => s.games.flatMap((g) => g.points.flatMap((p) => p.shots)))
  );

  const allPoints = matches.flatMap((m) =>
    m.sets.flatMap((s) => s.games.flatMap((g) => g.points))
  );

  const playerShots = allShots.filter((s) => s.player === playerId);
  const totalShots = playerShots.length;
  const totalWinners = playerShots.filter((s) => s.status === 'W').length;
  const totalErrors = playerShots.filter((s) => s.status === 'X' || s.status === 'DF').length;

  // Shot preferences
  const shotCounts = new Map<ShotType, { total: number; winners: number; errors: number }>();
  for (const s of playerShots) {
    const entry = shotCounts.get(s.type) || { total: 0, winners: 0, errors: 0 };
    entry.total++;
    if (s.status === 'W') entry.winners++;
    if (s.status === 'X' || s.status === 'DF') entry.errors++;
    shotCounts.set(s.type, entry);
  }

  const preferredShots: ShotPreference[] = Array.from(shotCounts.entries())
    .map(([type, stats]) => ({
      shotType: type,
      count: stats.total,
      percentage: totalShots > 0 ? Math.round((stats.total / totalShots) * 100) : 0,
      winnerRate: stats.total > 0 ? Math.round((stats.winners / stats.total) * 100) : 0,
      errorRate: stats.total > 0 ? Math.round((stats.errors / stats.total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Zone analysis
  const zoneCounts: Record<number, number> = {};
  const zoneErrors: Record<number, number> = {};
  for (const s of playerShots) {
    if (!s.destination) continue;
    const zone = s.destination.type === 'single' ? s.destination.zone : s.destination.primary;
    zoneCounts[zone] = (zoneCounts[zone] || 0) + 1;
    if (s.status === 'X' || s.status === 'DF') {
      zoneErrors[zone] = (zoneErrors[zone] || 0) + 1;
    }
  }

  const hotZones = Object.entries(zoneCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([z]) => Number(z));

  const dangerZones = Object.entries(zoneErrors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([z]) => Number(z));

  // Strengths & weaknesses
  const strengths: ScoutingInsight[] = [];
  const weaknesses: ScoutingInsight[] = [];

  for (const pref of preferredShots) {
    if (pref.count < 2) continue;
    const shotName = SHOT_NAMES[pref.shotType] ?? pref.shotType;

    if (pref.winnerRate >= 40) {
      strengths.push({
        area: shotName,
        description: `${pref.winnerRate}% de winners con ${shotName} (${pref.count} intentos)`,
        confidence: Math.min(pref.count * 10, 100),
        basedOnShots: pref.count,
      });
    }
    if (pref.errorRate >= 40) {
      weaknesses.push({
        area: shotName,
        description: `${pref.errorRate}% de errores con ${shotName} (${pref.count} intentos)`,
        confidence: Math.min(pref.count * 10, 100),
        basedOnShots: pref.count,
      });
    }
  }

  // Serve stats
  const serveShots = playerShots.filter((s) => s.type === 'S');
  const servePoints = allPoints.filter((p) => p.server === playerId);
  const firstServesIn = serveShots.filter((_, i) => {
    // Simplified: count serves that are not errors
    return serveShots[i].status !== 'X' && serveShots[i].status !== 'DF';
  }).length;

  const aces = serveShots.filter((s) => s.status === 'W').length;
  const dfs = serveShots.filter((s) => s.status === 'DF').length;
  const derechaServes = servePoints.filter((p) => p.serveSide === 'derecha').length;
  const izquierdaServes = servePoints.filter((p) => p.serveSide === 'izquierda').length;

  const team = getPlayerTeam(playerId);
  const firstServeWins = servePoints.filter((p) => p.winner === team).length;

  // Wall usage
  const wallShots = playerShots.filter((s) => s.modifiers.wallBounces.length > 0);
  const wallWinners = wallShots.filter((s) => s.status === 'W').length;
  const wallZoneCounts: Record<string, number> = {};
  for (const s of wallShots) {
    for (const w of s.modifiers.wallBounces) {
      wallZoneCounts[w] = (wallZoneCounts[w] || 0) + 1;
    }
  }
  const preferredWalls = Object.entries(wallZoneCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([w]) => w);

  const playerName = matches.length > 0 ? getPlayerName(playerId, matches[0]) : playerId;

  return {
    playerId,
    playerName,
    matchesAnalyzed: matches.length,
    lastUpdated: Date.now(),
    totalShots,
    totalWinners,
    totalErrors,
    winnerRate: totalShots > 0 ? Math.round((totalWinners / totalShots) * 100) : 0,
    errorRate: totalShots > 0 ? Math.round((totalErrors / totalShots) * 100) : 0,
    strengths,
    weaknesses,
    preferredShots,
    hotZones,
    dangerZones,
    serveStats: {
      firstServeIn: serveShots.length > 0 ? Math.round((firstServesIn / serveShots.length) * 100) : 0,
      firstServeWinPct: servePoints.length > 0 ? Math.round((firstServeWins / servePoints.length) * 100) : 0,
      secondServeWinPct: 0, // simplified
      aceCount: aces,
      doubleFaultCount: dfs,
      preferredServeSide: derechaServes > izquierdaServes * 1.3 ? 'derecha' :
        izquierdaServes > derechaServes * 1.3 ? 'izquierda' : 'balanced',
    },
    wallUsage: {
      totalWallShots: wallShots.length,
      wallWinnerRate: wallShots.length > 0 ? Math.round((wallWinners / wallShots.length) * 100) : 0,
      preferredWalls,
    },
  };
}

export function generateScoutingReport(
  matches: Match[],
  playerId: PlayerId,
): ScoutingReport {
  const profile = buildPlayerProfile(matches, playerId);
  const recommendations: string[] = [];

  // Generate recommendations based on profile
  for (const w of profile.weaknesses) {
    recommendations.push(`Trabajar ${w.area}: ${w.description}`);
  }

  if (profile.serveStats.doubleFaultCount > 2) {
    recommendations.push(`Reducir dobles faltas (${profile.serveStats.doubleFaultCount} en ${profile.matchesAnalyzed} partidos)`);
  }

  if (profile.strengths.length > 0) {
    const bestShot = profile.strengths[0];
    recommendations.push(`Aprovechar ${bestShot.area} como arma principal`);
  }

  if (profile.dangerZones.length > 0) {
    recommendations.push(`Evitar dirigir golpes a zonas ${profile.dangerZones.join(', ')} - alta tasa de error`);
  }

  if (profile.wallUsage.totalWallShots > 0 && profile.wallUsage.wallWinnerRate > 30) {
    recommendations.push(`Buen uso de pared (${profile.wallUsage.wallWinnerRate}% efectividad) - seguir buscando la pared`);
  }

  return {
    id: `scout-${playerId}-${Date.now()}`,
    playerProfile: profile,
    recommendations,
    generatedAt: Date.now(),
    matchIds: matches.map((m) => m.id),
  };
}
