'use client';

import { Match } from '@/types/match';
import { MatchCard } from './MatchCard';

interface MatchListProps {
  matches: Match[];
  onDelete?: (id: string) => void;
}

export function MatchList({ matches, onDelete }: MatchListProps) {
  if (matches.length === 0) {
    return (
      <div className="text-center py-12 text-muted">
        <p className="text-lg mb-2">No hay partidos registrados</p>
        <p className="text-sm">Crea un nuevo partido para empezar a registrar</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} onDelete={onDelete} />
      ))}
    </div>
  );
}
