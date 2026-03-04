'use client';

import { ScoutingReport } from '@/types/scouting';
import { Card } from '@/components/ui/Card';

interface ScoutingReportCardProps {
  report: ScoutingReport;
}

export function ScoutingReportCard({ report }: ScoutingReportCardProps) {
  const p = report.playerProfile;

  return (
    <div className="space-y-4">
      {/* Player header */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold">{p.playerName}</h2>
            <p className="text-xs text-muted">{p.matchesAnalyzed} partidos analizados</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-primary">{p.winnerRate}%</div>
            <div className="text-[10px] text-muted">Winner Rate</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div className="text-center bg-background/50 rounded p-2">
            <div className="text-lg font-bold">{p.totalShots}</div>
            <div className="text-[10px] text-muted">Golpes</div>
          </div>
          <div className="text-center bg-background/50 rounded p-2">
            <div className="text-lg font-bold text-green-400">{p.totalWinners}</div>
            <div className="text-[10px] text-muted">Winners</div>
          </div>
          <div className="text-center bg-background/50 rounded p-2">
            <div className="text-lg font-bold text-red-400">{p.totalErrors}</div>
            <div className="text-[10px] text-muted">Errores</div>
          </div>
          <div className="text-center bg-background/50 rounded p-2">
            <div className="text-lg font-bold text-red-400">{p.errorRate}%</div>
            <div className="text-[10px] text-muted">Error Rate</div>
          </div>
        </div>
      </Card>

      {/* Serve stats */}
      <Card>
        <h3 className="text-sm font-semibold mb-2">Saque</h3>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{p.serveStats.firstServeIn}%</div>
            <div className="text-[10px] text-muted">1er Saque In</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-amber-400">{p.serveStats.aceCount}</div>
            <div className="text-[10px] text-muted">Aces</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-400">{p.serveStats.doubleFaultCount}</div>
            <div className="text-[10px] text-muted">Dobles Faltas</div>
          </div>
        </div>
        <div className="text-xs text-muted">
          Lado preferido: <span className="font-medium text-foreground">{p.serveStats.preferredServeSide === 'balanced' ? 'Equilibrado' : p.serveStats.preferredServeSide}</span>
        </div>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-semibold text-green-400 mb-2">Fortalezas</h3>
          {p.strengths.length === 0 ? (
            <p className="text-xs text-muted">Sin datos suficientes</p>
          ) : (
            <div className="space-y-1.5">
              {p.strengths.map((s, i) => (
                <div key={i} className="text-xs">
                  <div className="font-medium">{s.area}</div>
                  <div className="text-[10px] text-muted">{s.description}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-red-400 mb-2">Debilidades</h3>
          {p.weaknesses.length === 0 ? (
            <p className="text-xs text-muted">Sin datos suficientes</p>
          ) : (
            <div className="space-y-1.5">
              {p.weaknesses.map((w, i) => (
                <div key={i} className="text-xs">
                  <div className="font-medium">{w.area}</div>
                  <div className="text-[10px] text-muted">{w.description}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Shot preferences */}
      <Card>
        <h3 className="text-sm font-semibold mb-2">Golpes Preferidos</h3>
        <div className="space-y-1">
          {p.preferredShots.slice(0, 8).map((shot) => (
            <div key={shot.shotType} className="flex items-center gap-2 text-xs">
              <span className="w-8 font-mono font-bold">{shot.shotType}</span>
              <div className="flex-1 bg-border/20 rounded-full h-2">
                <div className="h-full rounded-full bg-primary/50" style={{ width: `${shot.percentage}%` }} />
              </div>
              <span className="w-8 text-right text-muted">{shot.percentage}%</span>
              <span className="w-12 text-right text-green-400 text-[10px]">{shot.winnerRate}%W</span>
              <span className="w-12 text-right text-red-400 text-[10px]">{shot.errorRate}%E</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold mb-2">Recomendaciones</h3>
          <ul className="space-y-1">
            {report.recommendations.map((r, i) => (
              <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                <span className="text-amber-400 mt-0.5 shrink-0">-</span>
                {r}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Wall usage */}
      {p.wallUsage.totalWallShots > 0 && (
        <Card>
          <h3 className="text-sm font-semibold mb-2">Uso de Pared</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">{p.wallUsage.totalWallShots}</div>
              <div className="text-[10px] text-muted">Golpes pared</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{p.wallUsage.wallWinnerRate}%</div>
              <div className="text-[10px] text-muted">Efectividad</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold">{p.wallUsage.preferredWalls.join(', ') || '-'}</div>
              <div className="text-[10px] text-muted">Favoritas</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
