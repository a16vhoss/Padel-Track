'use client';

import { Card } from '@/components/ui/Card';
import { MatchStats } from '@/hooks/useStats';

interface StatsOverviewProps {
  stats: MatchStats;
  team1Name: string;
  team2Name: string;
}

export function StatsOverview({ stats, team1Name, team2Name }: StatsOverviewProps) {
  const cards = [
    { label: 'Puntos Totales', value: stats.totalPoints },
    { label: 'Golpes Totales', value: stats.totalShots },
    { label: 'Promedio Golpes/Punto', value: stats.avgShotsPerPoint },
    { label: 'Botes en Lineas', value: stats.intermediateZoneHits },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <div className="text-2xl font-bold text-primary">{c.value}</div>
            <div className="text-xs text-muted mt-1">{c.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <h3 className="text-sm font-medium mb-2">Winners</h3>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-lg font-bold text-team1">{stats.winners.team1}</div>
              <div className="text-xs text-muted">{team1Name}</div>
            </div>
            <div className="text-muted">vs</div>
            <div className="text-center">
              <div className="text-lg font-bold text-secondary">{stats.winners.team2}</div>
              <div className="text-xs text-muted">{team2Name}</div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-medium mb-2">Errores</h3>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-lg font-bold text-danger">{stats.errors.team1}</div>
              <div className="text-xs text-muted">{team1Name}</div>
            </div>
            <div className="text-muted">vs</div>
            <div className="text-center">
              <div className="text-lg font-bold text-danger">{stats.errors.team2}</div>
              <div className="text-xs text-muted">{team2Name}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
