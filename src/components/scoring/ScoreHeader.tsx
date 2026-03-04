'use client';

interface ScoreHeaderProps {
  team1Name: string;
  team2Name: string;
  sets: Array<{ team1: number; team2: number }>;
  currentGame: { team1: string; team2: string };
  server: string;
}

export function ScoreHeader({
  team1Name,
  team2Name,
  sets,
  currentGame,
  server,
}: ScoreHeaderProps) {
  return (
    <div className="flex items-center justify-center gap-4 bg-card border-b border-border px-4 py-2">
      {/* Team 1 */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-team1" />
        <span className="text-sm font-medium truncate max-w-[120px]">{team1Name}</span>
      </div>

      {/* Sets */}
      <div className="flex items-center gap-2 font-mono">
        {sets.map((s, i) => (
          <div key={i} className="flex flex-col items-center text-sm">
            <span className="text-[10px] text-muted">S{i + 1}</span>
            <span>{s.team1}-{s.team2}</span>
          </div>
        ))}
        <div className="flex flex-col items-center text-base font-bold border-l border-border pl-2">
          <span className="text-[10px] text-muted">Game</span>
          <span>
            <span className="text-primary">{currentGame.team1}</span>
            {'-'}
            <span className="text-secondary">{currentGame.team2}</span>
          </span>
        </div>
      </div>

      {/* Team 2 */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium truncate max-w-[120px]">{team2Name}</span>
        <span className="w-2 h-2 rounded-full bg-secondary" />
      </div>

      {/* Server indicator */}
      <span className="text-xs text-accent ml-2">Saque: {server}</span>
    </div>
  );
}
