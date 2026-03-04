'use client';

import { RallyStats } from '@/lib/stats/rallyStats';
import { Card } from '@/components/ui/Card';

interface RallyStatsCardProps {
  stats: RallyStats;
  team1Name: string;
  team2Name: string;
}

export function RallyStatsCard({ stats, team1Name, team2Name }: RallyStatsCardProps) {
  if (stats.buckets.length === 0) {
    return null;
  }

  const maxCount = Math.max(...stats.buckets.map((b) => b.count), 1);

  return (
    <Card>
      <h3 className="text-sm font-semibold mb-3">Analisis de Rally</h3>

      {/* Summary stats with visual emphasis */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center bg-primary/5 rounded-lg p-2 border border-primary/10">
          <div className="text-xl font-black text-primary">{stats.averageRallyLength}</div>
          <div className="text-[9px] text-muted font-medium uppercase tracking-wide">Promedio</div>
        </div>
        <div className="text-center bg-secondary/5 rounded-lg p-2 border border-secondary/10">
          <div className="text-xl font-black text-secondary">{stats.medianRallyLength}</div>
          <div className="text-[9px] text-muted font-medium uppercase tracking-wide">Mediana</div>
        </div>
        <div className="text-center bg-amber-500/5 rounded-lg p-2 border border-amber-500/10">
          <div className="text-xl font-black text-amber-400">{stats.maxRallyLength}</div>
          <div className="text-[9px] text-muted font-medium uppercase tracking-wide">Max</div>
        </div>
        <div className="text-center bg-background/50 rounded-lg p-2 border border-border/30">
          <div className="text-xl font-black text-muted">{stats.minRallyLength}</div>
          <div className="text-[9px] text-muted font-medium uppercase tracking-wide">Min</div>
        </div>
      </div>

      {/* Histogram-style distribution */}
      <div className="mb-4">
        <div className="text-[10px] text-muted mb-2 font-medium">Distribucion por duracion</div>
        <div className="flex items-end gap-1" style={{ height: '80px' }}>
          {stats.buckets.map((bucket) => {
            const heightPct = (bucket.count / maxCount) * 100;
            const team1Pct = bucket.count > 0 ? (bucket.team1Wins / bucket.count) * 100 : 50;

            return (
              <div key={bucket.label} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end group">
                {/* Count label on hover */}
                <span className="text-[8px] font-bold text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                  {bucket.count}
                </span>

                {/* Stacked bar */}
                <div
                  className="w-full rounded-t-sm overflow-hidden flex flex-col transition-all duration-300"
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                >
                  <div
                    className="bg-gradient-to-t from-green-600 to-green-400"
                    style={{ height: `${team1Pct}%` }}
                  />
                  <div
                    className="bg-gradient-to-t from-blue-600 to-blue-400 flex-1"
                  />
                </div>

                {/* Label */}
                <span className="text-[8px] text-muted mt-0.5 leading-tight text-center">
                  {bucket.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Who wins at each rally length */}
      <div className="space-y-1.5 mb-3">
        {stats.buckets.map((bucket) => {
          if (bucket.count === 0) return null;
          const team1Pct = Math.round((bucket.team1Wins / bucket.count) * 100);
          const team2Pct = 100 - team1Pct;
          const dominant = team1Pct > team2Pct ? 'team1' : team1Pct < team2Pct ? 'team2' : 'tie';

          return (
            <div key={`detail-${bucket.label}`} className="flex items-center gap-2 text-[10px]">
              <span className="w-16 text-muted font-medium truncate">{bucket.label}</span>
              <div className="flex-1 flex h-2 bg-border/20 rounded-full overflow-hidden">
                <div
                  className="bg-green-500/70 transition-all duration-500"
                  style={{ width: `${team1Pct}%` }}
                />
                <div
                  className="bg-blue-500/70 transition-all duration-500"
                  style={{ width: `${team2Pct}%` }}
                />
              </div>
              <span className={`w-8 text-right font-bold ${
                dominant === 'team1' ? 'text-green-400' : dominant === 'team2' ? 'text-blue-400' : 'text-muted'
              }`}>
                {dominant === 'team1' ? `${team1Pct}%` : dominant === 'team2' ? `${team2Pct}%` : '50%'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-3 text-[10px] text-muted">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-green-600 to-green-400" />
          {team1Name}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-blue-600 to-blue-400" />
          {team2Name}
        </span>
      </div>

      {/* Per-set breakdown */}
      {stats.distributionBySet.length > 1 && (
        <div className="mt-3 pt-3 border-t border-border/30">
          <div className="text-[10px] text-muted mb-1.5 font-medium">Promedio por set</div>
          <div className="flex gap-3">
            {stats.distributionBySet.map((s) => (
              <div key={s.set} className="text-center bg-background/50 rounded px-3 py-1.5 border border-border/30">
                <div className="text-[9px] text-muted">Set {s.set}</div>
                <div className="text-sm font-black">{s.average}</div>
                <div className="text-[8px] text-muted">{s.total} pts</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
