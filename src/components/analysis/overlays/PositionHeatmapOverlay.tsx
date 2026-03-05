'use client';

import { PositionHeatmapData, GRID_COLS, GRID_ROWS, CELL_W, CELL_H } from '@/lib/stats/positionStats';

interface PositionHeatmapOverlayProps {
  data: PositionHeatmapData;
}

function getColor(intensity: number): string {
  if (intensity <= 0) return 'transparent';

  // Cold (blue) → Warm (yellow) → Hot (red)
  if (intensity < 0.25) {
    return `rgba(59, 130, 246, ${0.1 + intensity * 1.6})`;
  } else if (intensity < 0.5) {
    return `rgba(234, 179, 8, ${0.2 + intensity * 0.8})`;
  } else if (intensity < 0.75) {
    return `rgba(249, 115, 22, ${0.3 + intensity * 0.6})`;
  } else {
    return `rgba(239, 68, 68, ${0.4 + intensity * 0.5})`;
  }
}

export function PositionHeatmapOverlay({ data }: PositionHeatmapOverlayProps) {
  if (data.max === 0 || data.totalSamples === 0) return null;

  return (
    <g>
      {data.grid.map((row, rowIdx) =>
        row.map((count, colIdx) => {
          if (count === 0) return null;
          const intensity = count / data.max;

          return (
            <rect
              key={`${rowIdx}-${colIdx}`}
              x={colIdx * CELL_W}
              y={rowIdx * CELL_H}
              width={CELL_W}
              height={CELL_H}
              fill={getColor(intensity)}
              rx={2}
            />
          );
        })
      )}
    </g>
  );
}
