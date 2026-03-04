'use client';

import { MatchComparison, ComparisonTrend } from '@/lib/stats/matchComparison';
import { Card } from '@/components/ui/Card';

interface MatchComparisonCardProps {
  comparison: MatchComparison;
}

export function MatchComparisonCard({ comparison }: MatchComparisonCardProps) {
  if (comparison.matches.length === 0) {
    return (
      <Card>
        <h3 className="text-sm font-semibold mb-2">Comparacion entre Partidos</h3>
        <p className="text-xs text-muted">No hay partidos para comparar</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold mb-1">Comparacion entre Partidos</h3>
      <p className="text-xs text-muted mb-3">{comparison.summary}</p>

      {/* Trends */}
      {comparison.trends.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {comparison.trends.map((trend) => (
            <TrendBox key={trend.metric} trend={trend} />
          ))}
        </div>
      )}

      {/* Match table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-border/30 text-muted">
              <th className="text-left py-1 pr-2">Fecha</th>
              <th className="text-left py-1 pr-2">Resultado</th>
              <th className="text-right py-1 pr-2">W</th>
              <th className="text-right py-1 pr-2">E</th>
              <th className="text-right py-1 pr-2">G/P</th>
              <th className="text-right py-1">%W</th>
            </tr>
          </thead>
          <tbody>
            {comparison.matches.map((m) => (
              <tr key={m.matchId} className="border-b border-border/10">
                <td className="py-1 pr-2">{m.date}</td>
                <td className="py-1 pr-2 truncate max-w-[100px]">{m.result}</td>
                <td className="text-right py-1 pr-2 text-green-400">{m.winners}</td>
                <td className="text-right py-1 pr-2 text-red-400">{m.errors}</td>
                <td className="text-right py-1 pr-2">{m.avgShotsPerPoint}</td>
                <td className="text-right py-1 font-bold">{m.winnerRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function TrendBox({ trend }: { trend: ComparisonTrend }) {
  const arrow = trend.trend === 'improving' ? '↑' : trend.trend === 'declining' ? '↓' : '→';
  const color = trend.trend === 'improving' ? 'text-green-400' : trend.trend === 'declining' ? 'text-red-400' : 'text-muted';

  return (
    <div className="bg-background/50 rounded p-2 text-center">
      <div className="text-[10px] text-muted">{trend.metric}</div>
      <div className={`text-sm font-bold ${color}`}>
        {arrow} {Math.abs(trend.changePercent)}%
      </div>
      <div className={`text-[9px] ${color}`}>
        {trend.trend === 'improving' ? 'Mejorando' : trend.trend === 'declining' ? 'En declive' : 'Estable'}
      </div>
    </div>
  );
}
