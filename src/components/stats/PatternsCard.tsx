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
      <h3 className="text-sm font-semibold mb-4">Patrones Tacticos</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top winning patterns */}
        {analysis.topWinningPatterns.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-4 bg-green-500 rounded-full" />
              <h4 className="text-xs font-bold text-green-400">Patrones Ganadores</h4>
            </div>
            <div className="space-y-1.5">
              {analysis.topWinningPatterns.slice(0, 5).map((p, i) => (
                <PatternRow key={i} pattern={p} type="win" rank={i + 1} />
              ))}
            </div>
          </div>
        )}

        {/* Top losing patterns */}
        {analysis.topLosingPatterns.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-4 bg-red-500 rounded-full" />
              <h4 className="text-xs font-bold text-red-400">Patrones con Errores</h4>
            </div>
            <div className="space-y-1.5">
              {analysis.topLosingPatterns.slice(0, 5).map((p, i) => (
                <PatternRow key={i} pattern={p} type="loss" rank={i + 1} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* All combos */}
      {analysis.twoShotCombos.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/30">
          <h4 className="text-xs font-bold text-muted mb-2">Todas las Combinaciones</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {analysis.twoShotCombos.slice(0, 10).map((p, i) => (
              <PatternRow key={i} pattern={p} type="neutral" rank={i + 1} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function PatternRow({ pattern, type, rank }: { pattern: TacticalPattern; type: 'win' | 'loss' | 'neutral'; rank: number }) {
  const barColor = type === 'win' ? 'bg-green-500' : type === 'loss' ? 'bg-red-500' : 'bg-blue-500';
  const barBg = type === 'win' ? 'bg-green-500/10' : type === 'loss' ? 'bg-red-500/10' : 'bg-blue-500/10';
  const textColor = type === 'win' ? 'text-green-400' : type === 'loss' ? 'text-red-400' : 'text-blue-400';
  const borderColor = type === 'win' ? 'border-green-500/20' : type === 'loss' ? 'border-red-500/20' : 'border-border/30';

  // Parse pattern description into flow arrows
  const parts = pattern.description.split(' -> ');

  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg border ${borderColor} ${barBg} text-xs`}>
      {/* Rank */}
      <span className="text-xs text-muted-foreground/50 font-bold w-4 text-center">
        {rank}
      </span>

      {/* Pattern flow */}
      <div className="flex-1 min-w-0 flex items-center gap-1 flex-wrap">
        {parts.map((part, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="font-mono text-[11px] font-bold bg-background/50 px-1.5 py-0.5 rounded">{part.trim()}</span>
            {i < parts.length - 1 && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/40 flex-shrink-0">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </span>
        ))}
      </div>

      {/* Count */}
      <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
        x{pattern.count}
      </span>

      {/* Win rate with mini bar */}
      <div className="flex items-center gap-1.5 min-w-[60px]">
        <div className="flex-1 bg-border/20 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor} transition-all duration-500`}
            style={{ width: `${pattern.winRate}%` }}
          />
        </div>
        <span className={`text-[10px] font-black ${textColor} w-7 text-right`}>
          {pattern.winRate}%
        </span>
      </div>
    </div>
  );
}
