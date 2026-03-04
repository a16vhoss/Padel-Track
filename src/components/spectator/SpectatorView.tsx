'use client';

import { Match } from '@/types/match';
import { MatchScore } from '@/types/scoring';
import { Card } from '@/components/ui/Card';

interface SpectatorViewProps {
  match: Match;
  scoring?: MatchScore;
}

export function SpectatorView({ match, scoring }: SpectatorViewProps) {
  const sets = match.sets.map((s) => ({
    team1: s.score.team1,
    team2: s.score.team2,
  }));

  const allPoints = match.sets.flatMap((s) => s.games.flatMap((g) => g.points));
  const lastPoints = allPoints.slice(-5).reverse();

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Big scoreboard */}
      <Card>
        <div className="text-center mb-4">
          <span className={`text-[10px] uppercase tracking-widest ${match.status === 'live' ? 'text-green-400' : 'text-muted'}`}>
            {match.status === 'live' ? 'EN VIVO' : match.status === 'finished' ? 'FINALIZADO' : 'ESPERANDO'}
          </span>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
          <div className="text-right">
            <div className="text-xl font-bold">{match.teams[0].name}</div>
          </div>
          <div className="text-center text-muted text-sm">vs</div>
          <div className="text-left">
            <div className="text-xl font-bold">{match.teams[1].name}</div>
          </div>
        </div>

        {/* Sets */}
        <div className="mt-4 flex justify-center gap-4">
          {sets.map((set, i) => (
            <div key={i} className="text-center">
              <div className="text-[10px] text-muted mb-0.5">Set {i + 1}</div>
              <div className="text-2xl font-black">
                <span className={set.team1 > set.team2 ? 'text-green-400' : ''}>{set.team1}</span>
                <span className="text-muted mx-1">-</span>
                <span className={set.team2 > set.team1 ? 'text-blue-400' : ''}>{set.team2}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Current game */}
        {!scoring.isFinished && (
          <div className="mt-4 text-center">
            <div className="text-[10px] text-muted mb-1">Juego Actual</div>
            <div className="text-4xl font-black">
              <span className="text-green-400">{scoring.currentGame.team1}</span>
              <span className="text-muted mx-2">-</span>
              <span className="text-blue-400">{scoring.currentGame.team2}</span>
            </div>
            <div className="text-xs text-muted mt-1">
              Saca: {scoring.server} ({scoring.serveSide})
            </div>
          </div>
        )}

        {match.winner && (
          <div className="mt-4 text-center">
            <div className="text-2xl font-black text-amber-400">
              {match.winner === 'team1' ? match.teams[0].name : match.teams[1].name} GANA!
            </div>
          </div>
        )}
      </Card>

      {/* Recent points */}
      {lastPoints.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold mb-2">Ultimos Puntos</h3>
          <div className="space-y-1">
            {lastPoints.map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-xs py-1 border-b border-border/10 last:border-0">
                <span className={`w-2 h-2 rounded-full ${p.winner === 'team1' ? 'bg-green-400' : 'bg-blue-400'}`} />
                <span className="text-muted">#{p.pointNumber}</span>
                <span className="flex-1 font-mono text-[10px] truncate">{p.notation}</span>
                <span className="text-muted">{p.scoreBefore}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
