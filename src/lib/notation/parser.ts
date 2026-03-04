import type { Shot, PlayerId, ShotType, ShotDirection, ShotPower, ShotSpin, ShotStatus } from '@/types/shot';
import type { ZoneDestination, WallZoneId } from '@/types/zones';

/**
 * Parses compact notation back to a partial Shot object.
 *
 * General pattern:
 *   (J[1-4]):([A-Za-z0-9]+)([\+\-]{0,2})([~^]?)((?::[A-Z]\d+(?:-[A-Z]\d+)*)?)(\/[a-z]+)?(?:->(\d+(?:,\d+)?))?([WXNDF]*)?
 *
 * Encoding order (derived from examples):
 *   [Player]:[ShotType][Power][Spin][WallBounces][Direction]->[Zone][Status]
 */

const VALID_SHOT_TYPES: Set<string> = new Set([
  'S', 'Re', 'B', 'Rm', 'Vi', 'BP', 'x4', 'G', 'V', 'D', 'Ch', 'Ps', 'CP', 'Bl',
]);

const VALID_PLAYERS: Set<string> = new Set(['J1', 'J2', 'J3', 'J4']);

const VALID_DIRECTIONS: Set<string> = new Set(['cr', 'pa', 'ce']);

const VALID_STATUSES: Set<string> = new Set(['W', 'X', 'N', 'DF', '']);

// Regex for the full notation string.
// Groups:
//   1: Player (J1-J4)
//   2: Shot type (one or two alphanumeric chars, e.g. S, Re, BP, x4)
//   3: Power (++, +, -, or empty)
//   4: Spin (^ or ~ or empty)
//   5: Wall bounces (e.g. :P5 or :P4-P17 or empty)
//   6: Direction (e.g. /cr or empty)
//   7: Zone destination (e.g. 8 or 12,13 or empty)
//   8: Status (W, X, N, DF, or empty)
const NOTATION_REGEX =
  /^(J[1-4]):((?:[A-Za-z][A-Za-z0-9]?))(\+{1,2}|-)?([~^])?((?::[A-Z]\d+(?:-[A-Z]\d+)*)*)?(\/[a-z]+)?(?:->(\d+(?:,\d+)?))?([WXNDF]{0,2})?$/;

function parseWallBounces(raw: string): WallZoneId[] {
  if (!raw) return [];
  // Remove leading colon, then split by '-'
  const cleaned = raw.startsWith(':') ? raw.slice(1) : raw;
  if (!cleaned) return [];
  return cleaned.split('-') as WallZoneId[];
}

function parsePower(raw: string | undefined): ShotPower {
  if (!raw) return '';
  if (raw === '++') return '++';
  if (raw === '+') return '+';
  if (raw === '-') return '-';
  return '';
}

function parseSpin(raw: string | undefined): ShotSpin {
  if (!raw) return '';
  if (raw === '^') return '^';
  if (raw === '~') return '~';
  return '';
}

function parseDirection(raw: string | undefined): ShotDirection | undefined {
  if (!raw) return undefined;
  const dir = raw.startsWith('/') ? raw.slice(1) : raw;
  if (VALID_DIRECTIONS.has(dir)) return dir as ShotDirection;
  return undefined;
}

function parseDestination(raw: string | undefined): ZoneDestination | undefined {
  if (!raw) return undefined;
  const parts = raw.split(',');
  if (parts.length === 1) {
    const zone = parseInt(parts[0], 10);
    if (isNaN(zone) || zone < 1 || zone > 15) return undefined;
    return { type: 'single', zone: zone as ZoneDestination extends { type: 'single' } ? ZoneDestination['zone'] : never } as ZoneDestination;
  }
  if (parts.length === 2) {
    const primary = parseInt(parts[0], 10);
    const secondary = parseInt(parts[1], 10);
    if (isNaN(primary) || isNaN(secondary)) return undefined;
    if (primary < 1 || primary > 15 || secondary < 1 || secondary > 15) return undefined;
    return { type: 'intermediate', primary, secondary } as ZoneDestination;
  }
  return undefined;
}

function parseStatus(raw: string | undefined): ShotStatus {
  if (!raw || raw === '') return '';
  if (raw === 'W') return 'W';
  if (raw === 'X') return 'X';
  if (raw === 'N') return 'N';
  if (raw === 'DF') return 'DF';
  return '';
}

export interface ParseError {
  error: string;
}

/**
 * Parse a single shot notation string into a partial Shot object.
 * Returns an object with an `error` field if parsing fails.
 */
export function parseNotation(notation: string): Partial<Shot> | ParseError {
  const trimmed = notation.trim();
  if (!trimmed) {
    return { error: 'Empty notation string' };
  }

  const match = trimmed.match(NOTATION_REGEX);
  if (!match) {
    return { error: `Invalid notation format: "${trimmed}"` };
  }

  const [, playerRaw, shotTypeRaw, powerRaw, spinRaw, wallsRaw, directionRaw, zoneRaw, statusRaw] = match;

  // Validate player
  if (!VALID_PLAYERS.has(playerRaw)) {
    return { error: `Invalid player: "${playerRaw}"` };
  }

  // Validate shot type
  if (!VALID_SHOT_TYPES.has(shotTypeRaw)) {
    return { error: `Invalid shot type: "${shotTypeRaw}"` };
  }

  const player = playerRaw as PlayerId;
  const type = shotTypeRaw as ShotType;
  const power = parsePower(powerRaw);
  const spin = parseSpin(spinRaw);
  const wallBounces = parseWallBounces(wallsRaw || '');
  const direction = parseDirection(directionRaw);
  const destination = parseDestination(zoneRaw);
  const status = parseStatus(statusRaw);

  const result: Partial<Shot> = {
    player,
    type,
    modifiers: {
      power,
      spin,
      wallBounces,
      ...(direction !== undefined && { direction }),
    },
    status,
    notation: trimmed,
  };

  if (destination) {
    result.destination = destination;
  }

  return result;
}

/**
 * Parse a full point notation (multiple shots separated by ` | `).
 * Returns an array of partial Shot objects or errors.
 */
export function parsePointNotation(notation: string): Array<Partial<Shot> | ParseError> {
  if (!notation || !notation.trim()) {
    return [{ error: 'Empty point notation string' }];
  }

  const shotNotations = notation.split(' | ');
  return shotNotations.map((shotNotation) => parseNotation(shotNotation));
}
