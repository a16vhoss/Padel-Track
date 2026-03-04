'use client';

import { FloorZoneMetadata, ZoneCategory } from '@/types/zones';

interface FloorZoneProps {
  zone: FloorZoneMetadata;
  isSelected: boolean;
  heatValue?: number; // 0-1 for heatmap
  onClick: () => void;
}

const CATEGORY_FILLS: Record<ZoneCategory, string> = {
  red: 'rgba(220, 38, 38, 0.18)',      // Red tint for attack zone
  media: 'rgba(5, 150, 105, 0.15)',     // Green tint for transition
  fondo: 'rgba(37, 99, 235, 0.15)',     // Blue tint for defense
};

const CATEGORY_SELECTED: Record<ZoneCategory, string> = {
  red: 'rgba(220, 38, 38, 0.45)',
  media: 'rgba(5, 150, 105, 0.45)',
  fondo: 'rgba(37, 99, 235, 0.45)',
};

export function FloorZone({ zone, isSelected, heatValue, onClick }: FloorZoneProps) {
  let fill = CATEGORY_FILLS[zone.category];

  if (heatValue !== undefined && heatValue > 0) {
    const r = Math.round(255 * heatValue);
    const g = Math.round(100 * (1 - heatValue));
    fill = `rgba(${r}, ${g}, 50, ${0.2 + heatValue * 0.6})`;
  }

  if (isSelected) {
    fill = CATEGORY_SELECTED[zone.category];
  }

  return (
    <g className="court-zone" onClick={onClick} style={{ cursor: 'pointer' }}>
      <polygon
        points={zone.points}
        fill={fill}
        stroke="rgba(255, 255, 255, 0.25)"
        strokeWidth="1.5"
      />
      {/* Zone number - large and prominent */}
      <text
        x={zone.center.x}
        y={zone.center.y - 6}
        textAnchor="middle"
        fill={isSelected ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.85)'}
        fontSize="22"
        fontWeight="900"
        pointerEvents="none"
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
      >
        {zone.id}
      </text>
      {/* Short name label */}
      <text
        x={zone.center.x}
        y={zone.center.y + 14}
        textAnchor="middle"
        fill={isSelected ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)'}
        fontSize="11"
        fontWeight="600"
        pointerEvents="none"
      >
        {zone.shortName}
      </text>
    </g>
  );
}
