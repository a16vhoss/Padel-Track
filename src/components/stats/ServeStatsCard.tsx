'use client';

import { ServeStats } from '@/lib/stats/serveStats';
import { Card } from '@/components/ui/Card';
import { AnimatedBar } from '@/components/motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ServeStatsCardProps {
  stats: ServeStats;
  teamName?: string;
}

function CircularProgress({ value, size = 56, stroke = 5, color = '#22c55e' }: { value: number; size?: number; stroke?: number; color?: string }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
  );
}

export function ServeStatsCard({ stats, teamName }: ServeStatsCardProps) {
  if (stats.totalServes === 0) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-muted mb-2">Saque {teamName && `- ${teamName}`}</h3>
        <p className="text-xs text-muted">No hay datos de saque disponibles</p>
      </Card>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
    <Card>
      <h3 className="text-sm font-semibold mb-4">
        Saque {teamName && <span className="text-muted font-normal">- {teamName}</span>}
      </h3>

      {/* Main metric: First serve percentage with circular progress */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-4 mb-4 cursor-help">
            <div className="relative flex-shrink-0">
              <CircularProgress value={stats.firstServePct} size={64} stroke={5} color="#22c55e" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-primary">{stats.firstServePct}%</span>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold">1er Saque In</div>
              <div className="text-xs text-muted-foreground">{stats.firstServeIn} de {stats.totalServes} saques</div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>% de primeros saques que entran en juego</TooltipContent>
      </Tooltip>

      {/* Key stats grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-amber-500/5 rounded-lg p-2.5 text-center border border-amber-500/10">
          <div className="text-xl font-black text-amber-400">{stats.aces}</div>
          <div className="text-xs text-muted-foreground font-medium">Aces</div>
        </div>
        <div className="bg-red-500/5 rounded-lg p-2.5 text-center border border-red-500/10">
          <div className="text-xl font-black text-red-400">{stats.doubleFaults}</div>
          <div className="text-xs text-muted-foreground font-medium">Doble Falta</div>
        </div>
        <div className="bg-background/50 rounded-lg p-2.5 text-center border border-border/30">
          <div className="text-xl font-black">{stats.totalServes}</div>
          <div className="text-xs text-muted-foreground font-medium">Total</div>
        </div>
      </div>

      {/* Win rates on 1st vs 2nd serve */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-background/50 rounded-lg p-3 border border-border/30">
          <div className="text-xs text-muted-foreground font-medium mb-1.5">Puntos con 1er Saque</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-green-400">{stats.firstServeWinPct}%</span>
          </div>
          <div className="text-xs text-muted-foreground">{stats.firstServePointsWon}/{stats.firstServePointsTotal}</div>
          {/* Mini bar */}
          <div className="mt-1.5 h-1.5 bg-border/20 rounded-full overflow-hidden">
            <AnimatedBar percentage={stats.firstServeWinPct} color="bg-green-500" height="h-full" />
          </div>
        </div>
        <div className="bg-background/50 rounded-lg p-3 border border-border/30">
          <div className="text-xs text-muted-foreground font-medium mb-1.5">Puntos con 2do Saque</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-blue-400">{stats.secondServeWinPct}%</span>
          </div>
          <div className="text-xs text-muted-foreground">{stats.secondServePointsWon}/{stats.secondServePointsTotal}</div>
          {/* Mini bar */}
          <div className="mt-1.5 h-1.5 bg-border/20 rounded-full overflow-hidden">
            <AnimatedBar percentage={stats.secondServeWinPct} color="bg-blue-500" height="h-full" delay={0.1} />
          </div>
        </div>
      </div>

      {/* Side distribution */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/30">
        <span className="font-medium">Lado:</span>
        <div className="flex-1 flex h-2 bg-border/20 rounded-full overflow-hidden">
          {stats.serveBySide.derecha + stats.serveBySide.izquierda > 0 && (
            <>
              <div
                className="bg-primary/60 rounded-l-full"
                style={{ width: `${(stats.serveBySide.derecha / (stats.serveBySide.derecha + stats.serveBySide.izquierda)) * 100}%` }}
              />
              <div
                className="bg-secondary/60 rounded-r-full flex-1"
              />
            </>
          )}
        </div>
        <span>Der: <strong>{stats.serveBySide.derecha}</strong></span>
        <span>Izq: <strong>{stats.serveBySide.izquierda}</strong></span>
      </div>
    </Card>
    </TooltipProvider>
  );
}
