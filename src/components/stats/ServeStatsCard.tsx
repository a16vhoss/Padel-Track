'use client';

import { ServeStats } from '@/lib/stats/serveStats';
import { Card } from '@/components/ui/Card';

interface ServeStatsCardProps {
  stats: ServeStats;
  teamName?: string;
}

export function ServeStatsCard({ stats, teamName }: ServeStatsCardProps) {
  if (stats.totalServes === 0) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-muted mb-2">Estadisticas de Saque {teamName && `- ${teamName}`}</h3>
        <p className="text-xs text-muted">No hay datos de saque disponibles</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold mb-3">Estadisticas de Saque {teamName && <span className="text-muted font-normal">- {teamName}</span>}</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <StatBox label="1er Saque In" value={`${stats.firstServePct}%`} sub={`${stats.firstServeIn}/${stats.totalServes}`} color="text-green-400" />
        <StatBox label="Aces" value={String(stats.aces)} color="text-amber-400" />
        <StatBox label="Dobles Faltas" value={String(stats.doubleFaults)} color="text-red-400" />
        <StatBox label="Total Saques" value={String(stats.totalServes)} color="text-blue-400" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-background/50 rounded-md p-2">
          <div className="text-[10px] text-muted uppercase tracking-wide mb-1">Con 1er Saque</div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-green-400">{stats.firstServeWinPct}%</span>
            <span className="text-[10px] text-muted">puntos ganados</span>
          </div>
          <div className="text-[10px] text-muted">{stats.firstServePointsWon}/{stats.firstServePointsTotal}</div>
        </div>
        <div className="bg-background/50 rounded-md p-2">
          <div className="text-[10px] text-muted uppercase tracking-wide mb-1">Con 2do Saque</div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-blue-400">{stats.secondServeWinPct}%</span>
            <span className="text-[10px] text-muted">puntos ganados</span>
          </div>
          <div className="text-[10px] text-muted">{stats.secondServePointsWon}/{stats.secondServePointsTotal}</div>
        </div>
      </div>

      <div className="flex gap-3 text-[10px] text-muted">
        <span>Derecha: {stats.serveBySide.derecha}</span>
        <span>Izquierda: {stats.serveBySide.izquierda}</span>
      </div>
    </Card>
  );
}

function StatBox({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="text-center">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-muted">{label}</div>
      {sub && <div className="text-[9px] text-muted/60">{sub}</div>}
    </div>
  );
}
