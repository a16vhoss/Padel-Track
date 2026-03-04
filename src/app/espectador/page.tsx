'use client';

import { useEffect, useState } from 'react';
import { useHistoryStore } from '@/stores/historyStore';
import { SpectatorView } from '@/components/spectator/SpectatorView';
import { Card } from '@/components/ui/Card';
import type { Match } from '@/types/match';

export default function EspectadorPage() {
  const { matches, loadAll } = useHistoryStore();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Auto-select the most recent match
  useEffect(() => {
    if (matches.length > 0 && !selectedMatch) {
      setSelectedMatch(matches[0]);
    }
  }, [matches, selectedMatch]);

  if (matches.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <p className="text-center text-muted py-8">No hay partidos disponibles</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Modo Espectador</h1>
        <select
          value={selectedMatch?.id || ''}
          onChange={(e) => {
            const m = matches.find((m) => m.id === e.target.value);
            if (m) setSelectedMatch(m);
          }}
          className="bg-background border border-border rounded px-3 py-2 text-sm"
        >
          {matches.map((m) => (
            <option key={m.id} value={m.id}>
              {m.teams[0].name} vs {m.teams[1].name}
            </option>
          ))}
        </select>
      </div>
      {selectedMatch && <SpectatorView match={selectedMatch} />}
    </div>
  );
}
