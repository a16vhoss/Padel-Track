'use client';

import { TimelinePoint } from '@/lib/stats/advancedStats';

interface MatchTimelineProps {
  data: TimelinePoint[];
  team1Name: string;
  team2Name: string;
}

export function MatchTimeline({ data, team1Name, team2Name }: MatchTimelineProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted text-sm">No hay datos de timeline</div>
    );
  }

  // Compute momentum: running diff (team1 points - team2 points)
  let team1Count = 0;
  let team2Count = 0;
  const momentum = data.map((p) => {
    if (p.winner === 'team1') team1Count++;
    else team2Count++;
    return { ...p, diff: team1Count - team2Count, t1: team1Count, t2: team2Count };
  });

  const maxDiff = Math.max(...momentum.map((m) => Math.abs(m.diff)), 1);
  const barWidth = Math.max(2, Math.min(8, 400 / data.length));
  const svgWidth = data.length * (barWidth + 1);
  const svgHeight = 80;
  const midY = svgHeight / 2;

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Momentum del Partido</h3>

      {/* Team labels */}
      <div className="flex justify-between text-[10px] text-muted mb-1">
        <span>{team1Name}</span>
        <span>{team2Name}</span>
      </div>

      <div className="overflow-x-auto">
        <svg
          width={Math.max(svgWidth, 300)}
          height={svgHeight}
          viewBox={`0 0 ${Math.max(svgWidth, 300)} ${svgHeight}`}
          className="w-full h-auto rounded-md"
          style={{ background: 'rgba(0,0,0,0.2)' }}
          preserveAspectRatio="none"
        >
          {/* Center line */}
          <line
            x1="0" y1={midY}
            x2={Math.max(svgWidth, 300)} y2={midY}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />

          {/* Point bars */}
          {momentum.map((p, i) => {
            const x = i * (barWidth + 1);
            const barHeight = (Math.abs(p.diff) / maxDiff) * (midY - 4);
            const isTeam1 = p.winner === 'team1';
            const y = isTeam1 ? midY - barHeight : midY;

            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx="1"
                fill={isTeam1 ? '#22c55e' : '#3b82f6'}
                opacity={0.7}
              >
                <title>
                  P{p.pointNumber} Set {p.setNumber}: {p.scoreAfter} ({p.cause})
                </title>
              </rect>
            );
          })}
        </svg>
      </div>

      {/* Score summary */}
      <div className="flex justify-between text-xs mt-1">
        <span className="text-green-400 font-medium">{team1Count} pts</span>
        <span className="text-blue-400 font-medium">{team2Count} pts</span>
      </div>
    </div>
  );
}
