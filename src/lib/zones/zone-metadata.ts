/**
 * zone-metadata.ts
 *
 * SVG rendering metadata for the 15 padel-court floor zones and
 * their intermediate-zone divider lines.
 *
 * Coordinate system (viewBox 0 0 400 500):
 *   - Origin (0, 0) is the top-left corner (net side, left).
 *   - X grows rightward, Y grows downward (toward fondo).
 *
 * Column boundaries (x):
 *   Col 1  lateral izq       0 – 80
 *   Col 2  interior izq     80 – 140
 *   Col 3  centro           140 – 260
 *   Col 4  interior der     260 – 320
 *   Col 5  lateral der      320 – 400
 *
 * Row boundaries (y):
 *   Row 1  red (net)          0 – 140
 *   Row 2  media            140 – 315
 *   Row 3  fondo            315 – 500
 */

import type {
  FloorZoneId,
  FloorZoneMetadata,
  IntermediateZoneMetadata,
  ZoneCategory,
} from '@/types/zones';
import { getValidIntermediateZones } from './adjacency';

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const COL_X = [0, 80, 140, 260, 320, 400] as const;  // 6 edges → 5 columns
const ROW_Y = [0, 140, 315, 500] as const;            // 4 edges → 3 rows

/** Column index (0-based) for each zone id. */
function colOf(id: FloorZoneId): number {
  return ((id - 1) % 5);
}

/** Row index (0-based, 0 = fondo, 2 = red). */
function rowOf(id: FloorZoneId): number {
  return Math.floor((id - 1) / 5);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rectPoints(x1: number, y1: number, x2: number, y2: number): string {
  return `${x1},${y1} ${x2},${y1} ${x2},${y2} ${x1},${y2}`;
}

function categoryForRow(row: number): ZoneCategory {
  switch (row) {
    case 0: return 'fondo';
    case 1: return 'media';
    case 2: return 'red';
    default: return 'fondo';
  }
}

// ---------------------------------------------------------------------------
// Zone names
// ---------------------------------------------------------------------------

interface ZoneNameEntry {
  name: string;
  shortName: string;
}

const ZONE_NAMES: Record<FloorZoneId, ZoneNameEntry> = {
  1:  { name: 'Fondo lateral izquierdo',    shortName: 'F-LI' },
  2:  { name: 'Fondo interior izquierdo',   shortName: 'F-II' },
  3:  { name: 'Fondo centro',               shortName: 'F-C' },
  4:  { name: 'Fondo interior derecho',     shortName: 'F-ID' },
  5:  { name: 'Fondo lateral derecho',      shortName: 'F-LD' },
  6:  { name: 'Media lateral izquierdo',    shortName: 'M-LI' },
  7:  { name: 'Media interior izquierdo',   shortName: 'M-II' },
  8:  { name: 'Media centro',               shortName: 'M-C' },
  9:  { name: 'Media interior derecho',     shortName: 'M-ID' },
  10: { name: 'Media lateral derecho',      shortName: 'M-LD' },
  11: { name: 'Red lateral izquierdo',      shortName: 'R-LI' },
  12: { name: 'Red interior izquierdo',     shortName: 'R-II' },
  13: { name: 'Red centro',                 shortName: 'R-C' },
  14: { name: 'Red interior derecho',       shortName: 'R-ID' },
  15: { name: 'Red lateral derecho',        shortName: 'R-LD' },
};

// ---------------------------------------------------------------------------
// Build FLOOR_ZONES
// ---------------------------------------------------------------------------

function buildFloorZones(): FloorZoneMetadata[] {
  const zones: FloorZoneMetadata[] = [];

  for (let id = 1; id <= 15; id++) {
    const zid = id as FloorZoneId;
    const col = colOf(zid);
    const row = rowOf(zid);

    // SVG Y is inverted relative to the court: row 0 (fondo) maps to
    // the BOTTOM of the viewBox, row 2 (red) maps to the TOP.
    const svgRow = 2 - row; // 0→2, 1→1, 2→0

    const x1 = COL_X[col];
    const x2 = COL_X[col + 1];
    const y1 = ROW_Y[svgRow];
    const y2 = ROW_Y[svgRow + 1];

    const cx = Math.round((x1 + x2) / 2);
    const cy = Math.round((y1 + y2) / 2);

    const { name, shortName } = ZONE_NAMES[zid];

    zones.push({
      id: zid,
      name,
      shortName,
      category: categoryForRow(row),
      points: rectPoints(x1, y1, x2, y2),
      center: { x: cx, y: cy },
    });
  }

  return zones;
}

export const FLOOR_ZONES: FloorZoneMetadata[] = buildFloorZones();

// ---------------------------------------------------------------------------
// getFloorZone
// ---------------------------------------------------------------------------

const _floorZoneMap = new Map<FloorZoneId, FloorZoneMetadata>(
  FLOOR_ZONES.map((z) => [z.id, z]),
);

/**
 * Look up a floor zone by its id. Throws if the id is invalid.
 */
export function getFloorZone(id: FloorZoneId): FloorZoneMetadata {
  const zone = _floorZoneMap.get(id);
  if (!zone) {
    throw new Error(`Unknown floor zone id: ${id}`);
  }
  return zone;
}

// ---------------------------------------------------------------------------
// Intermediate zone lines
// ---------------------------------------------------------------------------

/**
 * For two adjacent zones compute the SVG line segment that sits on their
 * shared border. For orthogonal neighbours this is the full shared edge.
 * For diagonal neighbours the line connects the two zone centres.
 */
function computeIntermediateLine(
  z1: FloorZoneId,
  z2: FloorZoneId,
): IntermediateZoneMetadata {
  const a = getFloorZone(z1);
  const b = getFloorZone(z2);

  // Parse bounding boxes from points strings
  const bbox = (z: FloorZoneMetadata) => {
    const nums = z.points.split(/[\s,]+/).map(Number);
    return {
      x1: Math.min(nums[0], nums[2], nums[4], nums[6]),
      y1: Math.min(nums[1], nums[3], nums[5], nums[7]),
      x2: Math.max(nums[0], nums[2], nums[4], nums[6]),
      y2: Math.max(nums[1], nums[3], nums[5], nums[7]),
    };
  };

  const ba = bbox(a);
  const bb = bbox(b);

  const col1 = colOf(z1);
  const col2 = colOf(z2);
  const row1 = rowOf(z1);
  const row2 = rowOf(z2);

  const sameRow = row1 === row2;
  const sameCol = col1 === col2;

  let x1: number, y1: number, x2: number, y2: number;

  if (sameRow) {
    // Horizontal neighbour – shared vertical edge
    const sharedX = Math.max(ba.x1, bb.x1); // the higher left edge = shared border
    const topY = Math.max(ba.y1, bb.y1);
    const botY = Math.min(ba.y2, bb.y2);
    x1 = sharedX;
    y1 = topY;
    x2 = sharedX;
    y2 = botY;
  } else if (sameCol) {
    // Vertical neighbour – shared horizontal edge
    const sharedY = Math.max(ba.y1, bb.y1);
    const leftX = Math.max(ba.x1, bb.x1);
    const rightX = Math.min(ba.x2, bb.x2);
    x1 = leftX;
    y1 = sharedY;
    x2 = rightX;
    y2 = sharedY;
  } else {
    // Diagonal – connect the two centres
    x1 = a.center.x;
    y1 = a.center.y;
    x2 = b.center.x;
    y2 = b.center.y;
  }

  return {
    zones: [z1, z2],
    x1,
    y1,
    x2,
    y2,
    label: `${z1}/${z2}`,
  };
}

function buildIntermediateZoneLines(): IntermediateZoneMetadata[] {
  return getValidIntermediateZones().map(([z1, z2]) =>
    computeIntermediateLine(z1, z2),
  );
}

export const INTERMEDIATE_ZONE_LINES: IntermediateZoneMetadata[] =
  buildIntermediateZoneLines();
