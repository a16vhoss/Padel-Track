import { ZoneDestination, WallZoneId } from './zones';

export type PlayerId = 'J1' | 'J2' | 'J3' | 'J4';

export type ShotType =
  | 'S'    // Saque (Serve)
  | 'Re'   // Resto (Return)
  | 'B'    // Bandeja
  | 'Rm'   // Remate (Smash)
  | 'Vi'   // Vibora
  | 'BP'   // Bajada de Pared
  | 'x4'   // Por 4 (off 4 walls)
  | 'G'    // Globo (Lob)
  | 'V'    // Volea (Volley)
  | 'D'    // Dejada (Drop shot)
  | 'Ch'   // Chiquita
  | 'Ps'   // Passing Shot
  | 'CP'   // Contrapared
  | 'Bl';  // Bloqueo (Block)

export type ShotDirection = 'cr' | 'pa' | 'ce'; // cruzado, paralelo, centro

export type ShotPower = '-' | '' | '+' | '++'; // suave, normal, fuerte, muy fuerte

export type ShotSpin = '' | '^' | '~'; // sin efecto, liftado, cortado

export type ShotStatus = 'W' | 'X' | 'N' | 'DF' | ''; // Winner, Error, No llega, Doble falta, Continua

export interface ShotModifiers {
  direction?: ShotDirection;
  power: ShotPower;
  spin: ShotSpin;
  wallBounces: WallZoneId[];
}

export interface Shot {
  id: string;
  sequenceNumber: number;
  player: PlayerId;
  type: ShotType;
  modifiers: ShotModifiers;
  destination: ZoneDestination;
  status: ShotStatus;
  notation: string; // Generated compact notation
  timestamp: number;
}

// Shot type metadata for UI
export interface ShotTypeInfo {
  code: ShotType;
  name: string;
  shortName: string;
  category: 'saque' | 'defensa' | 'ataque' | 'red' | 'pared';
  color: string;
}
