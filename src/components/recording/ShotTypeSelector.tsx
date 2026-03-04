'use client';

import { ShotType, ShotTypeInfo } from '@/types/shot';

const SHOT_TYPES: ShotTypeInfo[] = [
  { code: 'S', name: 'Saque', shortName: 'Saque', category: 'saque', color: '#f59e0b' },
  { code: 'Re', name: 'Resto', shortName: 'Resto', category: 'saque', color: '#f59e0b' },
  { code: 'V', name: 'Volea', shortName: 'Volea', category: 'red', color: '#22c55e' },
  { code: 'B', name: 'Bandeja', shortName: 'Band.', category: 'ataque', color: '#ef4444' },
  { code: 'Rm', name: 'Remate', shortName: 'Remate', category: 'ataque', color: '#ef4444' },
  { code: 'Vi', name: 'Vibora', shortName: 'Vibora', category: 'ataque', color: '#ef4444' },
  { code: 'G', name: 'Globo', shortName: 'Globo', category: 'defensa', color: '#3b82f6' },
  { code: 'D', name: 'Dejada', shortName: 'Dejada', category: 'red', color: '#22c55e' },
  { code: 'Ch', name: 'Chiquita', shortName: 'Chiq.', category: 'red', color: '#22c55e' },
  { code: 'Ps', name: 'Passing Shot', shortName: 'Pass.', category: 'ataque', color: '#ef4444' },
  { code: 'BP', name: 'Bajada Pared', shortName: 'Baj.P', category: 'pared', color: '#8b5cf6' },
  { code: 'CP', name: 'Contrapared', shortName: 'Contr.', category: 'pared', color: '#8b5cf6' },
  { code: 'x4', name: 'Por 4', shortName: 'x4', category: 'pared', color: '#8b5cf6' },
  { code: 'Bl', name: 'Bloqueo', shortName: 'Bloq.', category: 'defensa', color: '#3b82f6' },
];

interface ShotTypeSelectorProps {
  selected: ShotType | null;
  onSelect: (type: ShotType) => void;
}

export function ShotTypeSelector({ selected, onSelect }: ShotTypeSelectorProps) {
  return (
    <div>
      <label className="text-xs text-muted block mb-2">Tipo de Golpe</label>
      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
        {SHOT_TYPES.map((st) => {
          const isSelected = selected === st.code;
          return (
            <button
              key={st.code}
              onClick={() => onSelect(st.code)}
              className={`
                shot-btn flex flex-col items-center gap-0.5 p-2 rounded-md text-xs font-medium
                border transition-all
                ${isSelected
                  ? 'border-primary bg-primary/20 text-foreground ring-1 ring-primary'
                  : 'border-border hover:border-muted text-muted hover:text-foreground'
                }
              `}
            >
              <span className="font-mono text-sm font-bold" style={{ color: isSelected ? st.color : undefined }}>
                {st.code}
              </span>
              <span className="truncate w-full text-center">{st.shortName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { SHOT_TYPES };
