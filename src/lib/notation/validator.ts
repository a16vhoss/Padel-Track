import type { Shot, ShotType, PlayerId, ShotDirection, ShotPower, ShotSpin, ShotStatus } from '@/types/shot';
import type { FloorZoneId, WallZoneId } from '@/types/zones';

/**
 * Validates notation syntax and semantics for the TacticalPadel notation system.
 */

// ------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------

const VALID_PLAYERS: Set<string> = new Set(['J1', 'J2', 'J3', 'J4']);

const VALID_SHOT_TYPES: Set<string> = new Set([
  'S', 'Re', 'B', 'Rm', 'Vi', 'BP', 'x4', 'G', 'V', 'D', 'Ch', 'Ps', 'CP', 'Bl',
]);

const VALID_DIRECTIONS: Set<string> = new Set(['cr', 'pa', 'ce']);

const VALID_POWERS: Set<string> = new Set(['', '-', '+', '++']);

const VALID_SPINS: Set<string> = new Set(['', '^', '~']);

const VALID_STATUSES: Set<string> = new Set(['', 'W', 'X', 'N', 'DF']);

const VALID_FLOOR_ZONES: Set<number> = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

const VALID_WALL_ZONES: Set<string> = new Set([
  'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10',
  'P11', 'P12', 'P13', 'P14', 'P15', 'P16', 'P17', 'P18', 'P19', 'P20',
  'P21', 'P22', 'P23', 'P24',
]);

/**
 * Adjacency map for floor zones. Two zones are adjacent if they share an edge
 * on the padel court grid. This is used to validate intermediate zones.
 *
 * Court layout (standard 5-column x 3-row grid):
 *
 *  Net side:
 *   [11] [12] [13] [14] [15]   (red / net zone)
 *   [ 6] [ 7] [ 8] [ 9] [10]  (media / mid-court)
 *   [ 1] [ 2] [ 3] [ 4] [ 5]  (fondo / back)
 *  Back wall side
 */
const ADJACENT_ZONES: Record<number, Set<number>> = {
  1:  new Set([2, 6]),
  2:  new Set([1, 3, 7]),
  3:  new Set([2, 4, 8]),
  4:  new Set([3, 5, 9]),
  5:  new Set([4, 10]),
  6:  new Set([1, 7, 11]),
  7:  new Set([2, 6, 8, 12]),
  8:  new Set([3, 7, 9, 13]),
  9:  new Set([4, 8, 10, 14]),
  10: new Set([5, 9, 15]),
  11: new Set([6, 12]),
  12: new Set([7, 11, 13]),
  13: new Set([8, 12, 14]),
  14: new Set([9, 13, 15]),
  15: new Set([10, 14]),
};

// ------------------------------------------------------------------
// Notation regex (same pattern as parser)
// ------------------------------------------------------------------

const NOTATION_REGEX =
  /^(J[1-4]):((?:[A-Za-z][A-Za-z0-9]?))(\+{1,2}|-)?([~^])?((?::[A-Z]\d+(?:-[A-Z]\d+)*)*)?(\/[a-z]+)?(?:->(\d+(?:,\d+)?))?([WXNDF]{0,2})?$/;

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a notation string for both syntax and semantic correctness.
 */
export function validateNotation(notation: string): ValidationResult {
  const errors: string[] = [];

  if (!notation || !notation.trim()) {
    return { valid: false, errors: ['Notation string is empty'] };
  }

  const trimmed = notation.trim();
  const match = trimmed.match(NOTATION_REGEX);

  if (!match) {
    return { valid: false, errors: [`Notation does not match expected format: "${trimmed}"`] };
  }

  const [, playerRaw, shotTypeRaw, powerRaw, spinRaw, wallsRaw, directionRaw, zoneRaw, statusRaw] = match;

  // Validate player
  if (!VALID_PLAYERS.has(playerRaw)) {
    errors.push(`Invalid player "${playerRaw}". Must be one of: J1, J2, J3, J4`);
  }

  // Validate shot type
  if (!VALID_SHOT_TYPES.has(shotTypeRaw)) {
    errors.push(`Invalid shot type "${shotTypeRaw}". Must be one of: ${[...VALID_SHOT_TYPES].join(', ')}`);
  }

  // Validate power
  if (powerRaw !== undefined && !VALID_POWERS.has(powerRaw)) {
    errors.push(`Invalid power modifier "${powerRaw}". Must be one of: -, +, ++, or empty`);
  }

  // Validate spin
  if (spinRaw !== undefined && !VALID_SPINS.has(spinRaw)) {
    errors.push(`Invalid spin modifier "${spinRaw}". Must be ^, ~, or empty`);
  }

  // Validate wall bounces
  if (wallsRaw) {
    const cleaned = wallsRaw.startsWith(':') ? wallsRaw.slice(1) : wallsRaw;
    if (cleaned) {
      const walls = cleaned.split('-');
      for (const wall of walls) {
        if (!VALID_WALL_ZONES.has(wall)) {
          errors.push(`Invalid wall zone "${wall}". Must be P1-P24`);
        }
      }
    }
  }

  // Validate direction
  if (directionRaw) {
    const dir = directionRaw.startsWith('/') ? directionRaw.slice(1) : directionRaw;
    if (!VALID_DIRECTIONS.has(dir)) {
      errors.push(`Invalid direction "${dir}". Must be one of: cr, pa, ce`);
    }
  }

  // Validate zone destination
  if (zoneRaw) {
    const parts = zoneRaw.split(',');
    for (const part of parts) {
      const zoneNum = parseInt(part, 10);
      if (isNaN(zoneNum) || !VALID_FLOOR_ZONES.has(zoneNum)) {
        errors.push(`Invalid floor zone "${part}". Must be 1-15`);
      }
    }

    // If intermediate zone, check adjacency
    if (parts.length === 2) {
      const z1 = parseInt(parts[0], 10);
      const z2 = parseInt(parts[1], 10);
      if (!isNaN(z1) && !isNaN(z2) && ADJACENT_ZONES[z1] && !ADJACENT_ZONES[z1].has(z2)) {
        errors.push(`Zones ${z1} and ${z2} are not adjacent; cannot form an intermediate zone`);
      }
    }

    if (parts.length > 2) {
      errors.push(`Zone destination can have at most 2 zones (got ${parts.length})`);
    }
  }

  // Validate status
  if (statusRaw && !VALID_STATUSES.has(statusRaw)) {
    errors.push(`Invalid status "${statusRaw}". Must be one of: W, X, N, DF, or empty`);
  }

  // Semantic: DF only makes sense with serve
  if (statusRaw === 'DF' && shotTypeRaw !== 'S') {
    errors.push('Double fault (DF) status is only valid for serves (S)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a Shot object for semantic correctness.
 * Checks things like adjacency for intermediate zones, valid enum values, etc.
 */
export function validateShot(shot: Shot): ValidationResult {
  const errors: string[] = [];

  // Validate player
  if (!VALID_PLAYERS.has(shot.player)) {
    errors.push(`Invalid player "${shot.player}"`);
  }

  // Validate shot type
  if (!VALID_SHOT_TYPES.has(shot.type)) {
    errors.push(`Invalid shot type "${shot.type}"`);
  }

  // Validate modifiers
  if (shot.modifiers) {
    if (!VALID_POWERS.has(shot.modifiers.power)) {
      errors.push(`Invalid power "${shot.modifiers.power}"`);
    }
    if (!VALID_SPINS.has(shot.modifiers.spin)) {
      errors.push(`Invalid spin "${shot.modifiers.spin}"`);
    }
    if (shot.modifiers.direction !== undefined && !VALID_DIRECTIONS.has(shot.modifiers.direction)) {
      errors.push(`Invalid direction "${shot.modifiers.direction}"`);
    }
    if (shot.modifiers.wallBounces) {
      for (const wall of shot.modifiers.wallBounces) {
        if (!VALID_WALL_ZONES.has(wall)) {
          errors.push(`Invalid wall zone "${wall}"`);
        }
      }
    }
  }

  // Validate destination
  if (shot.destination) {
    if (shot.destination.type === 'single') {
      if (!VALID_FLOOR_ZONES.has(shot.destination.zone)) {
        errors.push(`Invalid floor zone ${shot.destination.zone}`);
      }
    } else if (shot.destination.type === 'intermediate') {
      const { primary, secondary } = shot.destination;
      if (!VALID_FLOOR_ZONES.has(primary)) {
        errors.push(`Invalid primary floor zone ${primary}`);
      }
      if (!VALID_FLOOR_ZONES.has(secondary)) {
        errors.push(`Invalid secondary floor zone ${secondary}`);
      }
      // Check adjacency
      if (
        VALID_FLOOR_ZONES.has(primary) &&
        VALID_FLOOR_ZONES.has(secondary) &&
        ADJACENT_ZONES[primary] &&
        !ADJACENT_ZONES[primary].has(secondary)
      ) {
        errors.push(`Zones ${primary} and ${secondary} are not adjacent; cannot form an intermediate zone`);
      }
      // Same zone check
      if (primary === secondary) {
        errors.push(`Intermediate zone cannot use the same zone twice (${primary})`);
      }
    }
  }

  // Validate status
  if (!VALID_STATUSES.has(shot.status)) {
    errors.push(`Invalid status "${shot.status}"`);
  }

  // Semantic: DF only for serves
  if (shot.status === 'DF' && shot.type !== 'S') {
    errors.push('Double fault (DF) status is only valid for serves (S)');
  }

  // Semantic: serve should be first shot (sequence 1), but we can only warn
  if (shot.type === 'S' && shot.sequenceNumber !== undefined && shot.sequenceNumber > 1) {
    errors.push('Serve (S) should typically be the first shot in a point (sequenceNumber 1)');
  }

  // Semantic: return should be second shot
  if (shot.type === 'Re' && shot.sequenceNumber !== undefined && shot.sequenceNumber !== 2) {
    errors.push('Return (Re) should typically be the second shot in a point (sequenceNumber 2)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
