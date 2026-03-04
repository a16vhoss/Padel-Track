'use client';

import { useEffect } from 'react';
import { useHistoryStore } from '@/stores/historyStore';
import { MatchList } from '@/components/match/MatchList';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  const { matches, loadAll } = useHistoryStore();

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Partidos</h1>
          <p className="text-sm text-muted mt-1">Registro y analisis tactico de padel</p>
        </div>
        <Link href="/partido/nuevo">
          <Button size="lg">Nuevo Partido</Button>
        </Link>
      </div>

      <MatchList matches={matches} />
    </div>
  );
}
