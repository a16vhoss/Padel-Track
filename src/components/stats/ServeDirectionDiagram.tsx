'use client';

import { useState } from 'react';
import { ServeDirectionStats } from '@/lib/stats/serveStats';
import { PlayerId } from '@/types/shot';
import { Card } from '@/components/ui/Card';

interface ServeDirectionDiagramProps {
  data: ServeDirectionStats;
  playerNames: Record<string, string>;
}

// Mini court zone centers (simplified service box view)
const ZONE_POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: 30, y: 150 },
  2: { x: 75, y: 150 },
  3: { x: 120, y: 150 },
  4: { x: 165, y: 150 },
  5: { x: 210, y: 150 },
  6: { x: 30, y: 100 },
  7: { x: 75, y: 100 },
  8: { x: 120, y: 100 },
  9: { x: 165, y: 100 },
  10: { x: 210, y: 100 },
  11: { x: 30, y: 50 },
  12: { x: 75, y: 50 },
  13: { x: 120, y: 50 },
  14: { x: 165, y: 50 },
  15: { x: 210, y: 50 },
};

const SERVE_ORIGIN = { x: 120, y: 190 };

export function ServeDirectionDiagram({ data, playerNames }: ServeDirectionDiagramProps) {
  const servers = Object.keys(data.byServer) as PlayerId[];
  const [activeServer, setActiveServer] = useState<PlayerId>(servers[0] || 'J1');

  if (servers.length === 0) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-muted mb-2">Direccion de Saque</h3>
        <p className="text-xs text-muted">No hay datos disponibles</p>
      </Card>
    );
  }

  const entries = data.byServer[activeServer] || [];
  const maxCount = Math.max(...entries.map((e) => e.count), 1);

  return (
    <Card>
      <h3 className="text-sm font-semibold mb-3">Direccion de Saque</h3>

      {/* Server tabs */}
      <div className="flex gap-1 mb-3">
        {servers.map((s) => (
          <button
            key={s}
            onClick={() => setActiveServer(s)}
            className={`
              px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors
              ${activeServer === s
                ? 'bg-primary text-black'
                : 'bg-background/50 border border-border/30 text-muted hover:text-foreground'
              }
            `}
          >
            {playerNames[s] || s}
          </button>
        ))}
      </div>

      {/* Mini court SVG */}
      <svg viewBox="0 0 240 210" className="w-full max-w-[280px] mx-auto">
        {/* Court background */}
        <rect x="0" y="10" width="240" height="170" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        {/* Service line */}
        <line x1="0" y1="80" x2="240" y2="80" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        {/* Center line */}
        <line x1="120" y1="10" x2="120" y2="170" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        {/* Net */}
        <line x1="0" y1="10" x2="240" y2="10" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

        {/* Serve origin */}
        <circle cx={SERVE_ORIGIN.x} cy={SERVE_ORIGIN.y} r="4" fill="rgba(255,255,255,0.3)" />

        {/* Direction arrows */}
        {entries.map((entry, i) => {
          const target = ZONE_POSITIONS[entry.zone];
          if (!target) return null;

          const thickness = Math.max(1, (entry.count / maxCount) * 5);
          const hasWinners = entry.winners > 0;
          const hasErrors = entry.errors > 0;
          const color = hasWinners && !hasErrors
            ? '#22c55e'
            : hasErrors && !hasWinners
            ? '#ef4444'
            : 'rgba(255,255,255,0.4)';

          return (
            <g key={i}>
              <line
                x1={SERVE_ORIGIN.x}
                y1={SERVE_ORIGIN.y}
                x2={target.x}
                y2={target.y}
                stroke={color}
                strokeWidth={thickness}
                strokeLinecap="round"
                opacity={0.7}
              />
              <circle
                cx={target.x}
                cy={target.y}
                r={Math.max(4, (entry.count / maxCount) * 10)}
                fill={color}
                opacity={0.3}
              />
              <text
                x={target.x}
                y={target.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="8"
                fontWeight="700"
              >
                {entry.count}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2 text-[9px] text-muted">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" /> Winner
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" /> Error
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-white/40" /> Neutro
        </span>
      </div>
    </Card>
  );
}
