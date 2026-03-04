'use client';

import { WallZoneId } from '@/types/zones';
import { WALL_ZONES } from '@/lib/zones/wall-zones';

interface WallPanelProps {
  selected: WallZoneId[];
  onToggle: (w: WallZoneId) => void;
}

export function WallPanel({ selected, onToggle }: WallPanelProps) {
  const walls = {
    'Fondo': WALL_ZONES.filter((w) => w.wall === 'fondo'),
    'Lat. Izq': WALL_ZONES.filter((w) => w.wall === 'lateral_izq'),
    'Lat. Der': WALL_ZONES.filter((w) => w.wall === 'lateral_der'),
  };

  return (
    <div className="space-y-2">
      <label className="text-xs text-muted block">Zonas de Pared</label>
      {Object.entries(walls).map(([label, zones]) => (
        <div key={label}>
          <span className="text-[10px] text-muted uppercase tracking-wider">{label}</span>
          <div className="grid grid-cols-4 gap-1 mt-0.5">
            {zones.map((wz) => {
              const isSelected = selected.includes(wz.id);
              return (
                <button
                  key={wz.id}
                  onClick={() => onToggle(wz.id)}
                  className={`
                    px-1 py-1 rounded text-[10px] font-mono border transition-colors
                    ${isSelected
                      ? 'border-accent bg-accent/20 text-accent font-bold'
                      : 'border-border text-muted hover:border-muted hover:text-foreground'
                    }
                  `}
                  title={wz.name}
                >
                  {wz.id}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
