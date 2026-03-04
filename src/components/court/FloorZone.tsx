'use client';

import { FloorZoneMetadata, ZoneCategory } from '@/types/zones';

interface FloorZoneProps {
  zone: FloorZoneMetadata;
  isSelected: boolean;
  heatValue?: number; // 0-1 for heatmap
  onClick: () => void;
  dimmed?: boolean;
}

const CATEGORY_FILLS: Record<ZoneCategory, string> = {
  red: 'rgba(220, 38, 38, 0.18)',
  media: 'rgba(5, 150, 105, 0.15)',
  fondo: 'rgba(37, 99, 235, 0.15)',
};

const CATEGORY_SELECTED: Record<ZoneCategory, string> = {
  red: 'rgba(220, 38, 38, 0.55)',
  media: 'rgba(5, 150, 105, 0.55)',
  fondo: 'rgba(37, 99, 235, 0.55)',
};

const CATEGORY_GLOW: Record<ZoneCategory, string> = {
  red: 'rgba(220, 38, 38, 0.7)',
  media: 'rgba(5, 150, 105, 0.7)',
  fondo: 'rgba(37, 99, 235, 0.7)',
};

export function FloorZone({ zone, isSelected, heatValue, onClick, dimmed }: FloorZoneProps) {
  let fill = CATEGORY_FILLS[zone.category];

  if (heatValue !== undefined && heatValue > 0) {
    const r = Math.round(255 * heatValue);
    const g = Math.round(100 * (1 - heatValue));
    fill = `rgba(${r}, ${g}, 50, ${0.2 + heatValue * 0.6})`;
  }

  if (isSelected) {
    fill = CATEGORY_SELECTED[zone.category];
  }

  const glowColor = CATEGORY_GLOW[zone.category];
  const filterId = `glow-zone-${zone.id}`;

  return (
    <g
      className={`court-zone ${isSelected ? 'court-zone-selected' : ''}`}
      onClick={dimmed ? undefined : onClick}
      style={{ cursor: dimmed ? 'default' : 'pointer', opacity: dimmed ? 0.25 : 1 }}
      pointerEvents={dimmed ? 'none' : undefined}
    >
      {/* Glow filter for selected state */}
      {isSelected && (
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={glowColor} />
          </filter>
        </defs>
      )}

      {/* Main zone polygon */}
      <polygon
        points={zone.points}
        fill={fill}
        stroke={isSelected ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.2)'}
        strokeWidth={isSelected ? 2.5 : 1}
        filter={isSelected ? `url(#${filterId})` : undefined}
      />

      {/* Inner highlight for selected */}
      {isSelected && (
        <polygon
          points={zone.points}
          fill="none"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="1"
          strokeDasharray="4,3"
          pointerEvents="none"
        />
      )}

      {/* Zone number */}
      <text
        x={zone.center.x}
        y={zone.center.y - 6}
        textAnchor="middle"
        fill={isSelected ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.85)'}
        fontSize={isSelected ? '24' : '22'}
        fontWeight="900"
        pointerEvents="none"
        style={{ textShadow: isSelected ? '0 0 8px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.5)' : '0 1px 3px rgba(0,0,0,0.5)' }}
      >
        {zone.id}
      </text>
      {/* Short name label */}
      <text
        x={zone.center.x}
        y={zone.center.y + 14}
        textAnchor="middle"
        fill={isSelected ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)'}
        fontSize="11"
        fontWeight="600"
        pointerEvents="none"
      >
        {zone.shortName}
      </text>
    </g>
  );
}
