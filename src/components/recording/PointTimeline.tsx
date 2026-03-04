'use client';

import { Shot } from '@/types/shot';
import { Badge } from '@/components/ui/Badge';

interface PointTimelineProps {
  shots: Shot[];
  onRemoveLast: () => void;
}

export function PointTimeline({ shots, onRemoveLast }: PointTimelineProps) {
  if (shots.length === 0) {
    return (
      <div className="text-center py-3 text-xs text-muted border border-dashed border-border rounded-lg">
        Registra el primer golpe del punto
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-muted">Secuencia del Punto ({shots.length} golpes)</label>
        <button
          onClick={onRemoveLast}
          className="text-xs text-danger hover:text-red-400 transition-colors"
        >
          Deshacer ultimo
        </button>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {shots.map((shot, i) => {
          const isTeam1 = shot.player === 'J1' || shot.player === 'J2';
          const statusVariant = shot.status === 'W' ? 'primary'
            : shot.status === 'X' || shot.status === 'DF' ? 'danger'
            : shot.status === 'N' ? 'accent'
            : 'default';

          return (
            <div
              key={shot.id}
              className={`
                flex-shrink-0 flex flex-col items-center gap-0.5 p-1.5 rounded border text-xs
                ${isTeam1 ? 'border-team1/30 bg-team1/5' : 'border-secondary/30 bg-secondary/5'}
              `}
            >
              <span className="font-mono font-bold text-[10px]">{shot.player}</span>
              <span className="font-mono">{shot.notation || shot.type}</span>
              {shot.status && <Badge variant={statusVariant}>{shot.status}</Badge>}
              {i < shots.length - 1 && (
                <span className="absolute -right-2 text-muted">|</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-1 text-xs text-muted font-mono">
        {shots.map((s) => s.notation).join(' | ')}
      </div>
    </div>
  );
}
