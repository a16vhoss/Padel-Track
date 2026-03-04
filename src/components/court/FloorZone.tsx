'use client';

import { FloorZoneMetadata } from '@/types/zones';

interface FloorZoneProps {
  zone: FloorZoneMetadata;
  isSelected: boolean;
  heatValue?: number; // 0-1 for heatmap
  onClick: () => void;
}

export function FloorZone({ zone, isSelected, heatValue, onClick }: FloorZoneProps) {
  let fill = 'rgba(255, 255, 255, 0.03)';
  if (heatValue !== undefined && heatValue > 0) {
    const r = Math.round(255 * heatValue);
    const g = Math.round(100 * (1 - heatValue));
    fill = `rgba(${r}, ${g}, 50, ${0.2 + heatValue * 0.6})`;
  }
  if (isSelected) {
    fill = 'rgba(34, 197, 94, 0.4)';
  }

  return (
    <g className="court-zone" onClick={onClick}>
      <polygon
        points={zone.points}
        fill={fill}
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="1"
        className={isSelected ? 'selected' : ''}
      />
      <text
        x={zone.center.x}
        y={zone.center.y - 8}
        textAnchor="middle"
        fill="rgba(255, 255, 255, 0.7)"
        fontSize="14"
        fontWeight="bold"
        pointerEvents="none"
      >
        {zone.id}
      </text>
      <text
        x={zone.center.x}
        y={zone.center.y + 10}
        textAnchor="middle"
        fill="rgba(255, 255, 255, 0.4)"
        fontSize="8"
        pointerEvents="none"
      >
        {zone.shortName}
      </text>
    </g>
  );
}
