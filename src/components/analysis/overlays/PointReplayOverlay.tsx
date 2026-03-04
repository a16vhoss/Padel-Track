'use client';

import { Shot } from '@/types/shot';
import { Match } from '@/types/match';
import { FLOOR_ZONES } from '@/lib/zones/zone-metadata';
import { FloorZoneId } from '@/types/zones';

interface PointReplayOverlayProps {
  shots: Shot[];
  currentStep: number;
  match: Match;
}

function getZoneCenter(shot: Shot): { x: number; y: number } | null {
  if (!shot.destination) return null;
  const zoneId: FloorZoneId = shot.destination.type === 'single'
    ? shot.destination.zone
    : shot.destination.primary;
  const zone = FLOOR_ZONES.find((z) => z.id === zoneId);
  return zone?.center ?? null;
}

function isTeam1(playerId: string): boolean {
  return playerId === 'J1' || playerId === 'J2';
}

export function PointReplayOverlay({ shots, currentStep, match }: PointReplayOverlayProps) {
  if (shots.length === 0) return null;

  const visibleShots = shots.slice(0, currentStep + 1);

  // Compute positions
  const positions = visibleShots.map((shot) => ({
    shot,
    center: getZoneCenter(shot),
  })).filter((p) => p.center !== null) as {
    shot: Shot;
    center: { x: number; y: number };
  }[];

  return (
    <g>
      {/* Connecting lines between shots */}
      {positions.map((pos, i) => {
        if (i === 0) return null;
        const prev = positions[i - 1];
        return (
          <line
            key={`line-${i}`}
            x1={prev.center.x}
            y1={prev.center.y}
            x2={pos.center.x}
            y2={pos.center.y}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            strokeDasharray="4,4"
            pointerEvents="none"
          />
        );
      })}

      {/* Shot dots */}
      {positions.map((pos, i) => {
        const isCurrent = i === positions.length - 1;
        const team1 = isTeam1(pos.shot.player);
        const color = team1
          ? (match.teams[0].color || '#22c55e')
          : (match.teams[1].color || '#3b82f6');
        const radius = isCurrent ? 14 : 8;

        return (
          <g key={`dot-${i}`}>
            {/* Pulse animation for current shot */}
            {isCurrent && (
              <circle
                cx={pos.center.x}
                cy={pos.center.y}
                r={18}
                fill="none"
                stroke={color}
                strokeWidth="2"
                opacity="0.5"
                pointerEvents="none"
              >
                <animate
                  attributeName="r"
                  from="14"
                  to="24"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.6"
                  to="0"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </circle>
            )}

            {/* Shot circle */}
            <circle
              cx={pos.center.x}
              cy={pos.center.y}
              r={radius}
              fill={color}
              stroke="white"
              strokeWidth={isCurrent ? 2.5 : 1.5}
              opacity={isCurrent ? 1 : 0.7}
              pointerEvents="none"
            />

            {/* Sequence number */}
            <text
              x={pos.center.x}
              y={pos.center.y + (isCurrent ? 4 : 3)}
              textAnchor="middle"
              fill="white"
              fontSize={isCurrent ? 11 : 9}
              fontWeight="bold"
              pointerEvents="none"
            >
              {i + 1}
            </text>

            {/* Label for current shot */}
            {isCurrent && (
              <text
                x={pos.center.x}
                y={pos.center.y - 20}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="600"
                pointerEvents="none"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
              >
                {pos.shot.player} {pos.shot.type}
                {pos.shot.status ? ` (${pos.shot.status})` : ''}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
