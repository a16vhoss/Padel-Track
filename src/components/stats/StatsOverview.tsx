'use client';

import { Card } from '@/components/ui/Card';
import { MatchStats } from '@/hooks/useStats';
import { Match } from '@/types/match';
import { generateInsights } from '@/lib/stats/generateInsights';
import { ShotEffectivenessEntry } from '@/lib/stats/advancedStats';

interface StatsOverviewProps {
  stats: MatchStats;
  team1Name: string;
  team2Name: string;
  match?: Match;
  shotEffectiveness?: ShotEffectivenessEntry[];
}

function HorizontalBar({
  value1,
  value2,
  label1,
  label2,
  color1 = 'bg-team1',
  color2 = 'bg-secondary',
}: {
  value1: number;
  value2: number;
  label1: string;
  label2: string;
  color1?: string;
  color2?: string;
}) {
  const total = value1 + value2;
  const pct1 = total > 0 ? Math.round((value1 / total) * 100) : 50;
  const pct2 = 100 - pct1;

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium">{label1}: <strong>{value1}</strong></span>
        <span className="font-medium">{label2}: <strong>{value2}</strong></span>
      </div>
      <div className="flex h-4 rounded-full overflow-hidden bg-border">
        <div
          className={`${color1} flex items-center justify-center text-[10px] font-bold text-black transition-all`}
          style={{ width: `${Math.max(pct1, 5)}%` }}
        >
          {total > 0 && `${pct1}%`}
        </div>
        <div
          className={`${color2} flex items-center justify-center text-[10px] font-bold text-black transition-all`}
          style={{ width: `${Math.max(pct2, 5)}%` }}
        >
          {total > 0 && `${pct2}%`}
        </div>
      </div>
    </div>
  );
}

export function StatsOverview({ stats, team1Name, team2Name, match, shotEffectiveness }: StatsOverviewProps) {
  // Calculate KPIs
  const totalPoints = stats.totalPoints;
  const team1Winners = stats.winners.team1 || 0;
  const team2Winners = stats.winners.team2 || 0;
  const totalWinners = team1Winners + team2Winners;
  const effectivenessTotal = stats.totalShots > 0
    ? Math.round((totalWinners / stats.totalShots) * 100)
    : 0;

  const team1Errors = stats.errors.team1 || 0;
  const team2Errors = stats.errors.team2 || 0;

  // Generate insights if match is provided
  const insights = match
    ? generateInsights({ match, stats, shotEffectiveness })
    : [];

  return (
    <div className="space-y-4">
      {/* 3 KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{totalPoints}</div>
            <div className="text-xs text-muted mt-1">Puntos Jugados</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{effectivenessTotal}%</div>
            <div className="text-xs text-muted mt-1">Efectividad</div>
            <div className="text-[10px] text-muted">(winners/total)</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">{stats.avgShotsPerPoint}</div>
            <div className="text-xs text-muted mt-1">Golpes/Punto</div>
          </div>
        </Card>
      </div>

      {/* Winners & Errors with horizontal bars */}
      <Card>
        <h3 className="text-sm font-medium mb-3">Winners</h3>
        <HorizontalBar
          value1={team1Winners}
          value2={team2Winners}
          label1={team1Name}
          label2={team2Name}
        />
      </Card>

      <Card>
        <h3 className="text-sm font-medium mb-3">Errores No Forzados</h3>
        <HorizontalBar
          value1={team1Errors}
          value2={team2Errors}
          label1={team1Name}
          label2={team2Name}
          color1="bg-red-500"
          color2="bg-red-700"
        />
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="text-lg font-bold text-foreground">{stats.totalShots}</div>
          <div className="text-xs text-muted">Golpes Totales</div>
        </Card>
        <Card>
          <div className="text-lg font-bold text-foreground">{stats.intermediateZoneHits}</div>
          <div className="text-xs text-muted">Botes en Lineas</div>
        </Card>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <Card>
          <h3 className="text-sm font-medium mb-2">Insights</h3>
          <div className="space-y-1.5">
            {insights.map((insight, i) => (
              <div key={i} className="flex gap-2 text-xs">
                <span className="text-primary flex-shrink-0">▸</span>
                <span className="text-muted">{insight}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
