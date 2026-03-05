'use client';

import { Card } from '@/components/ui/Card';
import { MatchStats } from '@/hooks/useStats';
import { Match } from '@/types/match';
import { generateInsights } from '@/lib/stats/generateInsights';
import { ShotEffectivenessEntry } from '@/lib/stats/advancedStats';
import { AnimatedBar } from '@/components/motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StatsOverviewProps {
  stats: MatchStats;
  team1Name: string;
  team2Name: string;
  match?: Match;
  shotEffectiveness?: ShotEffectivenessEntry[];
}

function HorizontalBar({
  value1,
  value2,
  label1,
  label2,
  color1 = 'bg-team1',
  color2 = 'bg-secondary',
}: {
  value1: number;
  value2: number;
  label1: string;
  label2: string;
  color1?: string;
  color2?: string;
}) {
  const total = value1 + value2;
  const pct1 = total > 0 ? Math.round((value1 / total) * 100) : 50;
  const pct2 = 100 - pct1;

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium">{label1}: <strong>{value1}</strong></span>
        <span className="font-medium">{label2}: <strong>{value2}</strong></span>
      </div>
      <div className="flex h-4 rounded-full overflow-hidden bg-border/30">
        <AnimatedBar
          percentage={Math.max(pct1, 5)}
          color={`${color1} flex items-center justify-center text-[11px] font-bold text-black`}
          height="h-full"
        />
        <AnimatedBar
          percentage={Math.max(pct2, 5)}
          color={`${color2} flex items-center justify-center text-[11px] font-bold text-black`}
          height="h-full"
          delay={0.1}
        />
      </div>
    </div>
  );
}

function PlayerRatingBadge({ rating }: { rating: number }) {
  const color = rating >= 70 ? 'text-green-400 border-green-500/30 bg-green-500/10'
    : rating >= 40 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
    : 'text-red-400 border-red-500/30 bg-red-500/10';

  const label = rating >= 80 ? 'MVP' : rating >= 60 ? 'Bueno' : rating >= 40 ? 'Regular' : 'A mejorar';

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border ${color}`}>
      <span className="text-lg font-black">{rating}</span>
      <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
    </div>
  );
}

function computePlayerRating(match: Match, playerId: string): number {
  let winners = 0, errors = 0, totalShots = 0;
  let clutchWins = 0, clutchTotal = 0;

  for (const set of match.sets) {
    for (const game of set.games) {
      for (const point of game.points) {
        const isClutch = point.scoreBefore.includes('40') || point.scoreBefore.includes('Ad');
        for (const shot of point.shots) {
          if (shot.player !== playerId) continue;
          totalShots++;
          if (shot.status === 'W') winners++;
          if (shot.status === 'X' || shot.status === 'DF') errors++;
        }
        if (isClutch) {
          clutchTotal++;
          const lastShot = point.shots[point.shots.length - 1];
          if (lastShot?.player === playerId && lastShot.status === 'W') clutchWins++;
        }
      }
    }
  }

  if (totalShots === 0) return 50;

  // Base score from winners/errors ratio
  const winnerRate = winners / totalShots;
  const errorRate = errors / totalShots;
  let score = 50 + (winnerRate * 100) - (errorRate * 80);

  // Clutch bonus
  if (clutchTotal > 0) {
    score += (clutchWins / clutchTotal) * 15;
  }

  // Volume bonus
  score += Math.min(totalShots / 20, 10);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function computeClutchStats(match: Match) {
  let breakPointsTotal = 0, breakPointsWon = { team1: 0, team2: 0 };
  let setPointsTotal = 0, setPointsWon = { team1: 0, team2: 0 };

  for (const set of match.sets) {
    for (const game of set.games) {
      for (const point of game.points) {
        const score = point.scoreBefore;
        const server = point.server;
        const serverTeam = (server === 'J1' || server === 'J2') ? 'team1' : 'team2';
        const returnerTeam = serverTeam === 'team1' ? 'team2' : 'team1';

        // Break point detection
        const parts = score.split('-');
        if (parts.length === 2) {
          const returnerScore = serverTeam === 'team1' ? parts[1] : parts[0];
          const serverScore = serverTeam === 'team1' ? parts[0] : parts[1];
          if ((returnerScore === '40' || returnerScore === 'Ad') && serverScore !== 'Ad') {
            breakPointsTotal++;
            if (point.winner === returnerTeam) {
              breakPointsWon[returnerTeam]++;
            }
          }
        }
      }
    }
  }

  return { breakPointsTotal, breakPointsWon };
}

export function StatsOverview({ stats, team1Name, team2Name, match, shotEffectiveness }: StatsOverviewProps) {
  const totalPoints = stats.totalPoints;
  const team1Winners = stats.winners.team1 || 0;
  const team2Winners = stats.winners.team2 || 0;
  const totalWinners = team1Winners + team2Winners;
  const effectivenessTotal = stats.totalShots > 0
    ? Math.round((totalWinners / stats.totalShots) * 100)
    : 0;

  const team1Errors = stats.errors.team1 || 0;
  const team2Errors = stats.errors.team2 || 0;

  const insights = match
    ? generateInsights({ match, stats, shotEffectiveness })
    : [];

  // Player ratings
  const playerRatings = match ? match.teams.flatMap((team, teamIdx) =>
    team.players.map(p => ({
      ...p,
      teamIdx,
      rating: computePlayerRating(match, p.id),
    }))
  ).sort((a, b) => b.rating - a.rating) : [];

  // Clutch stats
  const clutch = match ? computeClutchStats(match) : null;

  return (
    <TooltipProvider delayDuration={300}>
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="gradient-border">
          <div className="bg-card rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-primary">{totalPoints}</div>
            <div className="text-xs text-muted-foreground mt-1 font-medium">Puntos Jugados</div>
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="gradient-border cursor-help">
              <div className="bg-card rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-green-400">{effectivenessTotal}%</div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">Efectividad</div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>Winners / Total golpes ({totalWinners}/{stats.totalShots})</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="gradient-border cursor-help">
              <div className="bg-card rounded-xl p-4 text-center">
                <div className="text-2xl font-black">{stats.avgShotsPerPoint}</div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">Golpes/Punto</div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>Promedio de golpes por punto jugado</TooltipContent>
        </Tooltip>
      </div>

      {/* Player Ratings */}
      {playerRatings.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold mb-3">Rating de Jugadores</h3>
          <div className="grid grid-cols-2 gap-2">
            {playerRatings.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 bg-background/50 rounded-lg p-2.5 border border-border/30">
                {i === 0 && (
                  <span className="text-[11px] font-black text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">MVP</span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${p.teamIdx === 0 ? 'bg-team1' : 'bg-secondary'}`} />
                    <span className="text-xs font-bold truncate">{p.name}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{p.id}</span>
                </div>
                <PlayerRatingBadge rating={p.rating} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Winners & Errors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card>
          <h3 className="text-sm font-semibold mb-3">Winners</h3>
          <HorizontalBar
            value1={team1Winners}
            value2={team2Winners}
            label1={team1Name}
            label2={team2Name}
          />
        </Card>

        <Card>
          <h3 className="text-sm font-semibold mb-3">Errores No Forzados</h3>
          <HorizontalBar
            value1={team1Errors}
            value2={team2Errors}
            label1={team1Name}
            label2={team2Name}
            color1="bg-red-500"
            color2="bg-red-700"
          />
        </Card>
      </div>

      {/* Clutch Stats / Key Moments */}
      {clutch && clutch.breakPointsTotal > 0 && (
        <Card>
          <h3 className="text-sm font-semibold mb-3">Momentos Clave</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center bg-background/50 rounded-lg p-2.5 border border-border/30">
              <div className="text-xl font-black text-amber-400">{clutch.breakPointsTotal}</div>
              <div className="text-xs text-muted-foreground font-medium">Break Points</div>
            </div>
            <div className="text-center bg-background/50 rounded-lg p-2.5 border border-green-500/10">
              <div className="text-xl font-black text-green-400">{clutch.breakPointsWon.team1}</div>
              <div className="text-xs text-muted-foreground font-medium">Breaks {team1Name}</div>
            </div>
            <div className="text-center bg-background/50 rounded-lg p-2.5 border border-blue-500/10">
              <div className="text-xl font-black text-blue-400">{clutch.breakPointsWon.team2}</div>
              <div className="text-xs text-muted-foreground font-medium">Breaks {team2Name}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="text-lg font-black">{stats.totalShots}</div>
          <div className="text-xs text-muted-foreground font-medium">Golpes Totales</div>
        </Card>
        <Card>
          <div className="text-lg font-black">{stats.intermediateZoneHits}</div>
          <div className="text-xs text-muted-foreground font-medium">Botes en Lineas</div>
        </Card>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold mb-2">Insights</h3>
          <div className="space-y-1.5">
            {insights.map((insight, i) => (
              <div key={i} className="flex gap-2 text-xs">
                <span className="text-primary flex-shrink-0 font-bold">&#9656;</span>
                <span className="text-muted-foreground">{insight}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
    </TooltipProvider>
  );
}
