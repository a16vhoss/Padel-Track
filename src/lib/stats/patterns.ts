import { Match, Point } from '@/types/match';
import { Shot, ShotType, PlayerId } from '@/types/shot';

export interface TacticalPattern {
  sequence: ShotType[];
  players: PlayerId[];
  count: number;
  winRate: number;
  wins: number;
  losses: number;
  description: string;
}

export interface PatternAnalysis {
  topWinningPatterns: TacticalPattern[];
  topLosingPatterns: TacticalPattern[];
  playerPatterns: Record<string, TacticalPattern[]>;
  twoShotCombos: TacticalPattern[];
  threeShotCombos: TacticalPattern[];
}

const SHOT_NAMES: Record<string, string> = {
  S: 'Saque', Re: 'Resto', V: 'Volea', B: 'Bandeja',
  Rm: 'Remate', Vi: 'Vibora', G: 'Globo', D: 'Dejada',
  Ch: 'Chiquita', Ps: 'Passing', BP: 'Bajada', CP: 'Contrapared',
  x4: 'Por 4', Bl: 'Bloqueo',
};

function getAllPoints(match: Match): Point[] {
  return match.sets.flatMap((s) => s.games.flatMap((g) => g.points));
}

function extractSequences(shots: Shot[], length: number): Array<{ types: ShotType[]; players: PlayerId[] }> {
  const sequences: Array<{ types: ShotType[]; players: PlayerId[] }> = [];
  for (let i = 0; i <= shots.length - length; i++) {
    const slice = shots.slice(i, i + length);
    sequences.push({
      types: slice.map((s) => s.type),
      players: slice.map((s) => s.player),
    });
  }
  return sequences;
}

function describePattern(types: ShotType[]): string {
  return types.map((t) => SHOT_NAMES[t] ?? t).join(' → ');
}

function analyzePatterns(
  points: Point[],
  seqLength: number,
): TacticalPattern[] {
  const patternMap = new Map<string, { wins: number; losses: number; players: PlayerId[] }>();

  for (const point of points) {
    if (point.shots.length < seqLength) continue;
    const sequences = extractSequences(point.shots, seqLength);
    const seen = new Set<string>(); // avoid counting same pattern twice in one point

    for (const seq of sequences) {
      const key = seq.types.join(',');
      if (seen.has(key)) continue;
      seen.add(key);

      const existing = patternMap.get(key) || { wins: 0, losses: 0, players: seq.players };
      // Determine if the player who executed the last shot won
      const lastPlayer = seq.players[seq.players.length - 1];
      const lastPlayerTeam = (lastPlayer === 'J1' || lastPlayer === 'J2') ? 'team1' : 'team2';

      if (point.winner === lastPlayerTeam) {
        existing.wins++;
      } else {
        existing.losses++;
      }
      patternMap.set(key, existing);
    }
  }

  return Array.from(patternMap.entries())
    .map(([key, data]) => {
      const types = key.split(',') as ShotType[];
      const total = data.wins + data.losses;
      return {
        sequence: types,
        players: data.players,
        count: total,
        winRate: total > 0 ? Math.round((data.wins / total) * 100) : 0,
        wins: data.wins,
        losses: data.losses,
        description: describePattern(types),
      };
    })
    .filter((p) => p.count >= 2)
    .sort((a, b) => b.count - a.count);
}

export function computePatterns(match: Match, setFilter?: number): PatternAnalysis {
  let points = getAllPoints(match);
  if (setFilter !== undefined) {
    points = points.filter((p) => p.setNumber === setFilter);
  }

  const twoShotCombos = analyzePatterns(points, 2);
  const threeShotCombos = analyzePatterns(points, 3);

  const topWinningPatterns = [...twoShotCombos, ...threeShotCombos]
    .filter((p) => p.count >= 2)
    .sort((a, b) => b.winRate - a.winRate || b.count - a.count)
    .slice(0, 10);

  const topLosingPatterns = [...twoShotCombos, ...threeShotCombos]
    .filter((p) => p.count >= 2)
    .sort((a, b) => a.winRate - b.winRate || b.count - a.count)
    .slice(0, 10);

  // Player-specific patterns
  const playerPatterns: Record<string, TacticalPattern[]> = {};
  const playerIds: PlayerId[] = ['J1', 'J2', 'J3', 'J4'];

  for (const pid of playerIds) {
    const playerPoints = points.filter((p) => p.shots.some((s) => s.player === pid));
    const patterns = analyzePatterns(playerPoints, 2)
      .filter((p) => p.count >= 2)
      .slice(0, 5);
    if (patterns.length > 0) {
      playerPatterns[pid] = patterns;
    }
  }

  return {
    topWinningPatterns,
    topLosingPatterns,
    playerPatterns,
    twoShotCombos: twoShotCombos.slice(0, 15),
    threeShotCombos: threeShotCombos.slice(0, 10),
  };
}
