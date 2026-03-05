'use client';

import { useEffect, useState, useMemo } from 'react';
import { useLeagueStore } from '@/stores/leagueStore';
import { useHistoryStore } from '@/stores/historyStore';
import { LeagueCard } from '@/components/league/LeagueCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { v4 as uuidv4 } from 'uuid';
import type { LeagueTeam, LeaguePlayer } from '@/types/league';

export default function LigasPage() {
  const { leagues, loadAll, createLeague, deleteLeague, addTeamToLeague } = useLeagueStore();
  const { matches, loadAll: loadMatches } = useHistoryStore();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [format, setFormat] = useState<'league' | 'tournament'>('league');

  // Add team form
  const [addingTeamLeagueId, setAddingTeamLeagueId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState('');
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');

  useEffect(() => {
    loadAll();
    loadMatches();
  }, [loadAll, loadMatches]);

  // Build map of leagueId -> matches
  const matchesByLeague = useMemo(() => {
    const map: Record<string, typeof matches> = {};
    for (const match of matches) {
      if (match.leagueId) {
        if (!map[match.leagueId]) map[match.leagueId] = [];
        map[match.leagueId].push(match);
      }
    }
    return map;
  }, [matches]);

  const handleCreate = () => {
    if (!name.trim()) return;
    createLeague(name.trim(), format, []);
    setName('');
    setShowCreate(false);
  };

  const handleAddTeam = (leagueId: string) => {
    if (!teamName.trim() || !player1Name.trim() || !player2Name.trim()) return;
    const team: LeagueTeam = {
      id: uuidv4(),
      name: teamName.trim(),
      players: [
        { id: uuidv4(), name: player1Name.trim(), shortName: player1Name.trim().slice(0, 3) },
        { id: uuidv4(), name: player2Name.trim(), shortName: player2Name.trim().slice(0, 3) },
      ],
    };
    addTeamToLeague(leagueId, team);
    setTeamName('');
    setPlayer1Name('');
    setPlayer2Name('');
    setAddingTeamLeagueId(null);
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
          <div key={league.id} className="space-y-2">
            <LeagueCard
              league={league}
              matches={matchesByLeague[league.id] || []}
              onDelete={() => {
                if (window.confirm('Seguro que quieres eliminar esta liga?')) {
                  deleteLeague(league.id);
                }
              }}
            />
            {addingTeamLeagueId === league.id ? (
              <Card>
                <h4 className="text-xs font-semibold mb-2">Agregar Equipo</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Nombre del equipo"
                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={player1Name}
                      onChange={(e) => setPlayer1Name(e.target.value)}
                      placeholder="Jugador 1"
                      className="bg-background border border-border rounded px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      value={player2Name}
                      onChange={(e) => setPlayer2Name(e.target.value)}
                      placeholder="Jugador 2"
                      className="bg-background border border-border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleAddTeam(league.id)}>Agregar</Button>
                    <Button variant="ghost" onClick={() => setAddingTeamLeagueId(null)}>Cancelar</Button>
                  </div>
                </div>
              </Card>
            ) : (
              <button
                onClick={() => setAddingTeamLeagueId(league.id)}
                className="text-xs text-primary hover:underline"
              >
                + Agregar equipo
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
