'use client';

import { FLOOR_ZONES } from '@/lib/zones/zone-metadata';
import { ZoneTransition } from '@/lib/stats/advancedStats';
import { FloorZoneId } from '@/types/zones';

interface ZoneFlowOverlayProps {
  transitions: ZoneTransition[];
}

function getCenter(zoneId: FloorZoneId): { x: number; y: number } {
  const zone = FLOOR_ZONES.find((z) => z.id === zoneId);
  return zone?.center ?? { x: 200, y: 250 };
}

export function ZoneFlowOverlay({ transitions }: ZoneFlowOverlayProps) {
  if (transitions.length === 0) return null;

  const maxCount = Math.max(...transitions.map((t) => t.count));

  return (
    <g>
      {/* Arrow marker definition */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <polygon
            points="0 0, 8 3, 0 6"
            fill="rgba(250, 204, 21, 0.8)"
          />
        </marker>
      </defs>

      {transitions.map((t, i) => {
        const from = getCenter(t.from);
        const to = getCenter(t.to);

        // Offset for bezier curve
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Perpendicular offset for curve
        const nx = -dy / dist;
        const ny = dx / dist;
        const curveOffset = Math.min(dist * 0.25, 30);

        const cx = (from.x + to.x) / 2 + nx * curveOffset;
        const cy = (from.y + to.y) / 2 + ny * curveOffset;

        // Width proportional to frequency (2-6px)
        const width = 2 + (t.count / maxCount) * 4;
        const opacity = 0.4 + (t.count / maxCount) * 0.5;

        return (
          <g key={`${t.from}-${t.to}`}>
            <path
              d={`M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`}
              fill="none"
              stroke={`rgba(250, 204, 21, ${opacity})`}
              strokeWidth={width}
              markerEnd="url(#arrowhead)"
              pointerEvents="none"
            />
            {/* Count label at midpoint */}
            <text
              x={cx}
              y={cy - 6}
              textAnchor="middle"
              fill="rgba(250, 204, 21, 0.9)"
              fontSize="10"
              fontWeight="bold"
              pointerEvents="none"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
            >
              {t.count}
            </text>
          </g>
        );
      })}
    </g>
  );
}
