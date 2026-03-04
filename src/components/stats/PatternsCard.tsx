'use client';

import { PatternAnalysis, TacticalPattern } from '@/lib/stats/patterns';
import { Card } from '@/components/ui/Card';

interface PatternsCardProps {
  analysis: PatternAnalysis;
}

export function PatternsCard({ analysis }: PatternsCardProps) {
  if (analysis.twoShotCombos.length === 0 && analysis.threeShotCombos.length === 0) {
    return null;
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold mb-3">Patrones Tacticos</h3>

      {/* Top winning patterns */}
      {analysis.topWinningPatterns.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-green-400 mb-2">Patrones Ganadores</h4>
          <div className="space-y-1">
            {analysis.topWinningPatterns.slice(0, 5).map((p, i) => (
              <PatternRow key={i} pattern={p} type="win" />
            ))}
          </div>
        </div>
      )}

      {/* Top losing patterns */}
      {analysis.topLosingPatterns.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-red-400 mb-2">Patrones con Errores</h4>
          <div className="space-y-1">
            {analysis.topLosingPatterns.slice(0, 5).map((p, i) => (
              <PatternRow key={i} pattern={p} type="loss" />
            ))}
          </div>
        </div>
      )}

      {/* 2-shot combos */}
      {analysis.twoShotCombos.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted mb-2">Combinaciones de 2 Golpes</h4>
          <div className="space-y-1">
            {analysis.twoShotCombos.slice(0, 8).map((p, i) => (
              <PatternRow key={i} pattern={p} type="neutral" />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function PatternRow({ pattern, type }: { pattern: TacticalPattern; type: 'win' | 'loss' | 'neutral' }) {
  const barColor = type === 'win' ? 'bg-green-500/30' : type === 'loss' ? 'bg-red-500/30' : 'bg-blue-500/30';
  const textColor = type === 'win' ? 'text-green-400' : type === 'loss' ? 'text-red-400' : 'text-blue-400';

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="truncate font-mono text-[10px]">{pattern.description}</span>
          <span className="text-muted text-[10px]">x{pattern.count}</span>
        </div>
        <div className="w-full bg-border/30 rounded-full h-1.5 mt-0.5">
          <div
            className={`h-full rounded-full ${barColor}`}
            style={{ width: `${pattern.winRate}%` }}
          />
        </div>
      </div>
      <span className={`text-[10px] font-bold ${textColor} whitespace-nowrap`}>
        {pattern.winRate}% W
      </span>
    </div>
  );
}
