import { Match, Point } from '@/types/match';
import { PlayerId, AllPlayerPositions } from '@/types/shot';

const GRID_COLS = 20;
const GRID_ROWS = 25;
const CELL_W = 400 / GRID_COLS;  // 20
const CELL_H = 500 / GRID_ROWS;  // 20

export interface PositionHeatmapData {
  grid: number[][];  // [row][col] presence count
  max: number;
  totalSamples: number;
}

function getAllPoints(match: Match): Point[] {
  return match.sets.flatMap((s) => s.games.flatMap((g) => g.points));
}

/**
 * Compute a position heatmap for a specific player or all players of a team.
 */
export function computePositionHeatmap(
  match: Match,
  filter: { type: 'player'; player: PlayerId } | { type: 'team'; team: 'team1' | 'team2' },
  setFilter?: number,
): PositionHeatmapData {
  const grid: number[][] = Array.from({ length: GRID_ROWS }, () =>
    Array(GRID_COLS).fill(0),
  );

  const points = getAllPoints(match);
  const filteredPoints = setFilter != null
    ? points.filter((p) => p.setNumber === setFilter)
    : points;

  let totalSamples = 0;

  const playersToTrack: PlayerId[] =
    filter.type === 'player'
      ? [filter.player]
      : filter.team === 'team1'
        ? ['J1', 'J2']
        : ['J3', 'J4'];

  for (const point of filteredPoints) {
    for (const shot of point.shots) {
      if (!shot.playerPositions) continue;

      for (const pid of playersToTrack) {
        const pos = shot.playerPositions[pid];
        if (!pos) continue;

        const col = Math.min(GRID_COLS - 1, Math.max(0, Math.floor(pos.x / CELL_W)));
        const row = Math.min(GRID_ROWS - 1, Math.max(0, Math.floor(pos.y / CELL_H)));

        grid[row][col]++;
        totalSamples++;
      }
    }
  }

  let max = 0;
  for (const row of grid) {
    for (const val of row) {
      if (val > max) max = val;
    }
  }

  return { grid, max, totalSamples };
}

export { GRID_COLS, GRID_ROWS, CELL_W, CELL_H };
