/**
 * adjacency.ts
 *
 * Padel court floor-zone adjacency logic.
 *
 * The court has 15 floor zones arranged in a 3-row x 5-column grid
 * (columns have unequal widths):
 *
 *   Row 1 (Red/Net):   [11] [12] [13] [14] [15]
 *   Row 2 (Media):     [ 6] [ 7] [ 8] [ 9] [10]
 *   Row 3 (Fondo):     [ 1] [ 2] [ 3] [ 4] [ 5]
 *
 * Columns:
 *   Col 1 – lateral izq    (zones 1, 6, 11)   ~2 m
 *   Col 2 – interior izq   (zones 2, 7, 12)   ~1.5 m
 *   Col 3 – centro          (zones 3, 8, 13)   ~3 m
 *   Col 4 – interior der   (zones 4, 9, 14)   ~1.5 m
 *   Col 5 – lateral der    (zones 5, 10, 15)  ~2 m
 *
 * Adjacency includes:
 *   - Horizontal neighbours (same row, columns ±1)  → 12 pairs
 *   - Vertical neighbours   (same column, rows ±1)  → 10 pairs
 *   - Selected diagonal pairs from the spec          →  4 pairs
 *
 * Total valid intermediate-zone pairs: 26
 */

import type { FloorZoneId } from '@/types/zones';

// ---------------------------------------------------------------------------
// Adjacency map – each zone lists its direct neighbours
// ---------------------------------------------------------------------------

export const ADJACENCY_MAP: Record<FloorZoneId, FloorZoneId[]> = {
  // Row 3 – Fondo
  1:  [2, 6],
  2:  [1, 3, 7, 8],          // 2-8 diagonal izq
  3:  [2, 4, 8],
  4:  [3, 5, 8, 9],          // 4-8 diagonal der
  5:  [4, 10],

  // Row 2 – Media
  6:  [1, 7, 11],
  7:  [2, 6, 8, 12],
  8:  [2, 3, 4, 7, 9, 12, 13, 14], // centre hub + diagonals 2-8, 4-8, 8-12, 8-14
  9:  [4, 8, 10, 14],
  10: [5, 9, 15],

  // Row 1 – Red (net)
  11: [6, 12],
  12: [7, 8, 11, 13],        // 8-12 diagonal izq
  13: [8, 12, 14],
  14: [8, 9, 13, 15],        // 8-14 diagonal der
  15: [10, 14],
};

// ---------------------------------------------------------------------------
// areAdjacent
// ---------------------------------------------------------------------------

/**
 * Returns `true` when two floor zones share a border (including the four
 * diagonal pairs defined in the spec).
 */
export function areAdjacent(z1: FloorZoneId, z2: FloorZoneId): boolean {
  if (z1 === z2) return false;
  return ADJACENCY_MAP[z1].includes(z2);
}

// ---------------------------------------------------------------------------
// Valid intermediate-zone pairs (sorted tuples, smaller id first)
// ---------------------------------------------------------------------------

/** Lazily computed cache of valid pairs. */
let _validPairsCache: [FloorZoneId, FloorZoneId][] | null = null;

/**
 * Returns every valid intermediate-zone pair as `[smaller, larger]`.
 * The result is cached after the first call.
 */
export function getValidIntermediateZones(): [FloorZoneId, FloorZoneId][] {
  if (_validPairsCache) return _validPairsCache;

  const pairs: [FloorZoneId, FloorZoneId][] = [];
  const seen = new Set<string>();

  const allZones = Object.keys(ADJACENCY_MAP).map(Number) as FloorZoneId[];

  for (const z of allZones) {
    for (const neighbour of ADJACENCY_MAP[z]) {
      const lo = Math.min(z, neighbour) as FloorZoneId;
      const hi = Math.max(z, neighbour) as FloorZoneId;
      const key = `${lo}-${hi}`;
      if (!seen.has(key)) {
        seen.add(key);
        pairs.push([lo, hi]);
      }
    }
  }

  // Sort pairs for deterministic ordering (by first element, then second)
  pairs.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  _validPairsCache = pairs;
  return pairs;
}

// ---------------------------------------------------------------------------
// validateIntermediateZone
// ---------------------------------------------------------------------------

/**
 * Returns `true` when the pair `(z1, z2)` is a valid intermediate zone
 * (order-independent).
 */
export function validateIntermediateZone(
  z1: FloorZoneId,
  z2: FloorZoneId,
): boolean {
  return areAdjacent(z1, z2);
}
