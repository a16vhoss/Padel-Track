'use client';

import { IntermediateZoneMetadata } from '@/types/zones';

interface IntermediateZoneProps {
  zone: IntermediateZoneMetadata;
  isSelected: boolean;
  onClick: () => void;
}

export function IntermediateZone({ zone, isSelected, onClick }: IntermediateZoneProps) {
  return (
    <line
      x1={zone.x1}
      y1={zone.y1}
      x2={zone.x2}
      y2={zone.y2}
      className={`intermediate-zone ${isSelected ? 'selected' : ''}`}
      stroke={isSelected ? 'rgba(245, 158, 11, 0.8)' : 'transparent'}
      strokeWidth="8"
      strokeLinecap="round"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    />
  );
}
