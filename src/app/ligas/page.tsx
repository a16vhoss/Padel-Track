'use client';

import { useLeagueStore } from '@/stores/leagueStore';
import { LeagueCard } from '@/components/league/LeagueCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useState } from 'react';

export default function LigasPage() {
  const { leagues, createLeague } = useLeagueStore();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [format, setFormat] = useState<'league' | 'tournament'>('league');

  const handleCreate = () => {
    if (!name.trim()) return;
    createLeague(name.trim(), format, []);
    setName('');
    setShowCreate(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ligas y Torneos</h1>
        <Button onClick={() => setShowCreate(!showCreate)}>Nueva Liga</Button>
      </div>

      {showCreate && (
        <Card>
          <h3 className="text-sm font-semibold mb-3">Crear Liga</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de la liga"
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
            />
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as typeof format)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
            >
              <option value="league">Liga</option>
              <option value="tournament">Torneo</option>
            </select>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>Crear</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
            </div>
          </div>
        </Card>
      )}

      {leagues.length === 0 ? (
        <Card>
          <p className="text-center text-muted py-8">No hay ligas creadas aun</p>
        </Card>
      ) : (
        leagues.map((league) => (
          <LeagueCard key={league.id} league={league} />
        ))
      )}
    </div>
  );
}
