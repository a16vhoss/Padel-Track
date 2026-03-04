'use client';

import { Card } from '@/components/ui/Card';
import { Match } from '@/types/match';

interface PlayerComparisonProps {
  match: Match;
  shotsByPlayer: Record<string, number>;
}

function H2HBar({ label, value1, value2, team1Name, team2Name, format }: {
  label: string;
  value1: number;
  value2: number;
  team1Name: string;
  team2Name: string;
  format?: (v: number) => string;
}) {
  const total = value1 + value2;
  const pct1 = total > 0 ? (value1 / total) * 100 : 50;
  const formatVal = format || ((v: number) => String(v));
  const winner = value1 > value2 ? 'team1' : value2 > value1 ? 'team2' : 'tie';

  return (
    <div className="flex items-center gap-2 py-1.5">
      {/* Team 1 value */}
      <span className={`text-xs font-bold w-10 text-right ${winner === 'team1' ? 'text-green-400' : 'text-muted'}`}>
        {formatVal(value1)}
      </span>

      {/* Bar */}
      <div className="flex-1 flex h-3 bg-border/30 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500 rounded-l-full"
          style={{ width: `${pct1}%` }}
        />
        <div
          className="bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500 rounded-r-full"
          style={{ width: `${100 - pct1}%` }}
        />
      </div>

      {/* Team 2 value */}
      <span className={`text-xs font-bold w-10 text-left ${winner === 'team2' ? 'text-blue-400' : 'text-muted'}`}>
        {formatVal(value2)}
      </span>

      {/* Label (centered overlay) */}
      <span className="absolute left-1/2 -translate-x-1/2 text-[9px] font-bold text-white/70 pointer-events-none mix-blend-difference">
        {label}
      </span>
    </div>
  );
}

export function PlayerComparison({ match, shotsByPlayer }: PlayerComparisonProps) {
  const team1Players = match.teams[0].players;
  const team2Players = match.teams[1].players;
  const team1Name = match.teams[0].name;
  const team2Name = match.teams[1].name;

  // Aggregate team stats
  const team1Shots = team1Players.reduce((sum, p) => sum + (shotsByPlayer[p.id] || 0), 0);
  const team2Shots = team2Players.reduce((sum, p) => sum + (shotsByPlayer[p.id] || 0), 0);

  // Count winners and errors from points
  let team1Winners = 0, team2Winners = 0, team1Errors = 0, team2Errors = 0;
  for (const set of match.sets) {
    for (const game of set.games) {
      for (const point of game.points) {
        for (const shot of point.shots) {
          const isTeam1 = shot.player === 'J1' || shot.player === 'J2';
          if (shot.status === 'W') {
            if (isTeam1) team1Winners++; else team2Winners++;
          }
          if (shot.status === 'X' || shot.status === 'DF') {
            if (isTeam1) team1Errors++; else team2Errors++;
          }
        }
      }
    }
  }

  const totalPoints = match.sets.reduce(
    (sum, s) => sum + s.games.reduce((gSum, g) => gSum + g.points.length, 0), 0
  );
  const team1PointsWon = match.sets.reduce(
    (sum, s) => sum + s.games.reduce(
      (gSum, g) => gSum + g.points.filter(p => p.winner === 'team1').length, 0
    ), 0
  );
  const team2PointsWon = totalPoints - team1PointsWon;

  const maxShots = Math.max(...Object.values(shotsByPlayer), 1);

  return (
    <div className="space-y-4">
      {/* Head-to-Head comparison */}
      <Card>
        <h3 className="text-sm font-semibold mb-4">Head-to-Head</h3>

        {/* Team headers */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-team1" />
            <span className="text-xs font-bold">{team1Name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold">{team2Name}</span>
            <span className="w-3 h-3 rounded-full bg-secondary" />
          </div>
        </div>

        {/* Comparison bars */}
        <div className="space-y-1">
          <div className="relative">
            <H2HBar label="Puntos" value1={team1PointsWon} value2={team2PointsWon} team1Name={team1Name} team2Name={team2Name} />
          </div>
          <div className="relative">
            <H2HBar label="Golpes" value1={team1Shots} value2={team2Shots} team1Name={team1Name} team2Name={team2Name} />
          </div>
          <div className="relative">
            <H2HBar label="Winners" value1={team1Winners} value2={team2Winners} team1Name={team1Name} team2Name={team2Name} />
          </div>
          <div className="relative">
            <H2HBar label="Errores" value1={team1Errors} value2={team2Errors} team1Name={team1Name} team2Name={team2Name} />
          </div>
          {(team1Shots > 0 || team2Shots > 0) && (
            <div className="relative">
              <H2HBar
                label="Efectividad"
                value1={team1Shots > 0 ? Math.round((team1Winners / team1Shots) * 100) : 0}
                value2={team2Shots > 0 ? Math.round((team2Winners / team2Shots) * 100) : 0}
                team1Name={team1Name}
                team2Name={team2Name}
                format={(v) => `${v}%`}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Per-player breakdown */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Por Jugador</h3>
        <div className="grid grid-cols-2 gap-3">
          {[...team1Players, ...team2Players].map((player) => {
            const shots = shotsByPlayer[player.id] || 0;
            const pct = Math.round((shots / maxShots) * 100);
            const isTeam1 = team1Players.includes(player);
            const teamColor = isTeam1 ? 'bg-team1' : 'bg-secondary';
            const teamColorText = isTeam1 ? 'text-green-400' : 'text-blue-400';

            return (
              <Card key={player.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-3 h-3 rounded-full ${teamColor}`} />
                  <span className="text-sm font-bold">{player.name}</span>
                  <span className="text-[10px] text-muted ml-auto bg-background/50 px-1.5 py-0.5 rounded">{player.id}</span>
                </div>
                <div className={`text-2xl font-black ${teamColorText}`}>{shots}</div>
                <div className="text-[10px] text-muted">golpes totales</div>
                <div className="mt-2 h-2 bg-border/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${teamColor} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
