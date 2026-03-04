'use client';

import { FLOOR_ZONES } from '@/lib/zones/zone-metadata';
import { WinnersErrorsData } from '@/lib/stats/advancedStats';

interface WinnersErrorsOverlayProps {
  data: WinnersErrorsData;
}

export function WinnersErrorsOverlay({ data }: WinnersErrorsOverlayProps) {
  const hasData = Object.keys(data.winners).length > 0 || Object.keys(data.errors).length > 0;
  if (!hasData) return null;

  return (
    <g>
      {FLOOR_ZONES.map((zone) => {
        const w = data.winners[zone.id] || 0;
        const e = data.errors[zone.id] || 0;
        if (w === 0 && e === 0) return null;

        const total = w + e;
        const winRatio = total > 0 ? w / total : 0;

        // Green tint for winner-heavy, red for error-heavy
        const fill = winRatio >= 0.5
          ? `rgba(34, 197, 94, ${0.15 + winRatio * 0.4})`
          : `rgba(239, 68, 68, ${0.15 + (1 - winRatio) * 0.4})`;

        return (
          <g key={zone.id}>
            <polygon
              points={zone.points}
              fill={fill}
              pointerEvents="none"
            />
            {/* Winners count */}
            {w > 0 && (
              <text
                x={zone.center.x - 18}
                y={zone.center.y + 2}
                textAnchor="middle"
                fill="#22c55e"
                fontSize="13"
                fontWeight="bold"
                pointerEvents="none"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
              >
                W:{w}
              </text>
            )}
            {/* Errors count */}
            {e > 0 && (
              <text
                x={zone.center.x + 18}
                y={zone.center.y + 2}
                textAnchor="middle"
                fill="#ef4444"
                fontSize="13"
                fontWeight="bold"
                pointerEvents="none"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
              >
                X:{e}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
