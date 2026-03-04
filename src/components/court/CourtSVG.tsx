'use client';

import { FloorZoneId, ZoneDestination } from '@/types/zones';
import { FLOOR_ZONES, INTERMEDIATE_ZONE_LINES } from '@/lib/zones/zone-metadata';
import { FloorZone } from './FloorZone';
import { IntermediateZone } from './IntermediateZone';

interface CourtSVGProps {
  selectedDestination: ZoneDestination | null;
  onSelectZone: (dest: ZoneDestination) => void;
  heatmapData?: Record<number, number>;
  showLabels?: boolean;
}

export function CourtSVG({
  selectedDestination,
  onSelectZone,
  heatmapData,
  showLabels = true,
}: CourtSVGProps) {
  const isZoneSelected = (id: FloorZoneId) => {
    if (!selectedDestination) return false;
    if (selectedDestination.type === 'single') return selectedDestination.zone === id;
    return selectedDestination.primary === id || selectedDestination.secondary === id;
  };

  const isIntermediateSelected = (z1: FloorZoneId, z2: FloorZoneId) => {
    if (!selectedDestination || selectedDestination.type !== 'intermediate') return false;
    return (
      (selectedDestination.primary === z1 && selectedDestination.secondary === z2) ||
      (selectedDestination.primary === z2 && selectedDestination.secondary === z1)
    );
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <svg
        viewBox="0 0 400 500"
        className="w-full h-auto border border-border rounded-lg overflow-hidden"
        style={{ background: '#1a5c2e' }}
      >
        {/* Court background */}
        <rect x="0" y="0" width="400" height="500" fill="#1a5c2e" />

        {/* Net line */}
        <line x1="0" y1="140" x2="400" y2="140" stroke="white" strokeWidth="3" opacity="0.4" />

        {/* Center service line */}
        <line x1="200" y1="0" x2="200" y2="500" stroke="white" strokeWidth="1" opacity="0.15" />

        {/* Row dividers */}
        <line x1="0" y1="315" x2="400" y2="315" stroke="white" strokeWidth="1" opacity="0.15" />

        {/* Floor zones */}
        {FLOOR_ZONES.map((zone) => (
          <FloorZone
            key={zone.id}
            zone={zone}
            isSelected={isZoneSelected(zone.id)}
            heatValue={heatmapData ? (heatmapData[zone.id] || 0) / Math.max(...Object.values(heatmapData), 1) : undefined}
            onClick={() =>
              onSelectZone({ type: 'single', zone: zone.id })
            }
          />
        ))}

        {/* Intermediate zone lines (clickeable areas between zones) */}
        {INTERMEDIATE_ZONE_LINES.map((iz) => (
          <IntermediateZone
            key={iz.label}
            zone={iz}
            isSelected={isIntermediateSelected(iz.zones[0], iz.zones[1])}
            onClick={() =>
              onSelectZone({
                type: 'intermediate',
                primary: iz.zones[0],
                secondary: iz.zones[1],
              })
            }
          />
        ))}

        {/* Labels */}
        {showLabels && (
          <>
            <text x="200" y="70" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="16" fontWeight="bold">
              RED
            </text>
            <text x="200" y="230" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="16" fontWeight="bold">
              MEDIA
            </text>
            <text x="200" y="410" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="16" fontWeight="bold">
              FONDO
            </text>
          </>
        )}
      </svg>

      {/* Selected zone info */}
      {selectedDestination && (
        <div className="absolute bottom-2 left-2 right-2 bg-black/70 rounded px-2 py-1 text-xs text-center">
          {selectedDestination.type === 'single'
            ? `Zona ${selectedDestination.zone}`
            : `Zona intermedia ${selectedDestination.primary},${selectedDestination.secondary}`
          }
        </div>
      )}
    </div>
  );
}
