'use client';

import { ShotStatus } from '@/types/shot';

interface StatusSelectorProps {
  selected: ShotStatus;
  onSelect: (status: ShotStatus) => void;
}

const statuses: Array<{ value: ShotStatus; label: string; color: string; description: string }> = [
  { value: '', label: 'Continua', color: 'border-muted', description: 'El punto sigue' },
  { value: 'W', label: 'Winner', color: 'border-primary bg-primary/20 text-primary', description: 'Punto ganado' },
  { value: 'X', label: 'Error', color: 'border-danger bg-danger/20 text-danger', description: 'Fuera/red/error' },
  { value: 'N', label: 'No llega', color: 'border-accent bg-accent/20 text-accent', description: 'No alcanza la pelota' },
  { value: 'DF', label: 'Doble Falta', color: 'border-danger bg-danger/20 text-danger', description: 'Doble falta en saque' },
];

export function StatusSelector({ selected, onSelect }: StatusSelectorProps) {
  return (
    <div>
      <label className="text-xs text-muted block mb-2">Resultado del Golpe</label>
      <div className="grid grid-cols-5 gap-1.5">
        {statuses.map((s) => {
          const isSelected = selected === s.value;
          return (
            <button
              key={s.label}
              onClick={() => onSelect(s.value)}
              title={s.description}
              className={`
                flex flex-col items-center gap-0.5 p-2 rounded-md text-xs border transition-all
                ${isSelected
                  ? `${s.color} ring-1 ring-current font-bold`
                  : 'border-border text-muted hover:text-foreground hover:border-muted'
                }
              `}
            >
              <span className="font-mono text-sm font-bold">{s.value || '...'}</span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
