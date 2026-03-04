'use client';

import { FLOOR_ZONES } from '@/lib/zones/zone-metadata';
import { HeatmapData } from '@/lib/stats/advancedStats';

interface HeatmapOverlayV2Props {
  data: HeatmapData;
}

export function HeatmapOverlayV2({ data }: HeatmapOverlayV2Props) {
  if (data.max === 0) return null;

  return (
    <g>
      {FLOOR_ZONES.map((zone) => {
        const count = data.counts[zone.id] || 0;
        const intensity = count / data.max;
        if (intensity === 0) return null;

        const r = Math.round(255 * intensity);
        const g = Math.round(100 * (1 - intensity));

        return (
          <g key={zone.id}>
            <polygon
              points={zone.points}
              fill={`rgba(${r}, ${g}, 50, ${0.15 + intensity * 0.55})`}
              pointerEvents="none"
            />
            <text
              x={zone.center.x}
              y={zone.center.y + 4}
              textAnchor="middle"
              fill="white"
              fontSize="14"
              fontWeight="bold"
              pointerEvents="none"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}
            >
              {Math.round(count)}
            </text>
          </g>
        );
      })}
    </g>
  );
}
