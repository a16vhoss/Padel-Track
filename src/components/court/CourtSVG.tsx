'use client';

import { useState } from 'react';
import { FloorZoneId, FloorZoneMetadata, ZoneDestination, WallZoneId } from '@/types/zones';
import { ShotType } from '@/types/shot';
import { FLOOR_ZONES, INTERMEDIATE_ZONE_LINES } from '@/lib/zones/zone-metadata';
import { WALL_ZONES } from '@/lib/zones/wall-zones';
import { getShotContextHint } from '@/lib/court/shotContext';
import { FloorZone } from './FloorZone';
import { IntermediateZone } from './IntermediateZone';

interface CourtSVGProps {
  selectedDestination: ZoneDestination | null;
  onSelectZone: (dest: ZoneDestination) => void;
  heatmapData?: Record<number, number>;
  wallHeatmapData?: Record<string, number>;
  showLabels?: boolean;
  interactive?: boolean;
  children?: React.ReactNode;
  // Wall integration
  wallBounces?: WallZoneId[];
  onWallToggle?: (w: WallZoneId) => void;
  showWalls?: boolean;
  // Full court orientation
  showFullCourt?: boolean;
  playerTeam?: 'team1' | 'team2';
  teamNames?: { team1: string; team2: string };
  shotType?: ShotType | null;
}

// Wall zone SVG definitions — wider walls with gap separation
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
  // Fondo baja (bottom wall, vidrio) — 30px tall, 4px gap from court (y=504)
  { id: 'P1', label: 'P1', x: 0, y: 504, width: 100, height: 30, wall: 'fondo', level: 'baja' },
  { id: 'P2', label: 'P2', x: 100, y: 504, width: 100, height: 30, wall: 'fondo', level: 'baja' },
  { id: 'P3', label: 'P3', x: 200, y: 504, width: 100, height: 30, wall: 'fondo', level: 'baja' },
  { id: 'P4', label: 'P4', x: 300, y: 504, width: 100, height: 30, wall: 'fondo', level: 'baja' },
  // Fondo alta (bottom wall, reja) — 24px tall, directly after baja (y=534)
  { id: 'P5', label: 'P5', x: 0, y: 534, width: 100, height: 24, wall: 'fondo', level: 'alta' },
  { id: 'P6', label: 'P6', x: 100, y: 534, width: 100, height: 24, wall: 'fondo', level: 'alta' },
  { id: 'P7', label: 'P7', x: 200, y: 534, width: 100, height: 24, wall: 'fondo', level: 'alta' },
  { id: 'P8', label: 'P8', x: 300, y: 534, width: 100, height: 24, wall: 'fondo', level: 'alta' },
  // Lateral izq baja (vidrio) — 30px wide, 4px gap (x=-34 to -4)
  { id: 'P12', label: 'P12', x: -34, y: 0, width: 30, height: 125, wall: 'lateral_izq', level: 'baja' },
  { id: 'P11', label: 'P11', x: -34, y: 125, width: 30, height: 125, wall: 'lateral_izq', level: 'baja' },
  { id: 'P10', label: 'P10', x: -34, y: 250, width: 30, height: 125, wall: 'lateral_izq', level: 'baja' },
  { id: 'P9', label: 'P9', x: -34, y: 375, width: 30, height: 125, wall: 'lateral_izq', level: 'baja' },
  // Lateral izq alta (reja) — 24px wide, directly after baja (x=-58 to -34)
  { id: 'P16', label: 'P16', x: -58, y: 0, width: 24, height: 125, wall: 'lateral_izq', level: 'alta' },
  { id: 'P15', label: 'P15', x: -58, y: 125, width: 24, height: 125, wall: 'lateral_izq', level: 'alta' },
  { id: 'P14', label: 'P14', x: -58, y: 250, width: 24, height: 125, wall: 'lateral_izq', level: 'alta' },
  { id: 'P13', label: 'P13', x: -58, y: 375, width: 24, height: 125, wall: 'lateral_izq', level: 'alta' },
  // Lateral der baja (vidrio) — 30px wide (x=404 to 434)
  { id: 'P20', label: 'P20', x: 404, y: 0, width: 30, height: 125, wall: 'lateral_der', level: 'baja' },
  { id: 'P19', label: 'P19', x: 404, y: 125, width: 30, height: 125, wall: 'lateral_der', level: 'baja' },
  { id: 'P18', label: 'P18', x: 404, y: 250, width: 30, height: 125, wall: 'lateral_der', level: 'baja' },
  { id: 'P17', label: 'P17', x: 404, y: 375, width: 30, height: 125, wall: 'lateral_der', level: 'baja' },
  // Lateral der alta (reja) — 24px wide (x=434 to 458)
  { id: 'P24', label: 'P24', x: 434, y: 0, width: 24, height: 125, wall: 'lateral_der', level: 'alta' },
  { id: 'P23', label: 'P23', x: 434, y: 125, width: 24, height: 125, wall: 'lateral_der', level: 'alta' },
  { id: 'P22', label: 'P22', x: 434, y: 250, width: 24, height: 125, wall: 'lateral_der', level: 'alta' },
  { id: 'P21', label: 'P21', x: 434, y: 375, width: 24, height: 125, wall: 'lateral_der', level: 'alta' },
];

// Look up displayName from WALL_ZONES metadata
const wallZoneDisplayMap = new Map(
  WALL_ZONES.map((w) => [w.id, w.displayName ?? w.name])
);

/** Get team color for a wall based on court half */
function getWallTeamColor(
  wz: (typeof WALL_SVG_ZONES)[number],
  playerTeam: 'team1' | 'team2' | undefined,
  showFullCourt: boolean,
): 'team1' | 'team2' | 'neutral' {
  if (!showFullCourt || !playerTeam) return 'neutral';
  // Fondo walls belong to the bottom half (team2 side in top half, etc.)
  if (wz.wall === 'fondo') return 'team2';
  // Lateral walls: bottom panels (y >= 250) = team2, top = team1
  if (wz.y + wz.height / 2 >= 250) return 'team2';
  return 'team1';
}

/** Bounce arrow path from wall center toward court interior */
function getBounceArrowPath(wz: (typeof WALL_SVG_ZONES)[number], yOff: number): string {
  const cx = wz.x + wz.width / 2;
  const cy = wz.y + wz.height / 2 + yOff;

  if (wz.wall === 'fondo') {
    // Arrow going up from bottom wall
    return `M ${cx} ${cy - 5} C ${cx} ${cy - 20}, ${cx + 10} ${cy - 30}, ${cx} ${cy - 40}`;
  }
  if (wz.wall === 'lateral_izq') {
    // Arrow going right from left wall
    return `M ${cx + 10} ${cy} C ${cx + 25} ${cy}, ${cx + 35} ${cy - 8}, ${cx + 45} ${cy}`;
  }
  // lateral_der — arrow going left from right wall
  return `M ${cx - 10} ${cy} C ${cx - 25} ${cy}, ${cx - 35} ${cy - 8}, ${cx - 45} ${cy}`;
}

/** Offset zone points by dy. */
function offsetZonePoints(zone: FloorZoneMetadata, dy: number): FloorZoneMetadata {
  const nums = zone.points.split(/[\s,]+/).map(Number);
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
  wallHeatmapData,
  showLabels = true,
  interactive = true,
  children,
  wallBounces,
  onWallToggle,
  showWalls = false,
  showFullCourt = false,
  playerTeam,
  teamNames,
  shotType,
}: CourtSVGProps) {
  const [hoveredWall, setHoveredWall] = useState<WallZoneId | null>(null);

  const topActive = showFullCourt ? playerTeam === 'team2' : true;
  const bottomActive = showFullCourt ? playerTeam === 'team1' : false;
  const topDimmed = showFullCourt && !topActive;
  const bottomDimmed = showFullCourt && !bottomActive;

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

  const wallYOffset = showFullCourt
    ? (bottomActive ? MIRROR_OFFSET : 0)
    : 0;
  const wallZonesToRender = showFullCourt
    ? (bottomActive
        ? WALL_SVG_ZONES
        : WALL_SVG_ZONES.filter((wz) => wz.wall !== 'fondo'))
    : WALL_SVG_ZONES;
  const showWallZones = showFullCourt ? (topActive || bottomActive) : true;

  // Compute viewBox — wider to accommodate wider walls
  const showWideView = hasWalls || !!wallHeatmapData;
  let viewBox: string;
  if (showFullCourt) {
    const bottomWallExtra = bottomActive && showWideView ? 62 : 0;
    const totalHeight = MIRROR_OFFSET + 500 + bottomWallExtra;
    viewBox = showWideView ? `-62 0 524 ${totalHeight}` : `0 0 400 ${totalHeight}`;
  } else {
    viewBox = showWideView ? '-62 0 524 564' : '0 0 400 500';
  }

  const team1Name = teamNames?.team1 ?? 'Equipo 1';
  const team2Name = teamNames?.team2 ?? 'Equipo 2';

  return (
    <div className="relative w-full max-w-md mx-auto">
      <svg
        viewBox={viewBox}
        className="w-full h-auto rounded-lg overflow-hidden"
        style={{ background: '#0a1f12' }}
      >
        {/* ===== SVG DEFS — patterns, gradients, filters ===== */}
        <defs>
          {/* Court surface gradient - realistic synthetic grass */}
          <linearGradient id="court-surface" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a5c2e" />
            <stop offset="50%" stopColor="#1e6b35" />
            <stop offset="100%" stopColor="#185528" />
          </linearGradient>

          {/* Court surface texture — subtle grass-like lines */}
          <pattern id="court-texture" patternUnits="userSpaceOnUse" width="4" height="8">
            <line x1="2" y1="0" x2="2" y2="8" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
          </pattern>

          {/* Net mesh pattern — realistic diamond pattern */}
          <pattern id="net-mesh" patternUnits="userSpaceOnUse" width="8" height="8">
            <path d="M0,4 L4,0 L8,4 L4,8 Z" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          </pattern>

          {/* Court outer shadow for 3D depth */}
          <filter id="court-depth" x="-5%" y="-2%" width="110%" height="104%">
            <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="rgba(0,0,0,0.4)" />
          </filter>

          {/* Glass pattern — subtle diagonal lines */}
          <pattern id="pattern-glass" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </pattern>

          {/* Mesh/reja pattern — open grid */}
          <pattern id="pattern-mesh" patternUnits="userSpaceOnUse" width="6" height="6">
            <rect width="6" height="6" fill="none" />
            <rect x="0" y="0" width="3" height="3" fill="rgba(255,255,255,0.06)" />
            <rect x="3" y="3" width="3" height="3" fill="rgba(255,255,255,0.06)" />
          </pattern>

          {/* Team color gradients for walls */}
          <linearGradient id="wall-grad-team1-baja" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(34,197,94,0.25)" />
            <stop offset="100%" stopColor="rgba(34,197,94,0.12)" />
          </linearGradient>
          <linearGradient id="wall-grad-team1-alta" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(34,197,94,0.15)" />
            <stop offset="100%" stopColor="rgba(34,197,94,0.06)" />
          </linearGradient>
          <linearGradient id="wall-grad-team2-baja" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(59,130,246,0.25)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0.12)" />
          </linearGradient>
          <linearGradient id="wall-grad-team2-alta" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(59,130,246,0.15)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0.06)" />
          </linearGradient>
          <linearGradient id="wall-grad-neutral-baja" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(99,102,241,0.2)" />
            <stop offset="100%" stopColor="rgba(99,102,241,0.08)" />
          </linearGradient>
          <linearGradient id="wall-grad-neutral-alta" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(99,102,241,0.12)" />
            <stop offset="100%" stopColor="rgba(99,102,241,0.04)" />
          </linearGradient>

          {/* Glow filter for selected walls */}
          <filter id="glow-wall" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="rgba(245,158,11,0.6)" />
          </filter>

          {/* Shadow filter for 3D depth */}
          <filter id="wall-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.4)" />
          </filter>

          {/* Arrowhead marker */}
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0,0 8,3 0,6" fill="rgba(245,158,11,0.8)" />
          </marker>
        </defs>

        {/* ===== TOP HALF (always team1) ===== */}

        {/* Court base with gradient */}
        <rect x="0" y="0" width="400" height="500" fill="url(#court-surface)" rx="6" filter="url(#court-depth)" />
        {/* Texture overlay */}
        <rect x="0" y="0" width="400" height="500" fill="url(#court-texture)" rx="6" />
        {/* Court border for depth */}
        <rect x="0" y="0" width="400" height="500" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" rx="6" />

        {/* Row background tints */}
        <rect x="0" y="0" width="400" height="140" fill={topDimmed ? 'rgba(220, 38, 38, 0.02)' : 'rgba(220, 38, 38, 0.06)'} />
        <rect x="0" y="140" width="400" height="175" fill={topDimmed ? 'rgba(5, 150, 105, 0.01)' : 'rgba(5, 150, 105, 0.04)'} />
        <rect x="0" y="315" width="400" height="185" fill={topDimmed ? 'rgba(37, 99, 235, 0.02)' : 'rgba(37, 99, 235, 0.06)'} />

        {/* Net line (original position — only when NOT full court) */}
        {!showFullCourt && (
          <>
            <line x1="0" y1="140" x2="400" y2="140" stroke="white" strokeWidth="3" opacity="0.6" />
            <line x1="0" y1="140" x2="400" y2="140" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2,2" />
            <text x="200" y="136" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9" fontWeight="bold" letterSpacing="2">
              RED
            </text>
          </>
        )}

        {/* Court boundary lines - thicker and more visible */}
        <line x1="0" y1="0" x2="400" y2="0" stroke={topDimmed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.4)'} strokeWidth="2.5" />
        <line x1="0" y1="500" x2="400" y2="500" stroke={topDimmed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.4)'} strokeWidth="2.5" />
        <line x1="0" y1="0" x2="0" y2="500" stroke={topDimmed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.4)'} strokeWidth="2.5" />
        <line x1="400" y1="0" x2="400" y2="500" stroke={topDimmed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.4)'} strokeWidth="2.5" />

        {/* Grid lines - columns */}
        <line x1="80" y1="0" x2="80" y2="500" stroke={topDimmed ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" />
        <line x1="140" y1="0" x2="140" y2="500" stroke={topDimmed ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" />
        <line x1="200" y1="0" x2="200" y2="500" stroke={topDimmed ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.12)'} strokeWidth="1" strokeDasharray="6,4" />
        <line x1="260" y1="0" x2="260" y2="500" stroke={topDimmed ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" />
        <line x1="320" y1="0" x2="320" y2="500" stroke={topDimmed ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" />

        {/* Grid lines - rows (service line) */}
        <line x1="0" y1="315" x2="400" y2="315" stroke={topDimmed ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" />

        {/* Team1 label (top) */}
        {showFullCourt && (
          <text x="200" y="20" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="11" fontWeight="bold" pointerEvents="none" letterSpacing="1">
            {team1Name.toUpperCase()}
          </text>
        )}

        {/* Floor zones (top half) */}
        {FLOOR_ZONES.map((zone) => (
          <FloorZone
            key={zone.id}
            zone={zone}
            isSelected={topDimmed ? false : isZoneSelected(zone.id)}
            heatValue={heatmapData ? (heatmapData[zone.id] || 0) / Math.max(...Object.values(heatmapData), 1) : undefined}
            onClick={interactive && !topDimmed ? () =>
              onSelectZone({ type: 'single', zone: zone.id })
            : () => {}}
            dimmed={topDimmed}
          />
        ))}

        {/* Intermediate zone lines (top half) */}
        {!topDimmed && INTERMEDIATE_ZONE_LINES.map((iz) => (
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
            {/* Net background with mesh pattern */}
            <rect x="0" y={NET_Y} width="400" height={NET_HEIGHT} fill="rgba(180,180,180,0.12)" />
            <rect x="0" y={NET_Y} width="400" height={NET_HEIGHT} fill="url(#net-mesh)" />
            {/* Net cable lines */}
            <line x1="0" y1={NET_Y} x2="400" y2={NET_Y} stroke="white" strokeWidth="3" opacity="0.8" />
            <line x1="0" y1={NET_Y + NET_HEIGHT} x2="400" y2={NET_Y + NET_HEIGHT} stroke="white" strokeWidth="2" opacity="0.5" />
            {/* Net post indicators */}
            <rect x="-2" y={NET_Y - 4} width="6" height={NET_HEIGHT + 8} fill="rgba(255,255,255,0.3)" rx="2" />
            <rect x="396" y={NET_Y - 4} width="6" height={NET_HEIGHT + 8} fill="rgba(255,255,255,0.3)" rx="2" />
            <text x="200" y={NET_Y + 14} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="11" fontWeight="bold" letterSpacing="6" pointerEvents="none">
              RED
            </text>
          </>
        )}

        {/* ===== BOTTOM HALF (always team2) ===== */}
        {showFullCourt && (
          <>
            {/* Bottom court base with gradient */}
            <rect x="0" y={MIRROR_OFFSET} width="400" height="500" fill="url(#court-surface)" />
            <rect x="0" y={MIRROR_OFFSET} width="400" height="500" fill="url(#court-texture)" />
            <rect x="0" y={MIRROR_OFFSET} width="400" height="500" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />

            {/* Bottom row background tints */}
            <rect x="0" y={MIRROR_OFFSET} width="400" height="140" fill={bottomDimmed ? 'rgba(220, 38, 38, 0.02)' : 'rgba(220, 38, 38, 0.06)'} />
            <rect x="0" y={MIRROR_OFFSET + 140} width="400" height="175" fill={bottomDimmed ? 'rgba(5, 150, 105, 0.01)' : 'rgba(5, 150, 105, 0.04)'} />
            <rect x="0" y={MIRROR_OFFSET + 315} width="400" height="185" fill={bottomDimmed ? 'rgba(37, 99, 235, 0.02)' : 'rgba(37, 99, 235, 0.06)'} />

            {/* Bottom grid lines - columns */}
            <line x1="80" y1={MIRROR_OFFSET} x2="80" y2={MIRROR_OFFSET + 500} stroke={bottomDimmed ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.15)'} strokeWidth="1" />
            <line x1="140" y1={MIRROR_OFFSET} x2="140" y2={MIRROR_OFFSET + 500} stroke={bottomDimmed ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.15)'} strokeWidth="1" />
            <line x1="200" y1={MIRROR_OFFSET} x2="200" y2={MIRROR_OFFSET + 500} stroke={bottomDimmed ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)'} strokeWidth="1" strokeDasharray="4,4" />
            <line x1="260" y1={MIRROR_OFFSET} x2="260" y2={MIRROR_OFFSET + 500} stroke={bottomDimmed ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.15)'} strokeWidth="1" />
            <line x1="320" y1={MIRROR_OFFSET} x2="320" y2={MIRROR_OFFSET + 500} stroke={bottomDimmed ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.15)'} strokeWidth="1" />

            {/* Bottom grid lines - rows */}
            <line x1="0" y1={MIRROR_OFFSET + 315} x2="400" y2={MIRROR_OFFSET + 315} stroke={bottomDimmed ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.15)'} strokeWidth="1" />

            {/* Bottom floor zones */}
            {FLOOR_ZONES.map((zone) => {
              const mirrored = offsetZonePoints(zone, MIRROR_OFFSET);
              return (
                <FloorZone
                  key={`bottom-${zone.id}`}
                  zone={mirrored}
                  isSelected={bottomDimmed ? false : isZoneSelected(zone.id)}
                  onClick={interactive && !bottomDimmed ? () =>
                    onSelectZone({ type: 'single', zone: zone.id })
                  : () => {}}
                  dimmed={bottomDimmed}
                />
              );
            })}

            {/* Bottom intermediate zone lines */}
            {!bottomDimmed && INTERMEDIATE_ZONE_LINES.map((iz) => {
              const shifted = {
                ...iz,
                y1: iz.y1 + MIRROR_OFFSET,
                y2: iz.y2 + MIRROR_OFFSET,
              };
              return (
                <IntermediateZone
                  key={`bottom-${iz.label}`}
                  zone={shifted}
                  isSelected={isIntermediateSelected(iz.zones[0], iz.zones[1])}
                  onClick={interactive ? () =>
                    onSelectZone({
                      type: 'intermediate',
                      primary: iz.zones[0],
                      secondary: iz.zones[1],
                    })
                  : () => {}}
                />
              );
            })}

            {/* Team2 label (bottom) */}
            <text x="200" y={MIRROR_OFFSET + 490} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="11" fontWeight="bold" pointerEvents="none" letterSpacing="1">
              {team2Name.toUpperCase()}
            </text>
          </>
        )}

        {/* ===== WALL ZONES — redesigned ===== */}
        {hasWalls && showWallZones && (
          <>
            {/* Dark gap between court and walls (4px visual separation) */}
            {/* Bottom gap */}
            {(!showFullCourt || bottomActive) && (
              <rect x="0" y={wallYOffset + 500} width="400" height="4" fill="rgba(0,0,0,0.6)" />
            )}
            {/* Left gap */}
            <rect x={-4} y={wallYOffset} width="4" height="500" fill="rgba(0,0,0,0.6)" />
            {/* Right gap */}
            <rect x="400" y={wallYOffset} width="4" height="500" fill="rgba(0,0,0,0.6)" />

            {/* 3D highlight line — white edge on court side */}
            {(!showFullCourt || bottomActive) && (
              <line x1="0" y1={wallYOffset + 500} x2="400" y2={wallYOffset + 500} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            )}
            <line x1="0" y1={wallYOffset} x2="0" y2={wallYOffset + 500} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <line x1="400" y1={wallYOffset} x2="400" y2={wallYOffset + 500} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

            {/* Dashed line separating baja/alta — fondo */}
            {(!showFullCourt || bottomActive) && (
              <line x1="0" y1={wallYOffset + 534} x2="400" y2={wallYOffset + 534} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4,3" />
            )}
            {/* Dashed line separating baja/alta — lateral izq */}
            <line x1={-34} y1={wallYOffset} x2={-34} y2={wallYOffset + 500} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4,3" />
            {/* Dashed line separating baja/alta — lateral der */}
            <line x1="434" y1={wallYOffset} x2="434" y2={wallYOffset + 500} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4,3" />

            {/* Wall section labels */}
            {(!showFullCourt || bottomActive) && (
              <>
                <text x="200" y={wallYOffset + 518} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontWeight="bold" letterSpacing="2" pointerEvents="none">
                  PARED FONDO
                </text>
                <text x="50" y={wallYOffset + 550} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="6" pointerEvents="none">
                  VIDRIO
                </text>
                <text x="50" y={wallYOffset + 556} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="5" pointerEvents="none">
                  ↑ baja | alta ↓
                </text>
              </>
            )}
            <text x={-46} y={wallYOffset + 250} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="7" fontWeight="bold" letterSpacing="1" pointerEvents="none" transform={`rotate(-90, -46, ${wallYOffset + 250})`}>
              PARED LAT. IZQ
            </text>
            <text x="446" y={wallYOffset + 250} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="7" fontWeight="bold" letterSpacing="1" pointerEvents="none" transform={`rotate(90, 446, ${wallYOffset + 250})`}>
              PARED LAT. DER
            </text>

            {/* Render each wall zone — 3 layers per zone */}
            {wallZonesToRender.map((wz) => {
              const isSelected = wallBounces!.includes(wz.id);
              const isHovered = hoveredWall === wz.id;
              const teamColor = getWallTeamColor(wz, playerTeam, showFullCourt);
              const gradientId = `wall-grad-${teamColor}-${wz.level}`;
              const patternId = wz.level === 'baja' ? 'pattern-glass' : 'pattern-mesh';
              const wy = wz.y + wallYOffset;

              const idleBorderColor = wz.level === 'baja'
                ? 'rgba(139, 92, 246, 0.4)'
                : 'rgba(139, 92, 246, 0.25)';
              const selectedBorderColor = 'rgba(245, 158, 11, 0.9)';
              const borderColor = isSelected ? selectedBorderColor : idleBorderColor;

              return (
                <g
                  key={wz.id}
                  className={`wall-zone ${isSelected ? 'wall-zone-selected' : ''}`}
                  filter={isSelected ? 'url(#glow-wall)' : 'url(#wall-shadow)'}
                  onMouseEnter={() => setHoveredWall(wz.id)}
                  onMouseLeave={() => setHoveredWall(null)}
                  onClick={() => onWallToggle!(wz.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Layer 1: Team color gradient base */}
                  <rect
                    x={wz.x}
                    y={wy}
                    width={wz.width}
                    height={wz.height}
                    fill={`url(#${gradientId})`}
                    rx="2"
                  />

                  {/* Layer 2: Glass/mesh pattern overlay */}
                  <rect
                    x={wz.x}
                    y={wy}
                    width={wz.width}
                    height={wz.height}
                    fill={`url(#${patternId})`}
                    rx="2"
                  />

                  {/* Layer 3: Border */}
                  <rect
                    x={wz.x}
                    y={wy}
                    width={wz.width}
                    height={wz.height}
                    fill="none"
                    stroke={borderColor}
                    strokeWidth={isSelected ? 2 : 1}
                    rx="2"
                  />

                  {/* Zone label */}
                  <text
                    x={wz.x + wz.width / 2}
                    y={wy + wz.height / 2 + 3}
                    textAnchor="middle"
                    fill={isSelected ? 'rgba(245, 158, 11, 0.95)' : isHovered ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)'}
                    fontSize={wz.level === 'baja' ? '8' : '7'}
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    pointerEvents="none"
                  >
                    {wz.id}
                  </text>
                </g>
              );
            })}

            {/* Bounce arrows for selected walls */}
            {wallZonesToRender.map((wz) => {
              if (!wallBounces!.includes(wz.id)) return null;
              const arrowPath = getBounceArrowPath(wz, wallYOffset);
              return (
                <path
                  key={`arrow-${wz.id}`}
                  d={arrowPath}
                  fill="none"
                  stroke="rgba(245,158,11,0.7)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  markerEnd="url(#arrowhead)"
                  className="bounce-arrow"
                  pointerEvents="none"
                />
              );
            })}

            {/* Tooltip for hovered wall */}
            {hoveredWall && (() => {
              const wz = wallZonesToRender.find((w) => w.id === hoveredWall);
              if (!wz) return null;
              const displayName = wallZoneDisplayMap.get(wz.id) ?? wz.id;
              const wy = wz.y + wallYOffset;

              // Position tooltip near the wall zone
              let tx = wz.x + wz.width / 2;
              let ty = wy - 14;

              // Adjust for lateral walls
              if (wz.wall === 'lateral_izq') {
                tx = wz.x + wz.width + 8;
                ty = wy + wz.height / 2;
              } else if (wz.wall === 'lateral_der') {
                tx = wz.x - 8;
                ty = wy + wz.height / 2;
              }

              const textLen = displayName.length * 5.2 + 12;
              const rectX = wz.wall === 'lateral_der'
                ? tx - textLen
                : wz.wall === 'lateral_izq'
                  ? tx
                  : tx - textLen / 2;

              return (
                <g className="wall-tooltip" pointerEvents="none">
                  <rect
                    x={rectX}
                    y={ty - 10}
                    width={textLen}
                    height="16"
                    rx="3"
                    fill="rgba(0,0,0,0.85)"
                    stroke="rgba(245,158,11,0.4)"
                    strokeWidth="1"
                  />
                  <text
                    x={rectX + textLen / 2}
                    y={ty + 1}
                    textAnchor="middle"
                    fill="rgba(245,158,11,0.95)"
                    fontSize="7"
                    fontWeight="600"
                  >
                    {displayName}
                  </text>
                </g>
              );
            })()}
          </>
        )}

        {/* Row labels (top half only) */}
        {showLabels && !topDimmed && (
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

        {/* Row labels (bottom half, when active) */}
        {showLabels && showFullCourt && !bottomDimmed && (
          <>
            <text x="200" y={MIRROR_OFFSET + 78} textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize="36" fontWeight="900" pointerEvents="none" letterSpacing="6">
              RED
            </text>
            <text x="200" y={MIRROR_OFFSET + 238} textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize="36" fontWeight="900" pointerEvents="none" letterSpacing="6">
              MEDIA
            </text>
            <text x="200" y={MIRROR_OFFSET + 418} textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize="36" fontWeight="900" pointerEvents="none" letterSpacing="6">
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

        {/* Wall zone backgrounds for heatmap mode */}
        {wallHeatmapData && !hasWalls && (
          <g opacity="0.6">
            {WALL_SVG_ZONES.map((wz) => {
              const patternId = wz.level === 'baja' ? 'pattern-glass' : 'pattern-mesh';
              return (
                <g key={`wh-bg-${wz.id}`}>
                  <rect
                    x={wz.x} y={wz.y}
                    width={wz.width} height={wz.height}
                    fill="rgba(139,92,246,0.08)" rx="2"
                  />
                  <rect
                    x={wz.x} y={wz.y}
                    width={wz.width} height={wz.height}
                    fill={`url(#${patternId})`} rx="2"
                  />
                  <rect
                    x={wz.x} y={wz.y}
                    width={wz.width} height={wz.height}
                    fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth="0.5" rx="2"
                  />
                </g>
              );
            })}
          </g>
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
            <>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm" style={{ background: 'rgba(99,102,241,0.5)', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 3px)' }} />
                Vidrio
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm" style={{ background: 'rgba(99,102,241,0.3)', backgroundImage: 'repeating-conic-gradient(rgba(255,255,255,0.1) 0% 25%, transparent 0% 50%) 0 0 / 4px 4px' }} />
                Reja
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
