'use client';

import { Card } from '@/components/ui/Card';
import { Match } from '@/types/match';

interface PlayerComparisonProps {
  match: Match;
  shotsByPlayer: Record<string, number>;
}

export function PlayerComparison({ match, shotsByPlayer }: PlayerComparisonProps) {
  const allPlayers = [
    ...match.teams[0].players.map((p) => ({ ...p, teamIndex: 0 })),
    ...match.teams[1].players.map((p) => ({ ...p, teamIndex: 1 })),
  ];

  const maxShots = Math.max(...Object.values(shotsByPlayer), 1);

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Comparacion por Jugador</h3>
      <div className="grid grid-cols-2 gap-3">
        {allPlayers.map((player) => {
          const shots = shotsByPlayer[player.id] || 0;
          const pct = Math.round((shots / maxShots) * 100);
          const teamColor = player.teamIndex === 0 ? 'bg-team1' : 'bg-secondary';

          return (
            <Card key={player.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-3 h-3 rounded-full ${teamColor}`} />
                <span className="text-sm font-medium">{player.name}</span>
                <span className="text-xs text-muted ml-auto">{player.id}</span>
              </div>
              <div className="text-2xl font-bold">{shots}</div>
              <div className="text-xs text-muted">golpes</div>
              <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className={`h-full ${teamColor} rounded-full transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
