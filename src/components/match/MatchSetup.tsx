'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Match, Player, Team, MatchConfig } from '@/types/match';
import { PlayerId } from '@/types/shot';
import { saveMatch } from '@/lib/persistence/storage';
import { useLeagueStore } from '@/stores/leagueStore';

export function MatchSetup() {
  const router = useRouter();
  const { leagues, loadAll: loadLeagues, addMatchToLeague } = useLeagueStore();
  const [players, setPlayers] = useState<Record<PlayerId, string>>({
    J1: '',
    J2: '',
    J3: '',
    J4: '',
  });
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');
  const [goldenPoint, setGoldenPoint] = useState(true);
  const [selectedLeagueId, setSelectedLeagueId] = useState('');

  useEffect(() => {
    loadLeagues();
  }, [loadLeagues]);

  const getShortName = (name: string): string => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.slice(0, 3);
  };

  const handleCreate = () => {
    const mkPlayer = (id: PlayerId): Player => ({
      id,
      name: players[id] || id,
      shortName: getShortName(players[id]) || id,
    });

    const team1: Team = {
      id: 'team1',
      name: team1Name || `${mkPlayer('J1').shortName}/${mkPlayer('J2').shortName}`,
      players: [mkPlayer('J1'), mkPlayer('J2')],
      color: '#22c55e',
    };

    const team2: Team = {
      id: 'team2',
      name: team2Name || `${mkPlayer('J3').shortName}/${mkPlayer('J4').shortName}`,
      players: [mkPlayer('J3'), mkPlayer('J4')],
      color: '#3b82f6',
    };

    const config: MatchConfig = {
      setsToWin: 2,
      goldenPoint,
      tiebreakAt: 6,
    };

    const match: Match = {
      id: uuidv4(),
      teams: [team1, team2],
      sets: [
        {
          id: uuidv4(),
          setNumber: 1,
          games: [],
          winner: null,
          score: { team1: 0, team2: 0 },
          hasTiebreak: false,
        },
      ],
      config,
      status: 'live',
      currentSet: 0,
      currentGame: 0,
      winner: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...(selectedLeagueId ? { leagueId: selectedLeagueId } : {}),
    };

    saveMatch(match);
    if (selectedLeagueId) {
      addMatchToLeague(selectedLeagueId, match.id);
    }
    router.push(`/partido/${match.id}/registro`);
  };

  const canCreate = players.J1 && players.J2 && players.J3 && players.J4;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Nuevo Partido</h1>
      <p className="text-sm text-muted">
        Configura los 2 equipos de 2 jugadores. J1 y J2 forman el Equipo 1, J3 y J4 el Equipo 2.
        Los jugadores impares (J1, J3) juegan por la derecha y los pares (J2, J4) por la izquierda.
      </p>

      {/* Team 1 */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-3 h-3 rounded-full bg-team1" />
          <h2 className="font-semibold">Equipo 1</h2>
        </div>
        <input
          placeholder="Nombre del equipo (opcional)"
          value={team1Name}
          onChange={(e) => setTeam1Name(e.target.value)}
          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted block mb-1">J1 - Derecha</label>
            <input
              placeholder="Nombre jugador 1"
              value={players.J1}
              onChange={(e) => setPlayers({ ...players, J1: e.target.value })}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">J2 - Izquierda</label>
            <input
              placeholder="Nombre jugador 2"
              value={players.J2}
              onChange={(e) => setPlayers({ ...players, J2: e.target.value })}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </Card>

      {/* Team 2 */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-3 h-3 rounded-full bg-secondary" />
          <h2 className="font-semibold">Equipo 2</h2>
        </div>
        <input
          placeholder="Nombre del equipo (opcional)"
          value={team2Name}
          onChange={(e) => setTeam2Name(e.target.value)}
          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted block mb-1">J3 - Derecha</label>
            <input
              placeholder="Nombre jugador 3"
              value={players.J3}
              onChange={(e) => setPlayers({ ...players, J3: e.target.value })}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">J4 - Izquierda</label>
            <input
              placeholder="Nombre jugador 4"
              value={players.J4}
              onChange={(e) => setPlayers({ ...players, J4: e.target.value })}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </Card>

      {/* Liga */}
      {leagues.filter((l) => l.status === 'active').length > 0 && (
        <Card>
          <h2 className="font-semibold mb-3">Liga (opcional)</h2>
          <select
            value={selectedLeagueId}
            onChange={(e) => setSelectedLeagueId(e.target.value)}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Sin liga</option>
            {leagues
              .filter((l) => l.status === 'active')
              .map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
          </select>
        </Card>
      )}

      {/* Config */}
      <Card>
        <h2 className="font-semibold mb-3">Configuracion</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={goldenPoint}
            onChange={(e) => setGoldenPoint(e.target.checked)}
            className="rounded border-border"
          />
          Punto de oro (sin ventaja)
        </label>
        <p className="text-[11px] text-muted mt-1 ml-6">
          Con punto de oro, a 40-40 se juega un solo punto decisivo en vez de ventaja/deuce.
        </p>
      </Card>

      <Button
        size="lg"
        className="w-full"
        disabled={!canCreate}
        onClick={handleCreate}
      >
        Crear Partido
      </Button>
    </div>
  );
}
