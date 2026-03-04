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

      {/* Summary */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-primary">{stats.averageRallyLength}</div>
          <div className="text-[10px] text-muted">Promedio</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-secondary">{stats.medianRallyLength}</div>
          <div className="text-[10px] text-muted">Mediana</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-amber-400">{stats.maxRallyLength}</div>
          <div className="text-[10px] text-muted">Mas largo</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-muted">{stats.minRallyLength}</div>
          <div className="text-[10px] text-muted">Mas corto</div>
        </div>
      </div>

      {/* Bucket distribution */}
      <div className="space-y-2 mb-4">
        {stats.buckets.map((bucket) => (
          <div key={bucket.label} className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-muted">{bucket.label}</span>
              <span className="font-medium">{bucket.count} puntos</span>
            </div>
            <div className="flex gap-0.5 h-3">
              <div
                className="bg-green-500/50 rounded-l"
                style={{ width: `${bucket.count > 0 ? (bucket.team1Wins / bucket.count) * 100 : 0}%` }}
                title={`${team1Name}: ${bucket.team1Wins}`}
              />
              <div
                className="bg-blue-500/50 rounded-r"
                style={{ width: `${bucket.count > 0 ? (bucket.team2Wins / bucket.count) * 100 : 0}%` }}
                title={`${team2Name}: ${bucket.team2Wins}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-3 text-[10px] text-muted">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-green-500/50" />
          {team1Name}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-blue-500/50" />
          {team2Name}
        </span>
      </div>

      {/* Per-set breakdown */}
      {stats.distributionBySet.length > 1 && (
        <div className="mt-3 pt-3 border-t border-border/30">
          <div className="text-[10px] text-muted mb-1">Promedio por set</div>
          <div className="flex gap-3">
            {stats.distributionBySet.map((s) => (
              <span key={s.set} className="text-xs">
                Set {s.set}: <strong>{s.average}</strong> <span className="text-muted">({s.total} pts)</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
