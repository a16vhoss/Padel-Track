'use client';

import { useEffect } from 'react';
import { useHistoryStore } from '@/stores/historyStore';
import { computeGlobalStats } from '@/lib/stats/globalStats';
import { Card } from '@/components/ui/Card';
import { ShotDistributionChart } from '@/components/stats/ShotDistributionChart';
import { formatDuration } from '@/lib/utils/relativeTime';
import Link from 'next/link';

export default function EstadisticasPage() {
  const { matches, loadAll } = useHistoryStore();

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const stats = computeGlobalStats(matches);

  if (matches.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
        <div className="text-4xl opacity-30">📊</div>
        <h1 className="text-xl font-bold">Estadísticas Globales</h1>
        <p className="text-sm text-muted">No hay partidos registrados aún. Crea tu primer partido para ver estadísticas.</p>
        <Link href="/partido/nuevo" className="inline-block mt-2 px-4 py-2 bg-primary text-black rounded-md font-medium text-sm hover:bg-primary-hover transition-colors">
          Crear Partido
        </Link>
      </div>
    );
  }

  const totalWinners = stats.winners.team1 + stats.winners.team2;
  const totalErrors = stats.errors.team1 + stats.errors.team2;
  const effectiveness = stats.totalShots > 0 ? Math.round((totalWinners / stats.totalShots) * 100) : 0;

  // Top shot types
  const topShots = Object.entries(stats.shotsByType)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Player stats
  const playerStats = Object.entries(stats.shotsByPlayer)
    .map(([id, shots]) => ({ id, name: stats.playerNames[id] || id, shots }))
    .sort((a, b) => b.shots - a.shots);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">Estadísticas Globales</h1>
        <p className="text-sm text-muted mt-1">Métricas acumuladas de todos tus partidos</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="text-center py-3">
          <div className="text-2xl font-bold text-primary">{stats.totalMatches}</div>
          <div className="text-xs text-muted">Partidos</div>
        </Card>
        <Card className="text-center py-3">
          <div className="text-2xl font-bold text-secondary">{stats.totalPoints}</div>
          <div className="text-xs text-muted">Puntos Jugados</div>
        </Card>
        <Card className="text-center py-3">
          <div className="text-2xl font-bold text-accent">{stats.totalShots}</div>
          <div className="text-xs text-muted">Golpes Totales</div>
        </Card>
        <Card className="text-center py-3">
          <div className="text-2xl font-bold text-foreground">{formatDuration(stats.totalDurationMs)}</div>
          <div className="text-xs text-muted">Tiempo Total</div>
        </Card>
      </div>

      {/* Effectiveness & Averages */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center py-3">
          <div className="text-2xl font-bold text-green-400">{effectiveness}%</div>
          <div className="text-xs text-muted">Efectividad</div>
          <div className="text-xs text-muted/60">(winners/golpes)</div>
        </Card>
        <Card className="text-center py-3">
          <div className="text-2xl font-bold text-foreground">{stats.avgShotsPerPoint}</div>
          <div className="text-xs text-muted">Golpes/Punto</div>
        </Card>
        <Card className="text-center py-3">
          <div className="text-2xl font-bold text-foreground">{stats.finishedMatches}</div>
          <div className="text-xs text-muted">Finalizados</div>
        </Card>
      </div>

      {/* Winners vs Errors */}
      <Card>
        <h3 className="text-sm font-semibold mb-3">Winners vs Errores</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{totalWinners}</div>
            <div className="text-xs text-muted">Winners</div>
            <div className="mt-2 h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 rounded-full"
                style={{ width: `${stats.totalShots > 0 ? (totalWinners / stats.totalShots) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">{totalErrors}</div>
            <div className="text-xs text-muted">Errores</div>
            <div className="mt-2 h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-red-400 rounded-full"
                style={{ width: `${stats.totalShots > 0 ? (totalErrors / stats.totalShots) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Shot Distribution */}
      <Card>
        <ShotDistributionChart shotsByType={stats.shotsByType} />
      </Card>

      {/* Player Activity */}
      {playerStats.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold mb-3">Actividad por Jugador</h3>
          <div className="space-y-2">
            {playerStats.map((p) => {
              const maxShots = playerStats[0]?.shots || 1;
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-xs text-muted w-8">{p.id}</span>
                  <span className="text-sm font-medium w-24 truncate">{p.name}</span>
                  <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(p.shots / maxShots) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted w-12 text-right">{p.shots}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Match History */}
      {stats.matchHistory.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold mb-3">Historial de Partidos</h3>
          <div className="space-y-2">
            {stats.matchHistory.map((m, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-border/30 last:border-0">
                <span className="text-muted">{new Date(m.date).toLocaleDateString('es-ES')}</span>
                <span>{m.totalPoints} pts</span>
                <span className="text-green-400">{m.effectiveness}% eff.</span>
                <span className={m.winner ? 'text-foreground font-medium' : 'text-muted'}>
                  {m.winner || 'En curso'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
