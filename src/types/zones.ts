// Floor zones 1-15
export type FloorZoneId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

// Wall zones P1-P24
export type WallZoneId = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7' | 'P8' | 'P9' | 'P10' | 'P11' | 'P12' | 'P13' | 'P14' | 'P15' | 'P16' | 'P17' | 'P18' | 'P19' | 'P20' | 'P21' | 'P22' | 'P23' | 'P24';

// Intermediate zone between two adjacent floor zones
export interface IntermediateZone {
  primary: FloorZoneId;
  secondary: FloorZoneId;
}

// A destination can be a single zone or intermediate
export type ZoneDestination =
  | { type: 'single'; zone: FloorZoneId }
  | { type: 'intermediate'; primary: FloorZoneId; secondary: FloorZoneId };

// Zone category
export type ZoneCategory = 'fondo' | 'media' | 'red';

// Wall zone category
export type WallCategory = 'fondo_baja' | 'fondo_alta' | 'lateral_izq_baja' | 'lateral_izq_alta' | 'lateral_der_baja' | 'lateral_der_alta';

// Zone metadata for SVG rendering
export interface FloorZoneMetadata {
  id: FloorZoneId;
  name: string;
  shortName: string;
  category: ZoneCategory;
  // SVG polygon points
  points: string;
  // Center position for labels
  center: { x: number; y: number };
}

export interface WallZoneMetadata {
  id: WallZoneId;
  name: string;
  shortName: string;
  category: WallCategory;
  height: 'baja' | 'alta';
  wall: 'fondo' | 'lateral_izq' | 'lateral_der';
  connectedFloorZones: FloorZoneId[];
  displayName?: string;
}

// Intermediate zone line for SVG rendering
export interface IntermediateZoneMetadata {
  zones: [FloorZoneId, FloorZoneId];
  // SVG line coordinates
  x1: number; y1: number;
  x2: number; y2: number;
  label: string;
}
