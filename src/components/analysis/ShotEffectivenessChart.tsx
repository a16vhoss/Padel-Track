'use client';

import { ShotEffectivenessEntry } from '@/lib/stats/advancedStats';
import { SHOT_TYPES } from '@/components/recording/ShotTypeSelector';

interface ShotEffectivenessChartProps {
  data: ShotEffectivenessEntry[];
}

function getShotName(code: string): string {
  return SHOT_TYPES.find((s) => s.code === code)?.shortName ?? code;
}

export function ShotEffectivenessChart({ data }: ShotEffectivenessChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted text-sm">No hay datos de efectividad</div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Efectividad por Golpe</h3>
      <div className="space-y-2">
        {data.map((entry) => (
          <div key={entry.type} className="flex items-center gap-2">
            {/* Shot name */}
            <div className="w-14 text-xs text-muted font-medium text-right shrink-0">
              {getShotName(entry.type)}
            </div>

            {/* Stacked bar */}
            <div className="flex-1 h-6 bg-border/30 rounded overflow-hidden flex">
              {entry.winnerPct > 0 && (
                <div
                  className="h-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{
                    width: `${entry.winnerPct}%`,
                    backgroundColor: '#22c55e',
                    minWidth: entry.winnerPct > 5 ? undefined : '14px',
                  }}
                >
                  {entry.winnerPct > 8 ? `${entry.winnerPct}%` : ''}
                </div>
              )}
              {entry.neutralPct > 0 && (
                <div
                  className="h-full flex items-center justify-center text-[10px] font-bold text-white/70"
                  style={{
                    width: `${entry.neutralPct}%`,
                    backgroundColor: '#64748b',
                  }}
                >
                  {entry.neutralPct > 12 ? `${entry.neutralPct}%` : ''}
                </div>
              )}
              {entry.errorPct > 0 && (
                <div
                  className="h-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{
                    width: `${entry.errorPct}%`,
                    backgroundColor: '#ef4444',
                    minWidth: entry.errorPct > 5 ? undefined : '14px',
                  }}
                >
                  {entry.errorPct > 8 ? `${entry.errorPct}%` : ''}
                </div>
              )}
            </div>

            {/* Total count */}
            <div className="w-8 text-xs text-muted text-right shrink-0">
              {entry.total}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-3 text-[10px] text-muted">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#22c55e' }} />
          Winners
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#64748b' }} />
          Neutral
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#ef4444' }} />
          Errores
        </span>
      </div>
    </div>
  );
}
