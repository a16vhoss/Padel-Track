'use client';

import Link from 'next/link';
import { Match } from '@/types/match';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
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

  return (
    <Link href={`/partido/${match.id}/registro`}>
      <Card hover className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Badge variant={statusVariants[match.status]}>
            {statusLabels[match.status]}
          </Badge>
          <span className="text-xs text-muted">
            {new Date(match.createdAt).toLocaleDateString('es-ES')}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-team1" />
            <span className="text-sm font-medium">
              {match.teams[0].players.map((p) => p.shortName).join(' / ')}
            </span>
          </div>
          {setsDisplay && <span className="font-mono text-sm">{setsDisplay}</span>}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {match.teams[1].players.map((p) => p.shortName).join(' / ')}
            </span>
            <span className="w-2 h-2 rounded-full bg-secondary" />
          </div>
        </div>

        {match.winner && (
          <div className="text-xs text-primary">
            Ganador: {match.teams[match.winner === 'team1' ? 0 : 1].name}
          </div>
        )}
      </Card>
    </Link>
  );
}
