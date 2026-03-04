'use client';

import { MomentumData } from '@/lib/stats/momentum';
import { Card } from '@/components/ui/Card';
import { useChartTheme } from '@/lib/utils/chartTheme';

interface MomentumChartProps {
  data: MomentumData;
  team1Name: string;
  team2Name: string;
}

export function MomentumChart({ data, team1Name, team2Name }: MomentumChartProps) {
  const theme = useChartTheme();

  if (data.points.length === 0) {
    return null;
  }

  const maxAbs = Math.max(...data.points.map((p) => Math.abs(p.momentum)), 1);
  const chartHeight = 120;
  const chartWidth = Math.max(data.points.length * 8, 200);
  const midY = chartHeight / 2;

  return (
    <Card>
      <h3 className="text-sm font-semibold mb-3">Momentum del Partido</h3>

      {/* Momentum chart */}
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-32" preserveAspectRatio="none">
          {/* Center line */}
          <line x1="0" y1={midY} x2={chartWidth} y2={midY} stroke={`${theme.muted}30`} strokeWidth="1" strokeDasharray="4,4" />

          {/* Momentum line */}
          <polyline
            fill="none"
            stroke="url(#momentum-gradient)"
            strokeWidth="2"
            strokeLinejoin="round"
            points={data.points.map((p, i) => {
              const x = (i / Math.max(data.points.length - 1, 1)) * chartWidth;
              const y = midY - (p.momentum / maxAbs) * (midY - 8);
              return `${x},${y}`;
            }).join(' ')}
          />

          {/* Area fills */}
          <path
            d={`M 0,${midY} ` +
              data.points.map((p, i) => {
                const x = (i / Math.max(data.points.length - 1, 1)) * chartWidth;
                const y = midY - (p.momentum / maxAbs) * (midY - 8);
                return `L ${x},${y}`;
              }).join(' ') +
              ` L ${chartWidth},${midY} Z`}
            fill={`${theme.team1}1a`}
          />

          {/* Break point markers */}
          {data.points.map((p, i) => {
            if (!p.isBreakPoint) return null;
            const x = (i / Math.max(data.points.length - 1, 1)) * chartWidth;
            const y = midY - (p.momentum / maxAbs) * (midY - 8);
            return (
              <circle key={i} cx={x} cy={y} r="3" fill={`${theme.accent}cc`} />
            );
          })}

          <defs>
            <linearGradient id="momentum-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.team1} />
              <stop offset="50%" stopColor={theme.foreground} />
              <stop offset="100%" stopColor={theme.team2} />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Team labels */}
      <div className="flex justify-between text-xs text-muted mt-1 mb-3">
        <span className="text-green-400">{team1Name}</span>
        <span className="text-blue-400">{team2Name}</span>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-background/50 rounded p-2">
          <div className="text-muted text-xs">Racha más larga</div>
          <div className="font-bold">{data.longestStreak.length} pts</div>
          <div className="text-xs text-muted">{data.longestStreak.team === 'team1' ? team1Name : team2Name}</div>
        </div>
        <div className="bg-background/50 rounded p-2">
          <div className="text-muted text-xs">Break Points</div>
          <div className="font-bold text-green-400">{data.breakPointsWon.team1}/{data.breakPointsTotal.team1}</div>
          <div className="text-xs text-muted">{team1Name}</div>
        </div>
        <div className="bg-background/50 rounded p-2">
          <div className="text-muted text-xs">Break Points</div>
          <div className="font-bold text-blue-400">{data.breakPointsWon.team2}/{data.breakPointsTotal.team2}</div>
          <div className="text-xs text-muted">{team2Name}</div>
        </div>
        <div className="bg-background/50 rounded p-2">
          <div className="text-muted text-xs">Break points totales</div>
          <div className="font-bold text-amber-400">{data.points.filter((p) => p.isBreakPoint).length}</div>
        </div>
      </div>
    </Card>
  );
}
