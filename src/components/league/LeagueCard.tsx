'use client';

import { League } from '@/types/league';
import { Card } from '@/components/ui/Card';

interface LeagueCardProps {
  league: League;
  onDelete?: () => void;
  onClick?: () => void;
}

export function LeagueCard({ league, onDelete, onClick }: LeagueCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={onClick}>
        <div>
          <h3 className="text-sm font-semibold">{league.name}</h3>
          <p className="text-xs text-muted">
            {league.type === 'league' ? 'Liga' : 'Torneo'} - {league.teams.length} equipos - {league.matchIds.length} partidos
          </p>
        </div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
          league.status === 'active' ? 'bg-green-500/15 text-green-400' : 'bg-muted/15 text-muted'
        }`}>
          {league.status === 'active' ? 'Activa' : 'Finalizada'}
        </span>
      </div>

      {/* Standings */}
      {league.standings.length > 0 && (
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-border/30 text-muted">
              <th className="text-left py-1">Equipo</th>
              <th className="text-center py-1">PJ</th>
              <th className="text-center py-1">PG</th>
              <th className="text-center py-1">PP</th>
              <th className="text-center py-1">Pts</th>
            </tr>
          </thead>
          <tbody>
            {league.standings
              .sort((a, b) => b.points - a.points)
              .map((s) => (
                <tr key={s.teamId} className="border-b border-border/10">
                  <td className="py-1 font-medium">{s.teamName}</td>
                  <td className="text-center py-1">{s.played}</td>
                  <td className="text-center py-1 text-green-400">{s.won}</td>
                  <td className="text-center py-1 text-red-400">{s.lost}</td>
                  <td className="text-center py-1 font-bold">{s.points}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}

      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="mt-2 text-[10px] text-red-400 hover:text-red-300 transition-colors"
        >
          Eliminar liga
        </button>
      )}
    </Card>
  );
}
