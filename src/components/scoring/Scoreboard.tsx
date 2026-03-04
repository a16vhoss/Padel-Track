'use client';

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
  const isTeam1Serving = server === 'J1' || server === 'J2';

  return (
    <div className="scoreboard-broadcast rounded-xl overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 border-b border-white/5">
        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">En Vivo</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-muted font-medium">
            {serveSide === 'derecha' ? 'Deuce' : 'Ad'}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 serve-indicator" />
        </div>
      </div>

      {/* Team rows */}
      <div className="divide-y divide-white/5">
        {/* Team 1 */}
        <div className={`flex items-center ${isTeam1Serving ? 'bg-team1/5' : ''}`}>
          {/* Team color bar */}
          <div className="w-1 self-stretch bg-team1" />

          {/* Serve indicator */}
          <div className="w-6 flex items-center justify-center flex-shrink-0">
            {isTeam1Serving && (
              <span className="w-2 h-2 rounded-full bg-team1 serve-indicator" />
            )}
          </div>

          {/* Team name */}
          <div className="flex-1 py-2.5 pr-2">
            <span className="text-sm font-bold truncate block">{team1Name}</span>
          </div>

          {/* Set scores */}
          {sets.map((s, i) => (
            <div
              key={i}
              className={`w-9 py-2.5 text-center font-mono text-base font-bold border-l border-white/5 ${
                s.team1 > s.team2 ? 'text-foreground' : 'text-muted'
              }`}
            >
              {s.team1}
            </div>
          ))}

          {/* Current game score */}
          <div className="w-14 py-2.5 text-center font-mono text-xl font-black text-primary border-l-2 border-primary/30 bg-primary/5">
            <span className="score-flip inline-block">{currentGame.team1}</span>
          </div>
        </div>

        {/* Team 2 */}
        <div className={`flex items-center ${!isTeam1Serving ? 'bg-secondary/5' : ''}`}>
          {/* Team color bar */}
          <div className="w-1 self-stretch bg-secondary" />

          {/* Serve indicator */}
          <div className="w-6 flex items-center justify-center flex-shrink-0">
            {!isTeam1Serving && (
              <span className="w-2 h-2 rounded-full bg-secondary serve-indicator" />
            )}
          </div>

          {/* Team name */}
          <div className="flex-1 py-2.5 pr-2">
            <span className="text-sm font-bold truncate block">{team2Name}</span>
          </div>

          {/* Set scores */}
          {sets.map((s, i) => (
            <div
              key={i}
              className={`w-9 py-2.5 text-center font-mono text-base font-bold border-l border-white/5 ${
                s.team2 > s.team1 ? 'text-foreground' : 'text-muted'
              }`}
            >
              {s.team2}
            </div>
          ))}

          {/* Current game score */}
          <div className="w-14 py-2.5 text-center font-mono text-xl font-black text-secondary border-l-2 border-secondary/30 bg-secondary/5">
            <span className="score-flip inline-block">{currentGame.team2}</span>
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center px-0 py-1 bg-white/[0.02] border-t border-white/5">
        <div className="w-1" />
        <div className="w-6" />
        <div className="flex-1 text-[9px] text-muted/60 font-medium pl-1">EQUIPO</div>
        {sets.map((_, i) => (
          <div key={i} className="w-9 text-center text-[9px] text-muted/60 font-medium">
            S{i + 1}
          </div>
        ))}
        <div className="w-14 text-center text-[9px] text-muted/60 font-bold">GAME</div>
      </div>
    </div>
  );
}
