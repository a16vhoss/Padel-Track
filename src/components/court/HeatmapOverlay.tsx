'use client';

import { FloorZoneId } from '@/types/zones';
import { FLOOR_ZONES } from '@/lib/zones/zone-metadata';

interface HeatmapOverlayProps {
  data: Record<number, number>; // zoneId -> count
}

export function HeatmapOverlay({ data }: HeatmapOverlayProps) {
  const max = Math.max(...Object.values(data), 1);

  return (
    <g>
      {FLOOR_ZONES.map((zone) => {
        const count = data[zone.id] || 0;
        const intensity = count / max;
        if (intensity === 0) return null;

        const r = Math.round(255 * intensity);
        const g = Math.round(100 * (1 - intensity));

        return (
          <g key={zone.id}>
            <polygon
              points={zone.points}
              fill={`rgba(${r}, ${g}, 50, ${0.15 + intensity * 0.5})`}
              pointerEvents="none"
            />
            <text
              x={zone.center.x}
              y={zone.center.y + 3}
              textAnchor="middle"
              fill="white"
              fontSize="12"
              fontWeight="bold"
              pointerEvents="none"
            >
              {count}
            </text>
          </g>
        );
      })}
    </g>
  );
}
