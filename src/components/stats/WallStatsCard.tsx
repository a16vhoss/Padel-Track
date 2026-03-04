'use client';

import { WallUsageStats } from '@/lib/stats/wallStats';
import { Card } from '@/components/ui/Card';

interface WallStatsCardProps {
  stats: WallUsageStats;
}

export function WallStatsCard({ stats }: WallStatsCardProps) {
  if (stats.totalWallShots === 0) {
    return (
      <Card>
        <h3 className="text-sm font-semibold mb-2">Estadisticas de Pared</h3>
        <p className="text-xs text-muted">No hay golpes de pared registrados</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold mb-3">Estadisticas de Pared</h3>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-xl font-bold text-purple-400">{stats.totalWallShots}</div>
          <div className="text-[10px] text-muted">Total golpes</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-green-400">{stats.wallWinRate}%</div>
          <div className="text-[10px] text-muted">Win rate</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-amber-400">{stats.wallWins}/{stats.wallWins + stats.wallLosses}</div>
          <div className="text-[10px] text-muted">Ganados</div>
        </div>
      </div>

      {/* Wall vs No Wall comparison */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-purple-500/10 rounded-md p-2 border border-purple-500/20">
          <div className="text-[10px] text-muted">Con Pared</div>
          <div className="text-sm font-bold text-purple-400">{stats.wallVsNoWall.withWall.winPct}%</div>
          <div className="text-[10px] text-muted">{stats.wallVsNoWall.withWall.wins}/{stats.wallVsNoWall.withWall.total}</div>
        </div>
        <div className="bg-blue-500/10 rounded-md p-2 border border-blue-500/20">
          <div className="text-[10px] text-muted">Sin Pared</div>
          <div className="text-sm font-bold text-blue-400">{stats.wallVsNoWall.withoutWall.winPct}%</div>
          <div className="text-[10px] text-muted">{stats.wallVsNoWall.withoutWall.wins}/{stats.wallVsNoWall.withoutWall.total}</div>
        </div>
      </div>

      {/* Height breakdown */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-background/50 rounded p-2">
          <div className="text-[10px] text-muted">Vidrio (baja)</div>
          <div className="text-sm font-bold">{stats.wallByHeight.baja.count} golpes</div>
          <div className="text-[10px] text-muted">{stats.wallByHeight.baja.winRate}% win rate</div>
        </div>
        <div className="bg-background/50 rounded p-2">
          <div className="text-[10px] text-muted">Reja (alta)</div>
          <div className="text-sm font-bold">{stats.wallByHeight.alta.count} golpes</div>
          <div className="text-[10px] text-muted">{stats.wallByHeight.alta.winRate}% win rate</div>
        </div>
      </div>

      {/* Most used walls */}
      {stats.mostUsedWalls.length > 0 && (
        <div>
          <div className="text-[10px] text-muted mb-1">Paredes mas usadas</div>
          <div className="flex flex-wrap gap-1">
            {stats.mostUsedWalls.map((w) => (
              <span key={w.wall} className="px-1.5 py-0.5 bg-purple-500/15 rounded text-[10px] text-purple-300">
                {w.wall}: {w.count}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
