/**
 * wall-zones.ts
 *
 * Metadata for the 24 padel-court wall zones (P1 – P24).
 *
 * Wall layout:
 *   P1  – P4   Fondo baja       (cristal  0 – 1.5 m)
 *   P5  – P8   Fondo alta       (cristal alto / malla  1.5 – 4 m)
 *   P9  – P12  Lateral izq baja (cristal  0 – 1.5 m)
 *   P13 – P16  Lateral izq alta (malla  1.5 – 4 m)
 *   P17 – P20  Lateral der baja (cristal  0 – 1.5 m)
 *   P21 – P24  Lateral der alta (malla  1.5 – 4 m)
 *
 * Each group of 4 panels spans the full width/length of the wall and is
 * numbered left-to-right (fondo) or back-to-front (laterals) when
 * standing inside the court looking at that wall.
 */

import type {
  FloorZoneId,
  WallCategory,
  WallZoneId,
  WallZoneMetadata,
} from '@/types/zones';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface WallZoneDef {
  id: WallZoneId;
  name: string;
  shortName: string;
  category: WallCategory;
  height: 'baja' | 'alta';
  wall: 'fondo' | 'lateral_izq' | 'lateral_der';
  connectedFloorZones: FloorZoneId[];
  displayName: string;
}

// ---------------------------------------------------------------------------
// Fondo baja (P1-P4)
// ---------------------------------------------------------------------------

const fondoBaja: WallZoneDef[] = [
  {
    id: 'P1',
    name: 'Fondo baja – panel 1 (izq)',
    shortName: 'FB1',
    category: 'fondo_baja',
    height: 'baja',
    wall: 'fondo',
    connectedFloorZones: [1],
    displayName: 'Pared fondo izq (vidrio)',
  },
  {
    id: 'P2',
    name: 'Fondo baja – panel 2 (centro-izq)',
    shortName: 'FB2',
    category: 'fondo_baja',
    height: 'baja',
    wall: 'fondo',
    connectedFloorZones: [2, 3],
    displayName: 'Pared fondo centro-izq (vidrio)',
  },
  {
    id: 'P3',
    name: 'Fondo baja – panel 3 (centro-der)',
    shortName: 'FB3',
    category: 'fondo_baja',
    height: 'baja',
    wall: 'fondo',
    connectedFloorZones: [3, 4],
    displayName: 'Pared fondo centro-der (vidrio)',
  },
  {
    id: 'P4',
    name: 'Fondo baja – panel 4 (der)',
    shortName: 'FB4',
    category: 'fondo_baja',
    height: 'baja',
    wall: 'fondo',
    connectedFloorZones: [5],
    displayName: 'Pared fondo der (vidrio)',
  },
];

// ---------------------------------------------------------------------------
// Fondo alta (P5-P8)
// ---------------------------------------------------------------------------

const fondoAlta: WallZoneDef[] = [
  {
    id: 'P5',
    name: 'Fondo alta – panel 1 (izq)',
    shortName: 'FA1',
    category: 'fondo_alta',
    height: 'alta',
    wall: 'fondo',
    connectedFloorZones: [1],
    displayName: 'Pared fondo izq (reja)',
  },
  {
    id: 'P6',
    name: 'Fondo alta – panel 2 (centro-izq)',
    shortName: 'FA2',
    category: 'fondo_alta',
    height: 'alta',
    wall: 'fondo',
    connectedFloorZones: [2, 3],
    displayName: 'Pared fondo centro-izq (reja)',
  },
  {
    id: 'P7',
    name: 'Fondo alta – panel 3 (centro-der)',
    shortName: 'FA3',
    category: 'fondo_alta',
    height: 'alta',
    wall: 'fondo',
    connectedFloorZones: [3, 4],
    displayName: 'Pared fondo centro-der (reja)',
  },
  {
    id: 'P8',
    name: 'Fondo alta – panel 4 (der)',
    shortName: 'FA4',
    category: 'fondo_alta',
    height: 'alta',
    wall: 'fondo',
    connectedFloorZones: [5],
    displayName: 'Pared fondo der (reja)',
  },
];

// ---------------------------------------------------------------------------
// Lateral izquierdo baja (P9-P12)
// ---------------------------------------------------------------------------

const lateralIzqBaja: WallZoneDef[] = [
  {
    id: 'P9',
    name: 'Lateral izq baja – panel 1 (fondo)',
    shortName: 'LIB1',
    category: 'lateral_izq_baja',
    height: 'baja',
    wall: 'lateral_izq',
    connectedFloorZones: [1],
    displayName: 'Lateral izq fondo (vidrio)',
  },
  {
    id: 'P10',
    name: 'Lateral izq baja – panel 2 (media-fondo)',
    shortName: 'LIB2',
    category: 'lateral_izq_baja',
    height: 'baja',
    wall: 'lateral_izq',
    connectedFloorZones: [1, 6],
    displayName: 'Lateral izq media-fondo (vidrio)',
  },
  {
    id: 'P11',
    name: 'Lateral izq baja – panel 3 (media-red)',
    shortName: 'LIB3',
    category: 'lateral_izq_baja',
    height: 'baja',
    wall: 'lateral_izq',
    connectedFloorZones: [6, 11],
    displayName: 'Lateral izq media-red (vidrio)',
  },
  {
    id: 'P12',
    name: 'Lateral izq baja – panel 4 (red)',
    shortName: 'LIB4',
    category: 'lateral_izq_baja',
    height: 'baja',
    wall: 'lateral_izq',
    connectedFloorZones: [11],
    displayName: 'Lateral izq red (vidrio)',
  },
];

// ---------------------------------------------------------------------------
// Lateral izquierdo alta (P13-P16)
// ---------------------------------------------------------------------------

const lateralIzqAlta: WallZoneDef[] = [
  {
    id: 'P13',
    name: 'Lateral izq alta – panel 1 (fondo)',
    shortName: 'LIA1',
    category: 'lateral_izq_alta',
    height: 'alta',
    wall: 'lateral_izq',
    connectedFloorZones: [1],
    displayName: 'Lateral izq fondo (reja)',
  },
  {
    id: 'P14',
    name: 'Lateral izq alta – panel 2 (media-fondo)',
    shortName: 'LIA2',
    category: 'lateral_izq_alta',
    height: 'alta',
    wall: 'lateral_izq',
    connectedFloorZones: [1, 6],
    displayName: 'Lateral izq media-fondo (reja)',
  },
  {
    id: 'P15',
    name: 'Lateral izq alta – panel 3 (media-red)',
    shortName: 'LIA3',
    category: 'lateral_izq_alta',
    height: 'alta',
    wall: 'lateral_izq',
    connectedFloorZones: [6, 11],
    displayName: 'Lateral izq media-red (reja)',
  },
  {
    id: 'P16',
    name: 'Lateral izq alta – panel 4 (red)',
    shortName: 'LIA4',
    category: 'lateral_izq_alta',
    height: 'alta',
    wall: 'lateral_izq',
    connectedFloorZones: [11],
    displayName: 'Lateral izq red (reja)',
  },
];

// ---------------------------------------------------------------------------
// Lateral derecho baja (P17-P20)
// ---------------------------------------------------------------------------

const lateralDerBaja: WallZoneDef[] = [
  {
    id: 'P17',
    name: 'Lateral der baja – panel 1 (fondo)',
    shortName: 'LDB1',
    category: 'lateral_der_baja',
    height: 'baja',
    wall: 'lateral_der',
    connectedFloorZones: [5],
    displayName: 'Lateral der fondo (vidrio)',
  },
  {
    id: 'P18',
    name: 'Lateral der baja – panel 2 (media-fondo)',
    shortName: 'LDB2',
    category: 'lateral_der_baja',
    height: 'baja',
    wall: 'lateral_der',
    connectedFloorZones: [5, 10],
    displayName: 'Lateral der media-fondo (vidrio)',
  },
  {
    id: 'P19',
    name: 'Lateral der baja – panel 3 (media-red)',
    shortName: 'LDB3',
    category: 'lateral_der_baja',
    height: 'baja',
    wall: 'lateral_der',
    connectedFloorZones: [10, 15],
    displayName: 'Lateral der media-red (vidrio)',
  },
  {
    id: 'P20',
    name: 'Lateral der baja – panel 4 (red)',
    shortName: 'LDB4',
    category: 'lateral_der_baja',
    height: 'baja',
    wall: 'lateral_der',
    connectedFloorZones: [15],
    displayName: 'Lateral der red (vidrio)',
  },
];

// ---------------------------------------------------------------------------
// Lateral derecho alta (P21-P24)
// ---------------------------------------------------------------------------

const lateralDerAlta: WallZoneDef[] = [
  {
    id: 'P21',
    name: 'Lateral der alta – panel 1 (fondo)',
    shortName: 'LDA1',
    category: 'lateral_der_alta',
    height: 'alta',
    wall: 'lateral_der',
    connectedFloorZones: [5],
    displayName: 'Lateral der fondo (reja)',
  },
  {
    id: 'P22',
    name: 'Lateral der alta – panel 2 (media-fondo)',
    shortName: 'LDA2',
    category: 'lateral_der_alta',
    height: 'alta',
    wall: 'lateral_der',
    connectedFloorZones: [5, 10],
    displayName: 'Lateral der media-fondo (reja)',
  },
  {
    id: 'P23',
    name: 'Lateral der alta – panel 3 (media-red)',
    shortName: 'LDA3',
    category: 'lateral_der_alta',
    height: 'alta',
    wall: 'lateral_der',
    connectedFloorZones: [10, 15],
    displayName: 'Lateral der media-red (reja)',
  },
  {
    id: 'P24',
    name: 'Lateral der alta – panel 4 (red)',
    shortName: 'LDA4',
    category: 'lateral_der_alta',
    height: 'alta',
    wall: 'lateral_der',
    connectedFloorZones: [15],
    displayName: 'Lateral der red (reja)',
  },
];

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const WALL_ZONES: WallZoneMetadata[] = [
  ...fondoBaja,
  ...fondoAlta,
  ...lateralIzqBaja,
  ...lateralIzqAlta,
  ...lateralDerBaja,
  ...lateralDerAlta,
];

// ---------------------------------------------------------------------------
// getWallZone
// ---------------------------------------------------------------------------

const _wallZoneMap = new Map<WallZoneId, WallZoneMetadata>(
  WALL_ZONES.map((w) => [w.id, w]),
);

/**
 * Look up a wall zone by its id. Throws if the id is invalid.
 */
export function getWallZone(id: WallZoneId): WallZoneMetadata {
  const zone = _wallZoneMap.get(id);
  if (!zone) {
    throw new Error(`Unknown wall zone id: ${id}`);
  }
  return zone;
}

// ---------------------------------------------------------------------------
// WALL_ZONES_BY_WALL
// ---------------------------------------------------------------------------

function buildWallZonesByWall(): Record<string, WallZoneMetadata[]> {
  const map: Record<string, WallZoneMetadata[]> = {};
  for (const wz of WALL_ZONES) {
    const key = wz.wall;
    if (!map[key]) {
      map[key] = [];
    }
    map[key].push(wz);
  }
  return map;
}

/**
 * Wall zones grouped by wall:
 *   - `fondo`        → P1–P8
 *   - `lateral_izq`  → P9–P16
 *   - `lateral_der`  → P17–P24
 */
export const WALL_ZONES_BY_WALL: Record<string, WallZoneMetadata[]> =
  buildWallZonesByWall();
