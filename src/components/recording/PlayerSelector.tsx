'use client';

import { PlayerId } from '@/types/shot';
import { Player, Team } from '@/types/match';

interface PlayerSelectorProps {
  teams: [Team, Team];
  selected: PlayerId | null;
  onSelect: (id: PlayerId) => void;
}

export function PlayerSelector({ teams, selected, onSelect }: PlayerSelectorProps) {
  return (
    <div>
      <label className="text-xs text-muted block mb-2">Jugador</label>
      <div className="grid grid-cols-2 gap-3">
        {teams.map((team, teamIndex) => (
          <div
            key={team.id}
            className={`rounded-lg border-2 p-2 space-y-1.5 ${
              teamIndex === 0
                ? 'border-team1/30 bg-team1/5'
                : 'border-secondary/30 bg-secondary/5'
            }`}
          >
            <div className={`text-[10px] font-bold uppercase tracking-wider text-center ${
              teamIndex === 0 ? 'text-team1' : 'text-secondary'
            }`}>
              {team.name}
            </div>
            {team.players.map((player, playerIdx) => {
              const isSelected = selected === player.id;
              const teamColor = teamIndex === 0 ? 'border-team1 bg-team1/20' : 'border-secondary bg-secondary/20';
              const position = playerIdx === 0 ? 'Derecha' : 'Izquierda';

              return (
                <button
                  key={player.id}
                  onClick={() => onSelect(player.id)}
                  className={`
                    w-full flex items-center gap-2 p-2 rounded-md border-2 transition-all text-left
                    ${isSelected
                      ? `${teamColor} ring-1 ${teamIndex === 0 ? 'ring-team1' : 'ring-secondary'}`
                      : 'border-border hover:border-muted bg-card/50'
                    }
                  `}
                >
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-black ${
                    teamIndex === 0 ? 'bg-team1' : 'bg-secondary'
                  }`}>
                    {player.id.replace('J', '')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">{player.name}</div>
                    <div className="text-[10px] text-muted">{position} <span className="opacity-50">({player.id})</span></div>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
