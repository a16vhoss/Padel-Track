'use client';

import Link from 'next/link';
import { League } from '@/types/league';
import { Match } from '@/types/match';
import { Card } from '@/components/ui/Card';

interface LeagueCardProps {
  league: League;
  matches?: Match[];
  onDelete?: () => void;
  onClick?: () => void;
}

export function LeagueCard({ league, matches = [], onDelete, onClick }: LeagueCardProps) {
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

      {/* Linked matches */}
      {matches.length > 0 && (
        <div className="mt-3 border-t border-border/20 pt-2">
          <h4 className="text-[10px] text-muted font-semibold mb-1">Partidos</h4>
          <div className="space-y-1">
            {matches.map((m) => (
              <Link
                key={m.id}
                href={m.status === 'finished' ? `/partido/${m.id}/estadisticas` : `/partido/${m.id}/registro`}
                className="flex items-center justify-between text-[11px] hover:bg-border/10 rounded px-1 py-0.5 transition-colors"
              >
                <span>
                  {m.teams[0].name} vs {m.teams[1].name}
                </span>
                <span className={`text-[10px] ${m.status === 'finished' ? 'text-primary' : 'text-accent'}`}>
                  {m.status === 'finished' ? 'Ver stats' : 'En vivo'}
                </span>
              </Link>
            ))}
          </div>
        </div>
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
