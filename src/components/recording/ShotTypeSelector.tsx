'use client';

import { ShotType, ShotTypeInfo } from '@/types/shot';

interface ShotTypeInfoExtended extends ShotTypeInfo {
  description: string;
}

const SHOT_TYPES: ShotTypeInfoExtended[] = [
  { code: 'S', name: 'Saque', shortName: 'Saque', category: 'saque', color: '#f59e0b', description: 'Golpe de inicio del punto' },
  { code: 'Re', name: 'Resto', shortName: 'Resto', category: 'saque', color: '#f59e0b', description: 'Devolucion del saque' },
  { code: 'V', name: 'Volea', shortName: 'Volea', category: 'red', color: '#22c55e', description: 'Golpe en el aire cerca de la red' },
  { code: 'D', name: 'Dejada', shortName: 'Dejada', category: 'red', color: '#22c55e', description: 'Golpe suave que cae cerca de la red' },
  { code: 'Ch', name: 'Chiquita', shortName: 'Chiquita', category: 'red', color: '#22c55e', description: 'Golpe bajo a los pies del rival en la red' },
  { code: 'B', name: 'Bandeja', shortName: 'Bandeja', category: 'ataque', color: '#ef4444', description: 'Golpe aereo de ataque con control' },
  { code: 'Rm', name: 'Remate', shortName: 'Remate', category: 'ataque', color: '#ef4444', description: 'Golpe aereo potente definitivo' },
  { code: 'Vi', name: 'Vibora', shortName: 'Vibora', category: 'ataque', color: '#ef4444', description: 'Golpe aereo lateral con efecto cortado' },
  { code: 'Ps', name: 'Passing Shot', shortName: 'Passing', category: 'ataque', color: '#ef4444', description: 'Golpe que pasa al rival en la red' },
  { code: 'BP', name: 'Bajada de Pared', shortName: 'Bajada', category: 'pared', color: '#8b5cf6', description: 'Golpe despues de que la bola baja de la pared' },
  { code: 'CP', name: 'Contrapared', shortName: 'Contrap.', category: 'pared', color: '#8b5cf6', description: 'Golpe hacia la pared propia para devolver' },
  { code: 'x4', name: 'Por 4', shortName: 'x4', category: 'pared', color: '#8b5cf6', description: 'Rebote que toca pared lateral y fondo' },
  { code: 'G', name: 'Globo', shortName: 'Globo', category: 'defensa', color: '#3b82f6', description: 'Golpe alto para pasar al rival por arriba' },
  { code: 'Bl', name: 'Bloqueo', shortName: 'Bloqueo', category: 'defensa', color: '#3b82f6', description: 'Golpe defensivo que frena el ataque rival' },
];

const CATEGORIES: Array<{
  key: string;
  label: string;
  bgClass: string;
  types: ShotTypeInfoExtended[];
}> = [
  {
    key: 'saque',
    label: 'Saque',
    bgClass: 'bg-amber-500/10 border-amber-500/20',
    types: SHOT_TYPES.filter((s) => s.category === 'saque'),
  },
  {
    key: 'red',
    label: 'Red',
    bgClass: 'bg-green-500/10 border-green-500/20',
    types: SHOT_TYPES.filter((s) => s.category === 'red'),
  },
  {
    key: 'ataque',
    label: 'Ataque',
    bgClass: 'bg-red-500/10 border-red-500/20',
    types: SHOT_TYPES.filter((s) => s.category === 'ataque'),
  },
  {
    key: 'pared',
    label: 'Pared',
    bgClass: 'bg-purple-500/10 border-purple-500/20',
    types: SHOT_TYPES.filter((s) => s.category === 'pared'),
  },
  {
    key: 'defensa',
    label: 'Defensa',
    bgClass: 'bg-blue-500/10 border-blue-500/20',
    types: SHOT_TYPES.filter((s) => s.category === 'defensa'),
  },
];

interface ShotTypeSelectorProps {
  selected: ShotType | null;
  onSelect: (type: ShotType) => void;
}

export function ShotTypeSelector({ selected, onSelect }: ShotTypeSelectorProps) {
  return (
    <div>
      <label className="text-xs text-muted block mb-2">Tipo de Golpe</label>
      <div className="space-y-2">
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className={`rounded-lg border p-1.5 ${cat.bgClass}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1 px-1">
              {cat.label}
            </div>
            <div className="flex flex-wrap gap-1">
              {cat.types.map((st) => {
                const isSelected = selected === st.code;
                return (
                  <button
                    key={st.code}
                    onClick={() => onSelect(st.code)}
                    title={`${st.name}: ${st.description}`}
                    className={`
                      shot-btn flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md text-xs font-medium
                      border transition-all
                      ${isSelected
                        ? 'border-primary bg-primary/20 text-foreground ring-1 ring-primary'
                        : 'border-border bg-card/50 hover:border-muted text-muted hover:text-foreground'
                      }
                    `}
                  >
                    <span className="font-mono text-sm font-bold" style={{ color: isSelected ? st.color : undefined }}>
                      {st.code}
                    </span>
                    <span className="truncate text-center text-[10px]">{st.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { SHOT_TYPES };
