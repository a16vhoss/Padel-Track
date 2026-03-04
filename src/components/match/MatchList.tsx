'use client';

import Link from 'next/link';
import { Match } from '@/types/match';
import { MatchCard } from './MatchCard';
import { Button } from '@/components/ui/Button';

interface MatchListProps {
  matches: Match[];
  onDelete?: (id: string) => void;
}

export function MatchList({ matches, onDelete }: MatchListProps) {
  if (matches.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mx-auto opacity-30">
          <circle cx="32" cy="28" r="12" stroke="currentColor" strokeWidth="2" />
          <line x1="32" y1="40" x2="32" y2="56" stroke="currentColor" strokeWidth="2" />
          <line x1="24" y1="56" x2="40" y2="56" stroke="currentColor" strokeWidth="2" />
          <circle cx="32" cy="28" r="3" fill="currentColor" opacity="0.3" />
          <path d="M20 20 L44 36" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
        <div>
          <p className="text-lg text-muted mb-1">No hay partidos registrados</p>
          <p className="text-sm text-muted/70">Crea tu primer partido para empezar a registrar golpes y analizar el juego</p>
        </div>
        <Link href="/partido/nuevo">
          <Button size="lg">Crear primer partido</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-3 animate-stagger">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} onDelete={onDelete} />
      ))}
    </div>
  );
}
