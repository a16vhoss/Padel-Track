'use client';

import { PlayerId } from '@/types/shot';
import { Player, Team } from '@/types/match';

interface PlayerSelectorProps {
  teams: [Team, Team];
  selected: PlayerId | null;
  onSelect: (id: PlayerId) => void;
}

export function PlayerSelector({ teams, selected, onSelect }: PlayerSelectorProps) {
  const playerList: Array<{ player: Player; teamIndex: number }> = [
    { player: teams[0].players[0], teamIndex: 0 },
    { player: teams[0].players[1], teamIndex: 0 },
    { player: teams[1].players[0], teamIndex: 1 },
    { player: teams[1].players[1], teamIndex: 1 },
  ];

  return (
    <div>
      <label className="text-xs text-muted block mb-2">Jugador</label>
      <div className="grid grid-cols-4 gap-2">
        {playerList.map(({ player, teamIndex }) => {
          const isSelected = selected === player.id;
          const teamColor = teamIndex === 0 ? 'bg-team1' : 'bg-secondary';
          const teamColorLight = teamIndex === 0 ? 'bg-team1/20 border-team1' : 'bg-secondary/20 border-secondary';

          return (
            <button
              key={player.id}
              onClick={() => onSelect(player.id)}
              className={`
                flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all
                ${isSelected ? `${teamColorLight} border-2` : 'border-border hover:border-muted'}
              `}
            >
              <span className={`w-6 h-6 rounded-full ${teamColor} flex items-center justify-center text-xs font-bold text-black`}>
                {player.id.replace('J', '')}
              </span>
              <span className="text-xs font-medium truncate w-full text-center">
                {player.shortName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
