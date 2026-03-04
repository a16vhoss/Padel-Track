'use client';

import { Badge } from '@/components/ui/Badge';

interface ScoreboardProps {
  team1Name: string;
  team2Name: string;
  sets: Array<{ team1: number; team2: number }>;
  currentGame: { team1: string; team2: string };
  server: string;
  serveSide: string;
  team1Color?: string;
  team2Color?: string;
}

export function Scoreboard({
  team1Name,
  team2Name,
  sets,
  currentGame,
  server,
  serveSide,
}: ScoreboardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted">Marcador</h3>
        <div className="flex items-center gap-2">
          <Badge variant="accent">Saque: {server}</Badge>
          <Badge variant="muted">{serveSide === 'derecha' ? 'Der' : 'Izq'}</Badge>
        </div>
      </div>

      <table className="w-full text-center">
        <thead>
          <tr className="text-xs text-muted">
            <th className="text-left py-1">Equipo</th>
            {sets.map((_, i) => (
              <th key={i} className="py-1 w-12">S{i + 1}</th>
            ))}
            <th className="py-1 w-16">Game</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-border">
            <td className="text-left py-2 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-team1 mr-2" />
              {team1Name}
            </td>
            {sets.map((s, i) => (
              <td key={i} className="py-2 font-mono text-lg">{s.team1}</td>
            ))}
            <td className="py-2 font-mono text-lg font-bold text-primary">
              {currentGame.team1}
            </td>
          </tr>
          <tr className="border-t border-border">
            <td className="text-left py-2 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-secondary mr-2" />
              {team2Name}
            </td>
            {sets.map((s, i) => (
              <td key={i} className="py-2 font-mono text-lg">{s.team2}</td>
            ))}
            <td className="py-2 font-mono text-lg font-bold text-secondary">
              {currentGame.team2}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
