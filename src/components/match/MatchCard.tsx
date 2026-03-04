'use client';

import Link from 'next/link';
import { Match } from '@/types/match';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { relativeTime, formatDuration } from '@/lib/utils/relativeTime';

interface MatchCardProps {
  match: Match;
  onDelete?: (id: string) => void;
}

export function MatchCard({ match, onDelete }: MatchCardProps) {
  const statusLabels: Record<string, string> = {
    setup: 'Configurando',
    live: 'En Vivo',
    finished: 'Finalizado',
  };

  const statusVariants: Record<string, 'primary' | 'accent' | 'muted'> = {
    setup: 'muted',
    live: 'accent',
    finished: 'primary',
  };

  const setsDisplay = match.sets
    .filter((s) => s.games.length > 0)
    .map((s) => `${s.score.team1}-${s.score.team2}`)
    .join(' / ');

  const totalPoints = match.sets.reduce(
    (sum, s) => sum + s.games.reduce((gSum, g) => gSum + g.points.length, 0),
    0
  );

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && window.confirm('Seguro que quieres borrar este partido? Esta accion no se puede deshacer.')) {
      onDelete(match.id);
    }
  };

  const href = match.status === 'finished'
    ? `/partido/${match.id}/estadisticas`
    : `/partido/${match.id}/registro`;

  return (
    <Link href={href}>
      <Card hover className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={statusVariants[match.status]}>
              {statusLabels[match.status]}
            </Badge>
            {match.status === 'live' && (
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">
              {relativeTime(match.createdAt)}
            </span>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="text-muted hover:text-danger transition-colors p-1 rounded hover:bg-danger/10"
                title="Borrar partido"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-team1" />
            <span className="text-sm font-medium">
              {match.teams[0].players.map((p) => p.shortName).join(' / ')}
            </span>
          </div>
          {setsDisplay && (
            <span className="font-mono text-sm font-semibold tracking-wide">{setsDisplay}</span>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {match.teams[1].players.map((p) => p.shortName).join(' / ')}
            </span>
            <span className="w-2 h-2 rounded-full bg-secondary" />
          </div>
        </div>

        {/* Footer: winner + stats */}
        <div className="flex items-center justify-between pt-1 border-t border-border/50">
          {match.winner ? (
            <span className="text-xs text-primary font-medium">
              Ganador: {match.teams[match.winner === 'team1' ? 0 : 1].name}
            </span>
          ) : (
            <span className="text-xs text-muted">En curso</span>
          )}
          <div className="flex items-center gap-3 text-xs text-muted">
            {totalPoints > 0 && (
              <span>{totalPoints} pts</span>
            )}
            {match.totalDurationMs && match.totalDurationMs > 0 && (
              <span>{formatDuration(match.totalDurationMs)}</span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
