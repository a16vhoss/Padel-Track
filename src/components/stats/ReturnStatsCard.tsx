'use client';

import { ReturnStats } from '@/lib/stats/serveStats';
import { Card } from '@/components/ui/Card';
import { AnimatedBar } from '@/components/motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ReturnStatsCardProps {
  stats: ReturnStats;
  teamName?: string;
}

export function ReturnStatsCard({ stats, teamName }: ReturnStatsCardProps) {
  if (stats.pointsTotal === 0) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-muted mb-2">Resto {teamName && `- ${teamName}`}</h3>
        <p className="text-xs text-muted">No hay datos de resto disponibles</p>
      </Card>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
    <Card>
      <h3 className="text-sm font-semibold mb-4">
        Resto {teamName && <span className="text-muted font-normal">- {teamName}</span>}
      </h3>

      {/* Main metric: Points won on return */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-shrink-0 w-16 h-16 rounded-full border-4 border-blue-500/30 flex items-center justify-center">
          <span className="text-lg font-black text-blue-400">{stats.winPct}%</span>
        </div>
        <div>
          <div className="text-xs font-bold">Puntos ganados al resto</div>
          <div className="text-xs text-muted-foreground">{stats.pointsWon} de {stats.pointsTotal} puntos</div>
        </div>
      </div>

      {/* Break points */}
      <Tooltip>
        <TooltipTrigger asChild>
      <div className="bg-background/50 rounded-lg p-3 border border-border/30 mb-3 cursor-help">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-muted-foreground font-medium">Break Points</div>
          <div className="text-xs font-bold">
            {stats.breakPointsWon}/{stats.breakPointsTotal}
          </div>
        </div>
        <div className="h-2 bg-border/20 rounded-full overflow-hidden">
          <AnimatedBar percentage={stats.breakPct} color="bg-amber-500" height="h-full" />
        </div>
        <div className="text-right text-xs text-amber-400 font-semibold mt-1">{stats.breakPct}%</div>
      </div>
        </TooltipTrigger>
        <TooltipContent>Puntos de break convertidos al resto</TooltipContent>
      </Tooltip>

      {/* Grid stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-background/50 rounded-lg p-2 text-center border border-border/30">
          <div className="text-xl font-black text-green-400">{stats.returnWinners}</div>
          <div className="text-xs text-muted-foreground font-medium">Winners</div>
        </div>
        <div className="bg-background/50 rounded-lg p-2 text-center border border-border/30">
          <div className="text-xl font-black text-red-400">{stats.returnErrors}</div>
          <div className="text-xs text-muted-foreground font-medium">Errores</div>
        </div>
        <div className="bg-background/50 rounded-lg p-2 text-center border border-border/30">
          <div className="text-xl font-black">{stats.gamesWonOnReturn}</div>
          <div className="text-xs text-muted-foreground font-medium">Breaks</div>
        </div>
      </div>
    </Card>
    </TooltipProvider>
  );
}
