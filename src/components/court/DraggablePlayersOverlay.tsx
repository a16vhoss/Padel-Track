'use client';

import { useRef, useCallback, useState } from 'react';
import { PlayerId, AllPlayerPositions, PlayerCoords } from '@/types/shot';
import { Team } from '@/types/match';

interface DraggablePlayersOverlayProps {
  positions: AllPlayerPositions;
  onPositionChange: (player: PlayerId, pos: PlayerCoords) => void;
  teams: [Team, Team];
  needsManualInput: boolean;
  svgRef: React.RefObject<SVGSVGElement | null>;
}

const PLAYER_IDS: PlayerId[] = ['J1', 'J2', 'J3', 'J4'];
const RADIUS = 18;

function getTeamColor(player: PlayerId, teams: [Team, Team]): string {
  const isTeam1 = player === 'J1' || player === 'J2';
  return isTeam1
    ? (teams[0].color || '#22c55e')
    : (teams[1].color || '#3b82f6');
}

function getPlayerLabel(player: PlayerId, teams: [Team, Team]): string {
  const isTeam1 = player === 'J1' || player === 'J2';
  const team = isTeam1 ? teams[0] : teams[1];
  const playerIdx = (player === 'J1' || player === 'J3') ? 0 : 1;
  return team.players[playerIdx].shortName.slice(0, 2).toUpperCase();
}

function svgPoint(
  svgEl: SVGSVGElement,
  clientX: number,
  clientY: number,
): PlayerCoords {
  const pt = svgEl.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svgEl.getScreenCTM();
  if (!ctm) return { x: clientX, y: clientY };
  const svgPt = pt.matrixTransform(ctm.inverse());
  return {
    x: Math.round(Math.max(0, Math.min(400, svgPt.x))),
    y: Math.round(Math.max(0, Math.min(500, svgPt.y))),
  };
}

export function DraggablePlayersOverlay({
  positions,
  onPositionChange,
  teams,
  needsManualInput,
  svgRef,
}: DraggablePlayersOverlayProps) {
  const [dragging, setDragging] = useState<PlayerId | null>(null);
  const dragOffset = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  const handlePointerDown = useCallback(
    (player: PlayerId, e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      (e.target as Element).setPointerCapture(e.pointerId);
      setDragging(player);

      if (svgRef.current) {
        const svgPt = svgPoint(svgRef.current, e.clientX, e.clientY);
        dragOffset.current = {
          dx: positions[player].x - svgPt.x,
          dy: positions[player].y - svgPt.y,
        };
      }
    },
    [positions, svgRef],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !svgRef.current) return;
      e.stopPropagation();
      e.preventDefault();
      const svgPt = svgPoint(svgRef.current, e.clientX, e.clientY);
      onPositionChange(dragging, {
        x: Math.round(Math.max(0, Math.min(400, svgPt.x + dragOffset.current.dx))),
        y: Math.round(Math.max(0, Math.min(500, svgPt.y + dragOffset.current.dy))),
      });
    },
    [dragging, onPositionChange, svgRef],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (dragging) {
        e.stopPropagation();
        (e.target as Element).releasePointerCapture(e.pointerId);
        setDragging(null);
      }
    },
    [dragging],
  );

  return (
    <g
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Pulse animation for needsManualInput */}
      {needsManualInput && (
        <defs>
          <style>{`
            @keyframes playerPulse {
              0%, 100% { r: ${RADIUS}; opacity: 1; }
              50% { r: ${RADIUS + 6}; opacity: 0.6; }
            }
          `}</style>
        </defs>
      )}

      {PLAYER_IDS.map((pid) => {
        const pos = positions[pid];
        const color = getTeamColor(pid, teams);
        const label = getPlayerLabel(pid, teams);
        const isDragging = dragging === pid;

        return (
          <g
            key={pid}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            onPointerDown={(e) => handlePointerDown(pid, e)}
          >
            {/* Shadow / glow when dragging */}
            {isDragging && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={RADIUS + 4}
                fill="none"
                stroke={color}
                strokeWidth={2}
                opacity={0.5}
              />
            )}

            {/* Pulse ring when manual input needed */}
            {needsManualInput && !isDragging && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={RADIUS}
                fill="none"
                stroke={color}
                strokeWidth={2}
                opacity={0.6}
                style={{ animation: 'playerPulse 1.5s ease-in-out infinite' }}
              />
            )}

            {/* Main circle */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={RADIUS}
              fill={color}
              stroke="white"
              strokeWidth={isDragging ? 3 : 2}
              opacity={isDragging ? 1 : 0.9}
            />

            {/* Player label */}
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize={11}
              fontWeight="bold"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {label}
            </text>
          </g>
        );
      })}
    </g>
  );
}
