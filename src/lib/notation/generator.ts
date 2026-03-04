import type { Shot, PlayerId, ShotType, ShotDirection, ShotPower, ShotSpin, ShotStatus } from '@/types/shot';
import type { ZoneDestination, WallZoneId } from '@/types/zones';

/**
 * Generates compact notation from a Shot object.
 *
 * Format: [Player]:[Shot]:[Modifiers]->[Zone][Status]
 *
 * Examples:
 *   J1:S+->8         (saque fuerte a zona 8)
 *   J3:Re/cr->3      (resto cruzado a zona 3)
 *   J2:D-->12,13W    (dejada suave entre zona 12 y 13, winner)
 *   J1:G^:P5->1,2    (globo liftado, pega pared P5, cae entre 1 y 2)
 *   J4:Ps++->6,7W    (passing shot muy fuerte entre 6 y 7, winner)
 */

function encodePlayer(player: PlayerId): string {
  return player;
}

function encodeShotType(type: ShotType): string {
  return type;
}

function encodeWallBounces(walls: WallZoneId[]): string {
  if (!walls || walls.length === 0) return '';
  return ':' + walls.join('-');
}

function encodeDirection(direction?: ShotDirection): string {
  if (!direction) return '';
  return '/' + direction;
}

function encodePower(power: ShotPower): string {
  // '' (normal) maps to nothing in notation
  // '-' maps to '-'
  // '+' maps to '+'
  // '++' maps to '++'
  return power;
}

function encodeSpin(spin: ShotSpin): string {
  // '' maps to nothing, '^' liftado, '~' cortado
  return spin;
}

function encodeDestination(destination: ZoneDestination | null): string {
  if (!destination) return '';
  if (destination.type === 'single') {
    return '->' + destination.zone;
  }
  return '->' + destination.primary + ',' + destination.secondary;
}

function encodeStatus(status: ShotStatus): string {
  // '' (continues) maps to nothing
  return status;
}

/**
 * Generate compact notation string from a Shot object.
 */
export function generateNotation(shot: Shot): string {
  const parts: string[] = [];

  // Player and shot type
  parts.push(encodePlayer(shot.player));
  parts.push(':');
  parts.push(encodeShotType(shot.type));

  // Modifiers: power and spin come before wall bounces in the encoded string,
  // but the spec says order is: wall bounces, direction, power, spin.
  // Let's follow the spec order exactly.

  // 1. Power (appended directly after shot type or direction)
  // 2. Spin (appended directly after power)
  // But wall bounces and direction come first, so we need to build carefully.

  // Actually, re-reading the spec:
  // Format: [Player]:[Shot]:[Modifiers]->[Zone][Status]
  // Modifiers in order: wall bounces, direction, power, spin
  //
  // Looking at examples:
  //   J2:D-->12,13W   -> D then - (power suave) then -> zone
  //   J1:G^:P5->1,2   -> G then ^ (spin liftado) then :P5 (wall) then -> zone
  //
  // Wait, in J1:G^:P5->1,2 the spin comes BEFORE the wall bounce.
  // But in the rules it says order is: wall bounces, direction, power, spin.
  //
  // Let me re-read examples more carefully:
  //   J1:G^:P5->1,2 => Player:ShotType Spin : WallBounces -> Zone
  //
  // Hmm, that contradicts "wall bounces first". Let me look again...
  // The format says modifiers are "all optional, in order":
  //   Wall bounces: :P5 or :P4-P17
  //   Direction: /cr, /pa, /ce
  //   Power: +, ++, -
  //   Spin: ^, ~
  //
  // But example J1:G^:P5->1,2 has spin before walls.
  // Actually wait -- maybe the example means: G^ is shot+spin, then :P5 is wall.
  // So the actual encoding order after the shot code is: spin, walls, direction, power?
  //
  // Let me re-examine all examples:
  //   J1:S+->8        => S + (power) -> 8
  //   J3:Re/cr->3     => Re /cr (direction) -> 3
  //   J2:D-->12,13W   => D - (power) -> 12,13 W (status)
  //   J1:G^:P5->1,2   => G ^ (spin) :P5 (wall) -> 1,2
  //   J4:Ps++->6,7W   => Ps ++ (power) -> 6,7 W
  //
  // So the order appears to be: ShotType, then spin (^/~), then walls (:P..),
  // then direction (/cr etc), then power (+/-/++).
  //
  // But that conflicts with J2:D-->12,13W where power (-) comes right after D
  // with no spin or walls in between.
  //
  // The simplest interpretation: all modifiers are appended directly after the
  // shot code, and since they use distinct characters they can be in any order
  // and still be unambiguous. But the spec says "in order: walls, direction,
  // power, spin".
  //
  // Let me reconcile: In J1:G^:P5->1,2, the ^ is part of the shot code area
  // (immediately after G), and :P5 is the wall modifier. So the actual
  // encoding is: ShotType + Power + Spin + WallBounces + Direction -> Zone + Status
  //
  // Looking at J2:D-->12,13W: D (shot) + - (power) + -> (zone arrow) = D-->
  // That works if power+spin come right after shot, then walls, then direction.
  //
  // Re-reading spec one more time: "Modifiers (all optional, in order):
  //   Wall bounces, Direction, Power, Spin"
  // This is the conceptual order listed, but from examples it's clear the
  // encoding puts power and spin directly after the shot code (they're single
  // chars), then wall bounces (prefixed with :), then direction (prefixed with /).
  //
  // Final encoding order based on examples:
  //   [ShotType][Power][Spin][WallBounces][Direction]->[Zone][Status]

  const power = encodePower(shot.modifiers.power);
  const spin = encodeSpin(shot.modifiers.spin);
  const walls = encodeWallBounces(shot.modifiers.wallBounces);
  const direction = encodeDirection(shot.modifiers.direction);

  parts.push(power);
  parts.push(spin);
  parts.push(walls);
  parts.push(direction);

  // Destination
  parts.push(encodeDestination(shot.destination));

  // Status
  parts.push(encodeStatus(shot.status));

  return parts.join('');
}

/**
 * Generate notation for an entire point (sequence of shots),
 * joined by ` | `.
 */
export function generatePointNotation(shots: Shot[]): string {
  return shots.map(generateNotation).join(' | ');
}
