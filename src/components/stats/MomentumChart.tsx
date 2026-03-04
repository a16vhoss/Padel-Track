'use client';

import { useState } from 'react';
import { MomentumData } from '@/lib/stats/momentum';
import { Card } from '@/components/ui/Card';

interface MomentumChartProps {
  data: MomentumData;
  team1Name: string;
  team2Name: string;
}

export function MomentumChart({ data, team1Name, team2Name }: MomentumChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  if (data.points.length === 0) {
    return null;
  }

  const maxAbs = Math.max(...data.points.map((p) => Math.abs(p.momentum)), 1);
  const chartHeight = 140;
  const chartPadding = 24;
  const chartWidth = Math.max(data.points.length * 8, 300);
  const midY = chartHeight / 2;
  const usableHeight = midY - chartPadding;

  const getX = (i: number) => (i / Math.max(data.points.length - 1, 1)) * chartWidth;
  const getY = (momentum: number) => midY - (momentum / maxAbs) * usableHeight;

  const linePoints = data.points.map((p, i) => `${getX(i)},${getY(p.momentum)}`).join(' ');

  // Build area path with separate fills for positive (team1) and negative (team2)
  const areaPathTeam1 = `M 0,${midY} ` +
    data.points.map((p, i) => {
      const x = getX(i);
      const y = Math.min(getY(p.momentum), midY);
      return `L ${x},${y}`;
    }).join(' ') +
    ` L ${getX(data.points.length - 1)},${midY} Z`;

  const areaPathTeam2 = `M 0,${midY} ` +
    data.points.map((p, i) => {
      const x = getX(i);
      const y = Math.max(getY(p.momentum), midY);
      return `L ${x},${y}`;
    }).join(' ') +
    ` L ${getX(data.points.length - 1)},${midY} Z`;

  const hoveredData = hoveredPoint !== null ? data.points[hoveredPoint] : null;

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Momentum del Partido</h3>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-team1" /> {team1Name}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-secondary" /> {team2Name}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-accent" /> Break Point
          </span>
        </div>
      </div>

      {/* Momentum chart */}
      <div className="overflow-x-auto relative">
        <svg
          viewBox={`-10 0 ${chartWidth + 20} ${chartHeight}`}
          className="w-full h-36"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="momentum-line-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="50%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="area-team1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(34,197,94,0.25)" />
              <stop offset="100%" stopColor="rgba(34,197,94,0.02)" />
            </linearGradient>
            <linearGradient id="area-team2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(59,130,246,0.02)" />
              <stop offset="100%" stopColor="rgba(59,130,246,0.25)" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1={chartPadding} x2={chartWidth} y2={chartPadding} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <line x1="0" y1={chartHeight - chartPadding} x2={chartWidth} y2={chartHeight - chartPadding} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

          {/* Center line */}
          <line x1="0" y1={midY} x2={chartWidth} y2={midY} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="6,4" />

          {/* Area fills */}
          <path d={areaPathTeam1} fill="url(#area-team1)" />
          <path d={areaPathTeam2} fill="url(#area-team2)" />

          {/* Momentum line */}
          <polyline
            fill="none"
            stroke="url(#momentum-line-grad)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={linePoints}
          />

          {/* Break point markers */}
          {data.points.map((p, i) => {
            if (!p.isBreakPoint) return null;
            const x = getX(i);
            const y = getY(p.momentum);
            return (
              <g key={`bp-${i}`}>
                <circle cx={x} cy={y} r="5" fill="rgba(245,158,11,0.2)" />
                <circle cx={x} cy={y} r="3" fill="#f59e0b" />
              </g>
            );
          })}

          {/* Hover detection zones */}
          {data.points.map((p, i) => {
            const x = getX(i);
            const y = getY(p.momentum);
            return (
              <g key={`hover-${i}`}>
                <rect
                  x={x - 4}
                  y={0}
                  width={8}
                  height={chartHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredPoint(i)}
                  style={{ cursor: 'crosshair' }}
                />
                {hoveredPoint === i && (
                  <>
                    <line x1={x} y1={0} x2={x} y2={chartHeight} stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3,3" />
                    <circle cx={x} cy={y} r="5" fill={p.winner === 'team1' ? '#22c55e' : '#3b82f6'} stroke="white" strokeWidth="1.5" />
                  </>
                )}
              </g>
            );
          })}

          {/* Team labels on sides */}
          <text x="4" y={chartPadding - 4} fill="rgba(34,197,94,0.5)" fontSize="8" fontWeight="bold">{team1Name}</text>
          <text x="4" y={chartHeight - chartPadding + 12} fill="rgba(59,130,246,0.5)" fontSize="8" fontWeight="bold">{team2Name}</text>
        </svg>

        {/* Tooltip */}
        {hoveredData && hoveredPoint !== null && (
          <div
            className="absolute top-0 bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs shadow-lg pointer-events-none z-10"
            style={{
              left: `${Math.min(Math.max((hoveredPoint / data.points.length) * 100, 10), 85)}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-bold mb-1">Punto #{hoveredData.pointNumber}</div>
            <div className={`font-semibold ${hoveredData.winner === 'team1' ? 'text-green-400' : 'text-blue-400'}`}>
              {hoveredData.winner === 'team1' ? team1Name : team2Name}
            </div>
            <div className="text-muted mt-0.5">
              Momentum: {hoveredData.momentum > 0 ? '+' : ''}{hoveredData.momentum}
            </div>
            {hoveredData.isBreakPoint && (
              <div className="text-amber-400 mt-0.5 font-bold">Break Point</div>
            )}
            {Math.abs(hoveredData.streak) >= 3 && (
              <div className="text-accent mt-0.5">Racha: {Math.abs(hoveredData.streak)}</div>
            )}
          </div>
        )}
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mt-3">
        <div className="bg-background/50 rounded-lg p-2.5 border border-border/30">
          <div className="text-muted text-[10px] font-medium">Racha mas larga</div>
          <div className="font-black text-lg mt-0.5">{data.longestStreak.length}</div>
          <div className={`text-[10px] font-semibold ${data.longestStreak.team === 'team1' ? 'text-green-400' : 'text-blue-400'}`}>
            {data.longestStreak.team === 'team1' ? team1Name : team2Name}
          </div>
        </div>
        <div className="bg-background/50 rounded-lg p-2.5 border border-border/30">
          <div className="text-muted text-[10px] font-medium">Breaks {team1Name}</div>
          <div className="font-black text-lg mt-0.5 text-green-400">
            {data.breakPointsWon.team1}<span className="text-muted font-normal text-xs">/{data.breakPointsTotal.team1}</span>
          </div>
          <div className="text-[10px] text-muted">
            {data.breakPointsTotal.team1 > 0 ? Math.round((data.breakPointsWon.team1 / data.breakPointsTotal.team1) * 100) : 0}% conversion
          </div>
        </div>
        <div className="bg-background/50 rounded-lg p-2.5 border border-border/30">
          <div className="text-muted text-[10px] font-medium">Breaks {team2Name}</div>
          <div className="font-black text-lg mt-0.5 text-blue-400">
            {data.breakPointsWon.team2}<span className="text-muted font-normal text-xs">/{data.breakPointsTotal.team2}</span>
          </div>
          <div className="text-[10px] text-muted">
            {data.breakPointsTotal.team2 > 0 ? Math.round((data.breakPointsWon.team2 / data.breakPointsTotal.team2) * 100) : 0}% conversion
          </div>
        </div>
        <div className="bg-background/50 rounded-lg p-2.5 border border-border/30">
          <div className="text-muted text-[10px] font-medium">Comebacks</div>
          <div className="font-black text-lg mt-0.5 text-amber-400">{data.comebacks}</div>
          <div className="text-[10px] text-muted">remontadas</div>
        </div>
      </div>
    </Card>
  );
}
