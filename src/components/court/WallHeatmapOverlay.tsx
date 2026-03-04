'use client';

import { WallHeatmapData } from '@/lib/stats/advancedStats';

interface WallHeatmapOverlayProps {
  data: WallHeatmapData;
}

// Wall zone SVG coordinates — matching CourtSVG WALL_SVG_ZONES
const WALL_SVG_ZONES: Array<{
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}> = [
  // Fondo baja (P1-P4)
  { id: 'P1', x: 0, y: 504, width: 100, height: 30 },
  { id: 'P2', x: 100, y: 504, width: 100, height: 30 },
  { id: 'P3', x: 200, y: 504, width: 100, height: 30 },
  { id: 'P4', x: 300, y: 504, width: 100, height: 30 },
  // Fondo alta (P5-P8)
  { id: 'P5', x: 0, y: 534, width: 100, height: 24 },
  { id: 'P6', x: 100, y: 534, width: 100, height: 24 },
  { id: 'P7', x: 200, y: 534, width: 100, height: 24 },
  { id: 'P8', x: 300, y: 534, width: 100, height: 24 },
  // Lateral izq baja (P9-P12)
  { id: 'P12', x: -34, y: 0, width: 30, height: 125 },
  { id: 'P11', x: -34, y: 125, width: 30, height: 125 },
  { id: 'P10', x: -34, y: 250, width: 30, height: 125 },
  { id: 'P9', x: -34, y: 375, width: 30, height: 125 },
  // Lateral izq alta (P13-P16)
  { id: 'P16', x: -58, y: 0, width: 24, height: 125 },
  { id: 'P15', x: -58, y: 125, width: 24, height: 125 },
  { id: 'P14', x: -58, y: 250, width: 24, height: 125 },
  { id: 'P13', x: -58, y: 375, width: 24, height: 125 },
  // Lateral der baja (P17-P20)
  { id: 'P20', x: 404, y: 0, width: 30, height: 125 },
  { id: 'P19', x: 404, y: 125, width: 30, height: 125 },
  { id: 'P18', x: 404, y: 250, width: 30, height: 125 },
  { id: 'P17', x: 404, y: 375, width: 30, height: 125 },
  // Lateral der alta (P21-P24)
  { id: 'P24', x: 434, y: 0, width: 24, height: 125 },
  { id: 'P23', x: 434, y: 125, width: 24, height: 125 },
  { id: 'P22', x: 434, y: 250, width: 24, height: 125 },
  { id: 'P21', x: 434, y: 375, width: 24, height: 125 },
];

function getHeatColor(intensity: number): string {
  // Cold (blue) to hot (red) gradient
  if (intensity === 0) return 'transparent';
  if (intensity < 0.25) return `rgba(59, 130, 246, ${0.2 + intensity * 1.2})`;
  if (intensity < 0.5) return `rgba(234, 179, 8, ${0.3 + intensity * 0.8})`;
  if (intensity < 0.75) return `rgba(249, 115, 22, ${0.4 + intensity * 0.6})`;
  return `rgba(239, 68, 68, ${0.5 + intensity * 0.5})`;
}

export function WallHeatmapOverlay({ data }: WallHeatmapOverlayProps) {
  if (data.max === 0) {
    return (
      <g>
        <text x="200" y="520" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10">
          Sin datos de pared
        </text>
      </g>
    );
  }

  return (
    <g>
      {WALL_SVG_ZONES.map((zone) => {
        const zoneData = data.zones[zone.id];
        if (!zoneData || zoneData.total === 0) return null;

        const intensity = zoneData.total / data.max;
        const color = getHeatColor(intensity);

        return (
          <g key={zone.id}>
            <rect
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              fill={color}
              rx="2"
            />
            <text
              x={zone.x + zone.width / 2}
              y={zone.y + zone.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="9"
              fontWeight="bold"
              opacity={0.9}
            >
              {zoneData.total}
            </text>
          </g>
        );
      })}
    </g>
  );
}
