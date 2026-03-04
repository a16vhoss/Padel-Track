import { Match } from '@/types/match';

interface CompactMatchData {
  t1: string;
  t2: string;
  p1: string[];
  p2: string[];
  sets: string;
  winner: string | null;
  pts: number;
  shots: number;
  date: string;
}

export function generateTextSummary(match: Match): string {
  const t1 = match.teams[0].name;
  const t2 = match.teams[1].name;
  const t1Players = match.teams[0].players.map((p) => p.name).join(' / ');
  const t2Players = match.teams[1].players.map((p) => p.name).join(' / ');

  const setsScore = match.sets
    .filter((s) => s.games.length > 0)
    .map((s) => `${s.score.team1}-${s.score.team2}`)
    .join(' | ');

  const totalPoints = match.sets.reduce(
    (sum, s) => sum + s.games.reduce((gSum, g) => gSum + g.points.length, 0),
    0
  );

  const totalShots = match.sets.reduce(
    (sum, s) => sum + s.games.reduce((gSum, g) => gSum + g.points.reduce((pSum, p) => pSum + p.shots.length, 0), 0),
    0
  );

  const winnerName = match.winner
    ? match.teams[match.winner === 'team1' ? 0 : 1].name
    : 'En curso';

  const date = new Date(match.createdAt).toLocaleDateString('es-ES');

  return [
    `🎾 TacticalPadel AI`,
    ``,
    `${t1} (${t1Players})`,
    `vs`,
    `${t2} (${t2Players})`,
    ``,
    `📊 ${setsScore}`,
    `🏆 ${winnerName}`,
    ``,
    `${totalPoints} puntos | ${totalShots} golpes`,
    `📅 ${date}`,
  ].join('\n');
}

export function encodeMatchForUrl(match: Match): string {
  const compact: CompactMatchData = {
    t1: match.teams[0].name,
    t2: match.teams[1].name,
    p1: match.teams[0].players.map((p) => p.name),
    p2: match.teams[1].players.map((p) => p.name),
    sets: match.sets
      .filter((s) => s.games.length > 0)
      .map((s) => `${s.score.team1}-${s.score.team2}`)
      .join('/'),
    winner: match.winner
      ? match.teams[match.winner === 'team1' ? 0 : 1].name
      : null,
    pts: match.sets.reduce(
      (sum, s) => sum + s.games.reduce((gSum, g) => gSum + g.points.length, 0),
      0
    ),
    shots: match.sets.reduce(
      (sum, s) => sum + s.games.reduce((gSum, g) => gSum + g.points.reduce((pSum, p) => pSum + p.shots.length, 0), 0),
      0
    ),
    date: new Date(match.createdAt).toISOString().split('T')[0],
  };

  return btoa(encodeURIComponent(JSON.stringify(compact)));
}

export function decodeMatchFromUrl(encoded: string): CompactMatchData | null {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded)));
  } catch {
    return null;
  }
}
