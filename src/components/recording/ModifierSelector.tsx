'use client';

import { ShotDirection, ShotPower, ShotSpin } from '@/types/shot';
import { WallZoneId } from '@/types/zones';

interface ModifierSelectorProps {
  direction: ShotDirection | undefined;
  power: ShotPower;
  spin: ShotSpin;
  wallBounces: WallZoneId[];
  onDirectionChange: (d: ShotDirection | undefined) => void;
  onPowerChange: (p: ShotPower) => void;
  onSpinChange: (s: ShotSpin) => void;
  onWallToggle: (w: WallZoneId) => void;
}

export function ModifierSelector({
  direction,
  power,
  spin,
  onDirectionChange,
  onPowerChange,
  onSpinChange,
}: ModifierSelectorProps) {
  const directions: Array<{ value: ShotDirection | undefined; label: string }> = [
    { value: undefined, label: 'Sin dir.' },
    { value: 'cr', label: 'Cruzado' },
    { value: 'pa', label: 'Paralelo' },
    { value: 'ce', label: 'Centro' },
  ];

  const powers: Array<{ value: ShotPower; label: string; symbol: string }> = [
    { value: '-', label: 'Suave', symbol: '-' },
    { value: '', label: 'Normal', symbol: '=' },
    { value: '+', label: 'Fuerte', symbol: '+' },
    { value: '++', label: 'Muy fuerte', symbol: '++' },
  ];

  const spins: Array<{ value: ShotSpin; label: string; symbol: string }> = [
    { value: '', label: 'Plano', symbol: '—' },
    { value: '^', label: 'Liftado', symbol: '^' },
    { value: '~', label: 'Cortado', symbol: '~' },
  ];

  return (
    <div className="space-y-3">
      {/* Direction */}
      <div>
        <label className="text-xs text-muted block mb-1">Direccion</label>
        <div className="flex gap-1">
          {directions.map((d) => (
            <button
              key={d.label}
              onClick={() => onDirectionChange(d.value)}
              className={`
                flex-1 px-2 py-1.5 rounded text-xs font-medium border transition-colors
                ${direction === d.value
                  ? 'border-primary bg-primary/20 text-foreground'
                  : 'border-border text-muted hover:text-foreground hover:border-muted'
                }
              `}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Power */}
      <div>
        <label className="text-xs text-muted block mb-1">Potencia</label>
        <div className="flex gap-1">
          {powers.map((p) => (
            <button
              key={p.label}
              onClick={() => onPowerChange(p.value)}
              className={`
                flex-1 px-2 py-1.5 rounded text-xs font-medium border transition-colors
                ${power === p.value
                  ? 'border-accent bg-accent/20 text-foreground'
                  : 'border-border text-muted hover:text-foreground hover:border-muted'
                }
              `}
            >
              <span className="font-mono mr-1">{p.symbol}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Spin */}
      <div>
        <label className="text-xs text-muted block mb-1">Efecto</label>
        <div className="flex gap-1">
          {spins.map((s) => (
            <button
              key={s.label}
              onClick={() => onSpinChange(s.value)}
              className={`
                flex-1 px-2 py-1.5 rounded text-xs font-medium border transition-colors
                ${spin === s.value
                  ? 'border-secondary bg-secondary/20 text-foreground'
                  : 'border-border text-muted hover:text-foreground hover:border-muted'
                }
              `}
            >
              <span className="font-mono mr-1">{s.symbol}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
