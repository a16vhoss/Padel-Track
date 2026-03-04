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
  interactive?: boolean;
  children?: React.ReactNode;
}

export function CourtSVG({
  selectedDestination,
  onSelectZone,
  heatmapData,
  showLabels = true,
  interactive = true,
  children,
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
        className="w-full h-auto rounded-lg overflow-hidden"
        style={{ background: '#0f2e1a' }}
      >
        {/* Court base */}
        <rect x="0" y="0" width="400" height="500" fill="#163824" rx="8" />

        {/* Row background tints */}
        {/* RED row (attack) - top: y=0 to y=140 */}
        <rect x="0" y="0" width="400" height="140" fill="rgba(220, 38, 38, 0.06)" />
        {/* MEDIA row (transition) - middle: y=140 to y=315 */}
        <rect x="0" y="140" width="400" height="175" fill="rgba(5, 150, 105, 0.04)" />
        {/* FONDO row (defense) - bottom: y=315 to y=500 */}
        <rect x="0" y="315" width="400" height="185" fill="rgba(37, 99, 235, 0.06)" />

        {/* Net line - prominent */}
        <line x1="0" y1="140" x2="400" y2="140" stroke="white" strokeWidth="3" opacity="0.5" />
        <text x="200" y="136" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9" fontWeight="bold" letterSpacing="2">
          RED
        </text>

        {/* Grid lines - columns */}
        <line x1="80" y1="0" x2="80" y2="500" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <line x1="140" y1="0" x2="140" y2="500" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <line x1="200" y1="0" x2="200" y2="500" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4,4" />
        <line x1="260" y1="0" x2="260" y2="500" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <line x1="320" y1="0" x2="320" y2="500" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

        {/* Grid lines - rows */}
        <line x1="0" y1="315" x2="400" y2="315" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

        {/* Floor zones */}
        {FLOOR_ZONES.map((zone) => (
          <FloorZone
            key={zone.id}
            zone={zone}
            isSelected={isZoneSelected(zone.id)}
            heatValue={heatmapData ? (heatmapData[zone.id] || 0) / Math.max(...Object.values(heatmapData), 1) : undefined}
            onClick={interactive ? () =>
              onSelectZone({ type: 'single', zone: zone.id })
            : () => {}}
          />
        ))}

        {/* Intermediate zone lines (clickeable areas between zones) */}
        {INTERMEDIATE_ZONE_LINES.map((iz) => (
          <IntermediateZone
            key={iz.label}
            zone={iz}
            isSelected={isIntermediateSelected(iz.zones[0], iz.zones[1])}
            onClick={interactive ? () =>
              onSelectZone({
                type: 'intermediate',
                primary: iz.zones[0],
                secondary: iz.zones[1],
              })
            : () => {}}
          />
        ))}

        {/* Row labels - large background text */}
        {showLabels && (
          <>
            <text x="200" y="78" textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize="36" fontWeight="900" pointerEvents="none" letterSpacing="6">
              RED
            </text>
            <text x="200" y="238" textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize="36" fontWeight="900" pointerEvents="none" letterSpacing="6">
              MEDIA
            </text>
            <text x="200" y="418" textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize="36" fontWeight="900" pointerEvents="none" letterSpacing="6">
              FONDO
            </text>
          </>
        )}

        {/* Hint when no zone selected */}
        {interactive && !selectedDestination && (
          <text x="200" y="488" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="12" pointerEvents="none">
            Toca una zona donde cayo la pelota
          </text>
        )}

        {/* Analysis overlay children */}
        {children}
      </svg>

      {/* Selected zone info badge */}
      {selectedDestination && (
        <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-sm rounded-md px-3 py-1.5 text-xs text-center font-medium">
          {selectedDestination.type === 'single'
            ? `Zona ${selectedDestination.zone}`
            : `Zona intermedia ${selectedDestination.primary},${selectedDestination.secondary}`
          }
        </div>
      )}

      {/* Legend */}
      {showLabels && (
        <div className="flex justify-center gap-4 mt-2 text-[10px] text-muted">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-red-600/60" />
            Ataque
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-emerald-600/60" />
            Transicion
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-blue-600/60" />
            Defensa
          </span>
        </div>
      )}
    </div>
  );
}
