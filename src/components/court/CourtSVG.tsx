'use client';

import { FloorZoneId, FloorZoneMetadata, ZoneDestination, WallZoneId } from '@/types/zones';
import { ShotType } from '@/types/shot';
import { FLOOR_ZONES, INTERMEDIATE_ZONE_LINES } from '@/lib/zones/zone-metadata';
import { getShotContextHint } from '@/lib/court/shotContext';
import { FloorZone } from './FloorZone';
import { IntermediateZone } from './IntermediateZone';

interface CourtSVGProps {
  selectedDestination: ZoneDestination | null;
  onSelectZone: (dest: ZoneDestination) => void;
  heatmapData?: Record<number, number>;
  showLabels?: boolean;
  interactive?: boolean;
  children?: React.ReactNode;
  // Wall integration
  wallBounces?: WallZoneId[];
  onWallToggle?: (w: WallZoneId) => void;
  showWalls?: boolean;
  // Full court orientation
  playerTeam?: 'team1' | 'team2';
  teamNames?: { team1: string; team2: string };
  shotType?: ShotType | null;
}

// Wall zone definitions for SVG rendering
const WALL_SVG_ZONES: Array<{
  id: WallZoneId;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  wall: 'fondo' | 'lateral_izq' | 'lateral_der';
  level: 'baja' | 'alta';
}> = [
  // Fondo baja (bottom wall, lower row) - 4 panels
  { id: 'P1', label: 'P1', x: 0, y: 500, width: 100, height: 20, wall: 'fondo', level: 'baja' },
  { id: 'P2', label: 'P2', x: 100, y: 500, width: 100, height: 20, wall: 'fondo', level: 'baja' },
  { id: 'P3', label: 'P3', x: 200, y: 500, width: 100, height: 20, wall: 'fondo', level: 'baja' },
  { id: 'P4', label: 'P4', x: 300, y: 500, width: 100, height: 20, wall: 'fondo', level: 'baja' },
  // Fondo alta (bottom wall, upper row) - 4 panels
  { id: 'P5', label: 'P5', x: 0, y: 520, width: 100, height: 16, wall: 'fondo', level: 'alta' },
  { id: 'P6', label: 'P6', x: 100, y: 520, width: 100, height: 16, wall: 'fondo', level: 'alta' },
  { id: 'P7', label: 'P7', x: 200, y: 520, width: 100, height: 16, wall: 'fondo', level: 'alta' },
  { id: 'P8', label: 'P8', x: 300, y: 520, width: 100, height: 16, wall: 'fondo', level: 'alta' },
  // Lateral izq baja (left wall) - 4 panels top to bottom
  { id: 'P12', label: 'P12', x: -20, y: 0, width: 20, height: 125, wall: 'lateral_izq', level: 'baja' },
  { id: 'P11', label: 'P11', x: -20, y: 125, width: 20, height: 125, wall: 'lateral_izq', level: 'baja' },
  { id: 'P10', label: 'P10', x: -20, y: 250, width: 20, height: 125, wall: 'lateral_izq', level: 'baja' },
  { id: 'P9', label: 'P9', x: -20, y: 375, width: 20, height: 125, wall: 'lateral_izq', level: 'baja' },
  // Lateral izq alta
  { id: 'P16', label: 'P16', x: -36, y: 0, width: 16, height: 125, wall: 'lateral_izq', level: 'alta' },
  { id: 'P15', label: 'P15', x: -36, y: 125, width: 16, height: 125, wall: 'lateral_izq', level: 'alta' },
  { id: 'P14', label: 'P14', x: -36, y: 250, width: 16, height: 125, wall: 'lateral_izq', level: 'alta' },
  { id: 'P13', label: 'P13', x: -36, y: 375, width: 16, height: 125, wall: 'lateral_izq', level: 'alta' },
  // Lateral der baja (right wall) - 4 panels top to bottom
  { id: 'P20', label: 'P20', x: 400, y: 0, width: 20, height: 125, wall: 'lateral_der', level: 'baja' },
  { id: 'P19', label: 'P19', x: 400, y: 125, width: 20, height: 125, wall: 'lateral_der', level: 'baja' },
  { id: 'P18', label: 'P18', x: 400, y: 250, width: 20, height: 125, wall: 'lateral_der', level: 'baja' },
  { id: 'P17', label: 'P17', x: 400, y: 375, width: 20, height: 125, wall: 'lateral_der', level: 'baja' },
  // Lateral der alta
  { id: 'P24', label: 'P24', x: 420, y: 0, width: 16, height: 125, wall: 'lateral_der', level: 'alta' },
  { id: 'P23', label: 'P23', x: 420, y: 125, width: 16, height: 125, wall: 'lateral_der', level: 'alta' },
  { id: 'P22', label: 'P22', x: 420, y: 250, width: 16, height: 125, wall: 'lateral_der', level: 'alta' },
  { id: 'P21', label: 'P21', x: 420, y: 375, width: 16, height: 125, wall: 'lateral_der', level: 'alta' },
];

/** Offset zone points by dy. */
function offsetZonePoints(zone: FloorZoneMetadata, dy: number): FloorZoneMetadata {
  const nums = zone.points.split(/[\s,]+/).map(Number);
  // Points are x,y pairs
  const shifted = [];
  for (let i = 0; i < nums.length; i += 2) {
    shifted.push(`${nums[i]},${nums[i + 1] + dy}`);
  }
  return {
    ...zone,
    points: shifted.join(' '),
    center: { x: zone.center.x, y: zone.center.y + dy },
  };
}

const NET_Y = 500;
const NET_HEIGHT = 20;
const MIRROR_OFFSET = NET_Y + NET_HEIGHT; // 520

export function CourtSVG({
  selectedDestination,
  onSelectZone,
  heatmapData,
  showLabels = true,
  interactive = true,
  children,
  wallBounces,
  onWallToggle,
  showWalls = false,
  playerTeam,
  teamNames,
  shotType,
}: CourtSVGProps) {
  const showFullCourt = !!playerTeam;

  const isZoneSelected = (id: FloorZoneId) => {
    if (!selectedDestination) return false;
    if (selectedDestination.type === 'single') return selectedDestination.zone === id;
    return selectedDestination.primary === id || selectedDestination.secondary === id;
  };

  const isIntermediateSelected = (z1: FloorZoneId, z2: FloorZoneId) => {
    if (!selectedDestination || selectedDestination.type !== 'intermediate') return false;
    return (
      (selectedDestination.primary === z1 && selectedDestination.secondary === z2) ||
      (selectedDestination.primary === z2 && selectedDestination.secondary === z1)
    );
  };

  const hasWalls = showWalls && wallBounces && onWallToggle;
  // In full court mode, hide fondo walls (they conflict with net separator)
  const wallZonesToRender = showFullCourt
    ? WALL_SVG_ZONES.filter((wz) => wz.wall !== 'fondo')
    : WALL_SVG_ZONES;

  // Compute viewBox
  let viewBox: string;
  if (showFullCourt) {
    const totalHeight = MIRROR_OFFSET + 500; // 1020
    viewBox = hasWalls ? `-40 0 480 ${totalHeight}` : `0 0 400 ${totalHeight}`;
  } else {
    viewBox = hasWalls ? '-40 0 480 540' : '0 0 400 500';
  }

  // Team labels
  const rivalLabel = playerTeam && teamNames
    ? (playerTeam === 'team1' ? teamNames.team2 : teamNames.team1)
    : null;
  const ownLabel = playerTeam && teamNames
    ? (playerTeam === 'team1' ? teamNames.team1 : teamNames.team2)
    : null;

  return (
    <div className="relative w-full max-w-md mx-auto">
      <svg
        viewBox={viewBox}
        className="w-full h-auto rounded-lg overflow-hidden"
        style={{ background: '#0f2e1a' }}
      >
        {/* ===== RIVAL HALF (top, interactive) ===== */}

        {/* Court base */}
        <rect x="0" y="0" width="400" height="500" fill="#163824" rx="8" />

        {/* Row background tints */}
        <rect x="0" y="0" width="400" height="140" fill="rgba(220, 38, 38, 0.06)" />
        <rect x="0" y="140" width="400" height="175" fill="rgba(5, 150, 105, 0.04)" />
        <rect x="0" y="315" width="400" height="185" fill="rgba(37, 99, 235, 0.06)" />

        {/* Net line (original, top of court — only when NOT full court) */}
        {!showFullCourt && (
          <>
            <line x1="0" y1="140" x2="400" y2="140" stroke="white" strokeWidth="3" opacity="0.5" />
            <text x="200" y="136" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9" fontWeight="bold" letterSpacing="2">
              RED
            </text>
          </>
        )}

        {/* Grid lines - columns */}
        <line x1="80" y1="0" x2="80" y2="500" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <line x1="140" y1="0" x2="140" y2="500" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <line x1="200" y1="0" x2="200" y2="500" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4,4" />
        <line x1="260" y1="0" x2="260" y2="500" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <line x1="320" y1="0" x2="320" y2="500" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

        {/* Grid lines - rows */}
        <line x1="0" y1="315" x2="400" y2="315" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

        {/* Rival team label (top) */}
        {showFullCourt && rivalLabel && (
          <text x="200" y="20" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="11" fontWeight="bold" pointerEvents="none" letterSpacing="1">
            {`LADO DE ${rivalLabel.toUpperCase()}`}
          </text>
        )}

        {/* Floor zones (rival — interactive) */}
        {FLOOR_ZONES.map((zone) => (
          <FloorZone
            key={zone.id}
            zone={zone}
            isSelected={isZoneSelected(zone.id)}
            heatValue={heatmapData ? (heatmapData[zone.id] || 0) / Math.max(...Object.values(heatmapData), 1) : undefined}
            onClick={interactive ? () =>
              onSelectZone({ type: 'single', zone: zone.id })
            : () => {}}
          />
        ))}

        {/* Intermediate zone lines */}
        {INTERMEDIATE_ZONE_LINES.map((iz) => (
          <IntermediateZone
            key={iz.label}
            zone={iz}
            isSelected={isIntermediateSelected(iz.zones[0], iz.zones[1])}
            onClick={interactive ? () =>
              onSelectZone({
                type: 'intermediate',
                primary: iz.zones[0],
                secondary: iz.zones[1],
              })
            : () => {}}
          />
        ))}

        {/* ===== NET SEPARATOR (full court only) ===== */}
        {showFullCourt && (
          <>
            <rect x="0" y={NET_Y} width="400" height={NET_HEIGHT} fill="rgba(255,255,255,0.08)" />
            <line x1="0" y1={NET_Y} x2="400" y2={NET_Y} stroke="white" strokeWidth="3" opacity="0.7" />
            <line x1="0" y1={NET_Y + NET_HEIGHT} x2="400" y2={NET_Y + NET_HEIGHT} stroke="white" strokeWidth="3" opacity="0.7" />
            <text x="200" y={NET_Y + 14} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="12" fontWeight="bold" letterSpacing="4" pointerEvents="none">
              RED
            </text>
          </>
        )}

        {/* ===== OWN HALF (bottom, dimmed, non-interactive) ===== */}
        {showFullCourt && (
          <>
            {/* Own court base */}
            <rect x="0" y={MIRROR_OFFSET} width="400" height="500" fill="#163824" />

            {/* Own row background tints (same order: red near net, fondo at bottom) */}
            <rect x="0" y={MIRROR_OFFSET} width="400" height="140" fill="rgba(220, 38, 38, 0.03)" />
            <rect x="0" y={MIRROR_OFFSET + 140} width="400" height="175" fill="rgba(5, 150, 105, 0.02)" />
            <rect x="0" y={MIRROR_OFFSET + 315} width="400" height="185" fill="rgba(37, 99, 235, 0.03)" />

            {/* Own grid lines - columns */}
            <line x1="80" y1={MIRROR_OFFSET} x2="80" y2={MIRROR_OFFSET + 500} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <line x1="140" y1={MIRROR_OFFSET} x2="140" y2={MIRROR_OFFSET + 500} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <line x1="200" y1={MIRROR_OFFSET} x2="200" y2={MIRROR_OFFSET + 500} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="260" y1={MIRROR_OFFSET} x2="260" y2={MIRROR_OFFSET + 500} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <line x1="320" y1={MIRROR_OFFSET} x2="320" y2={MIRROR_OFFSET + 500} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

            {/* Own grid lines - rows */}
            <line x1="0" y1={MIRROR_OFFSET + 315} x2="400" y2={MIRROR_OFFSET + 315} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

            {/* Own floor zones (dimmed, non-interactive) */}
            {FLOOR_ZONES.map((zone) => {
              const mirrored = offsetZonePoints(zone, MIRROR_OFFSET);
              return (
                <FloorZone
                  key={`own-${zone.id}`}
                  zone={mirrored}
                  isSelected={false}
                  onClick={() => {}}
                  dimmed
                />
              );
            })}

            {/* Own team label (bottom) */}
            {ownLabel && (
              <text x="200" y={MIRROR_OFFSET + 490} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="11" fontWeight="bold" pointerEvents="none" letterSpacing="1">
                {`TU LADO (${ownLabel.toUpperCase()})`}
              </text>
            )}
          </>
        )}

        {/* Wall zones integrated into SVG */}
        {hasWalls && (
          <>
            {/* Wall labels */}
            {!showFullCourt && (
              <text x="200" y="514" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7" fontWeight="bold" letterSpacing="1">
                FONDO
              </text>
            )}
            <text x="-28" y="250" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7" fontWeight="bold" letterSpacing="1" transform="rotate(-90, -28, 250)">
              LAT. IZQ
            </text>
            <text x="428" y="250" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7" fontWeight="bold" letterSpacing="1" transform="rotate(90, 428, 250)">
              LAT. DER
            </text>

            {wallZonesToRender.map((wz) => {
              const isSelected = wallBounces!.includes(wz.id);
              const fillColor = isSelected
                ? 'rgba(245, 158, 11, 0.4)'
                : wz.level === 'baja'
                  ? 'rgba(139, 92, 246, 0.1)'
                  : 'rgba(139, 92, 246, 0.05)';
              const strokeColor = isSelected
                ? 'rgba(245, 158, 11, 0.8)'
                : 'rgba(139, 92, 246, 0.3)';

              return (
                <g key={wz.id}>
                  <rect
                    x={wz.x}
                    y={wz.y}
                    width={wz.width}
                    height={wz.height}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth="1"
                    rx="2"
                    className="cursor-pointer"
                    onClick={() => onWallToggle!(wz.id)}
                  />
                  <text
                    x={wz.x + wz.width / 2}
                    y={wz.y + wz.height / 2 + 3}
                    textAnchor="middle"
                    fill={isSelected ? 'rgba(245, 158, 11, 0.9)' : 'rgba(255,255,255,0.25)'}
                    fontSize="7"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    pointerEvents="none"
                  >
                    {wz.id}
                  </text>
                </g>
              );
            })}
          </>
        )}

        {/* Row labels */}
        {showLabels && (
          <>
            <text x="200" y="78" textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize="36" fontWeight="900" pointerEvents="none" letterSpacing="6">
              RED
            </text>
            <text x="200" y="238" textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize="36" fontWeight="900" pointerEvents="none" letterSpacing="6">
              MEDIA
            </text>
            <text x="200" y="418" textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize="36" fontWeight="900" pointerEvents="none" letterSpacing="6">
              FONDO
            </text>
          </>
        )}

        {/* Hint when no zone selected (non full-court mode) */}
        {interactive && !selectedDestination && !showFullCourt && (
          <text x="200" y="488" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="12" pointerEvents="none">
            Toca una zona donde cayo la pelota
          </text>
        )}

        {/* Analysis overlay children */}
        {children}
      </svg>

      {/* Contextual hint banner (full court mode) */}
      {showFullCourt && (
        <div className="mt-1 text-center text-xs text-muted-foreground/70 font-medium py-1.5 px-3 bg-card/50 rounded-md border border-border/30">
          {getShotContextHint(shotType ?? null)}
        </div>
      )}

      {/* Selected zone info badge */}
      {selectedDestination && (
        <div className={`${showFullCourt ? 'mt-1' : 'absolute bottom-2 left-2 right-2'} bg-black/80 backdrop-blur-sm rounded-md px-3 py-1.5 text-xs text-center font-medium`}>
          {selectedDestination.type === 'single'
            ? `Zona ${selectedDestination.zone}`
            : `Zona intermedia ${selectedDestination.primary},${selectedDestination.secondary}`
          }
        </div>
      )}

      {/* Legend */}
      {showLabels && (
        <div className="flex justify-center gap-4 mt-2 text-[10px] text-muted">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-red-600/60" />
            Ataque
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-emerald-600/60" />
            Transicion
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-blue-600/60" />
            Defensa
          </span>
          {hasWalls && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-purple-600/60" />
              Pared
            </span>
          )}
        </div>
      )}
    </div>
  );
}
