import { Shot, PlayerId, AllPlayerPositions, PlayerCoords } from '@/types/shot';
import { ServeSide } from '@/types/match';
import { getFloorZone } from '@/lib/zones/zone-metadata';
import { ZoneDestination } from '@/types/zones';

// Default positions (typical padel formation)
const DEFAULT_POSITIONS: AllPlayerPositions = {
  J1: { x: 300, y: 100 },  // Team1 derecha, red
  J2: { x: 100, y: 100 },  // Team1 izquierda, red
  J3: { x: 300, y: 400 },  // Team2 derecha, fondo
  J4: { x: 100, y: 400 },  // Team2 izquierda, fondo
};

// Serve positions based on side
const SERVE_POSITIONS: Record<ServeSide, Record<PlayerId, PlayerCoords>> = {
  derecha: {
    J1: { x: 300, y: 420 },  // Sacador derecha (fondo)
    J2: { x: 100, y: 100 },  // Compañero en red
    J3: { x: 300, y: 380 },  // Restador derecha
    J4: { x: 100, y: 100 },  // Compañero en red
  },
  izquierda: {
    J1: { x: 100, y: 420 },  // Sacador izquierda (fondo)
    J2: { x: 300, y: 100 },  // Compañero en red
    J3: { x: 100, y: 380 },  // Restador izquierda
    J4: { x: 300, y: 100 },  // Compañero en red
  },
};

function isTeam1(player: PlayerId): boolean {
  return player === 'J1' || player === 'J2';
}

function getTeammate(player: PlayerId): PlayerId {
  const teammates: Record<PlayerId, PlayerId> = {
    J1: 'J2', J2: 'J1', J3: 'J4', J4: 'J3',
  };
  return teammates[player];
}

function getZoneCenter(destination: ZoneDestination | null): PlayerCoords | null {
  if (!destination) return null;

  if (destination.type === 'single') {
    const zone = getFloorZone(destination.zone);
    return { x: zone.center.x, y: zone.center.y };
  }

  // Intermediate zone: average of both zone centers
  const z1 = getFloorZone(destination.primary);
  const z2 = getFloorZone(destination.secondary);
  return {
    x: Math.round((z1.center.x + z2.center.x) / 2),
    y: Math.round((z1.center.y + z2.center.y) / 2),
  };
}

export interface InferResult {
  positions: AllPlayerPositions;
  needsManualInput: boolean;
}

/**
 * Infer player positions based on the shot sequence and game context.
 *
 * Rules:
 * - Serve: standard positions based on serveSide and server
 * - Return: returner moves to the destination zone of the serve
 * - Rally: responding player moves to the destination of the previous shot
 * - No destination available: flag needsManualInput
 */
export function inferPositions(
  shots: Shot[],
  currentPlayer: PlayerId,
  server: PlayerId,
  serveSide: ServeSide,
  previousPositions?: AllPlayerPositions,
): InferResult {
  const shotCount = shots.length;

  // Shot 0: Serve — use standard serve positions
  if (shotCount === 0) {
    const base = serveSide === 'derecha'
      ? { ...SERVE_POSITIONS.derecha }
      : { ...SERVE_POSITIONS.izquierda };

    // Adjust for actual server (default assumes J1 serves, J3 returns)
    if (server === 'J2') {
      // J2 serves from the indicated side, J1 at net
      const tmp = base.J1;
      base.J1 = base.J2;
      base.J2 = tmp;
    } else if (server === 'J3') {
      // J3 serves — swap team roles
      const tmp1 = base.J1;
      const tmp2 = base.J2;
      base.J1 = base.J3;
      base.J2 = base.J4;
      base.J3 = tmp1;
      base.J4 = tmp2;
    } else if (server === 'J4') {
      const tmp1 = base.J1;
      const tmp2 = base.J2;
      base.J1 = base.J4;
      base.J2 = base.J3;
      base.J3 = tmp2;
      base.J4 = tmp1;
    }

    return { positions: base, needsManualInput: false };
  }

  // For shots 1+: infer based on previous shot's destination
  const prevShot = shots[shotCount - 1];
  const destCenter = getZoneCenter(prevShot.destination);

  // Start from previous known positions or defaults
  const positions: AllPlayerPositions = previousPositions
    ? { ...previousPositions }
    : { ...DEFAULT_POSITIONS };

  if (!destCenter) {
    // Can't infer — need manual input
    return { positions, needsManualInput: true };
  }

  // The responding player moves to where the ball went
  positions[currentPlayer] = destCenter;

  // Teammate of the responding player stays at their last known position
  // (already in positions from previousPositions)

  // The team that hit the previous shot also stays at their positions
  // (already in positions from previousPositions)

  return { positions, needsManualInput: false };
}

export { DEFAULT_POSITIONS };
