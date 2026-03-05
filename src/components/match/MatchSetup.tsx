'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Match, Player, Team, MatchConfig } from '@/types/match';
import { PlayerId } from '@/types/shot';
import { saveMatch } from '@/lib/persistence/storage';
import { useLeagueStore } from '@/stores/leagueStore';
import Link from 'next/link';

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
  const [selectedTeam1Id, setSelectedTeam1Id] = useState('');
  const [selectedTeam2Id, setSelectedTeam2Id] = useState('');

  useEffect(() => {
    loadLeagues();
  }, [loadLeagues]);

  const activeLeagues = useMemo(
    () => leagues.filter((l) => l.status === 'active'),
    [leagues]
  );

  const selectedLeague = useMemo(
    () => activeLeagues.find((l) => l.id === selectedLeagueId),
    [activeLeagues, selectedLeagueId]
  );

  const leagueMode = !!selectedLeague;

  // When league changes, reset team selections
  const handleLeagueChange = (leagueId: string) => {
    setSelectedLeagueId(leagueId);
    setSelectedTeam1Id('');
    setSelectedTeam2Id('');
    setPlayers({ J1: '', J2: '', J3: '', J4: '' });
    setTeam1Name('');
    setTeam2Name('');
  };

  // When team 1 is selected from league, fill players
  const handleTeam1Change = (teamId: string) => {
    setSelectedTeam1Id(teamId);
    if (!selectedLeague || !teamId) {
      setPlayers((p) => ({ ...p, J1: '', J2: '' }));
      setTeam1Name('');
      return;
    }
    const team = selectedLeague.teams.find((t) => t.id === teamId);
    if (team) {
      setPlayers((p) => ({ ...p, J1: team.players[0].name, J2: team.players[1].name }));
      setTeam1Name(team.name);
    }
  };

  // When team 2 is selected from league, fill players
  const handleTeam2Change = (teamId: string) => {
    setSelectedTeam2Id(teamId);
    if (!selectedLeague || !teamId) {
      setPlayers((p) => ({ ...p, J3: '', J4: '' }));
      setTeam2Name('');
      return;
    }
    const team = selectedLeague.teams.find((t) => t.id === teamId);
    if (team) {
      setPlayers((p) => ({ ...p, J3: team.players[0].name, J4: team.players[1].name }));
      setTeam2Name(team.name);
    }
  };

  // Filter out already-selected team from the other dropdown
  const team1Options = selectedLeague?.teams.filter((t) => t.id !== selectedTeam2Id) || [];
  const team2Options = selectedLeague?.teams.filter((t) => t.id !== selectedTeam1Id) || [];

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
  const needsDifferentTeams = leagueMode && selectedTeam1Id && selectedTeam1Id === selectedTeam2Id;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Nuevo Partido</h1>
      <p className="text-sm text-muted">
        {leagueMode
          ? 'Selecciona los 2 equipos de la liga para este partido.'
          : 'Configura los 2 equipos de 2 jugadores. J1 y J2 forman el Equipo 1, J3 y J4 el Equipo 2.'}
      </p>

      {/* Liga selector - always visible */}
      <Card>
        <h2 className="font-semibold mb-3">Liga (opcional)</h2>
        {activeLeagues.length > 0 ? (
          <>
            <select
              value={selectedLeagueId}
              onChange={(e) => handleLeagueChange(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Sin liga - modo manual</option>
              {activeLeagues.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.teams.length} equipos)
                </option>
              ))}
            </select>
            {selectedLeague && selectedLeague.teams.length < 2 && (
              <p className="text-xs text-accent mt-2">
                Esta liga necesita al menos 2 equipos. Agrega equipos desde la pagina de Ligas.
              </p>
            )}
          </>
        ) : (
          <div className="text-sm text-muted">
            <p>No hay ligas activas.</p>
            <Link href="/ligas" className="text-primary hover:underline text-xs mt-1 inline-block">
              Crear una liga
            </Link>
          </div>
        )}
      </Card>

      {/* LEAGUE MODE: Team selectors */}
      {leagueMode && selectedLeague && selectedLeague.teams.length >= 2 && (
        <>
          {/* Team 1 selector */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-team1" />
              <h2 className="font-semibold">Equipo 1</h2>
            </div>
            <select
              value={selectedTeam1Id}
              onChange={(e) => handleTeam1Change(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Seleccionar equipo...</option>
              {team1Options.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.players[0].name} / {t.players[1].name})
                </option>
              ))}
            </select>
            {selectedTeam1Id && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted block mb-1">J1 - Derecha</label>
                  <div className="w-full bg-background/50 border border-border/50 rounded-md px-3 py-2 text-sm text-muted">
                    {players.J1}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">J2 - Izquierda</label>
                  <div className="w-full bg-background/50 border border-border/50 rounded-md px-3 py-2 text-sm text-muted">
                    {players.J2}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Team 2 selector */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-secondary" />
              <h2 className="font-semibold">Equipo 2</h2>
            </div>
            <select
              value={selectedTeam2Id}
              onChange={(e) => handleTeam2Change(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Seleccionar equipo...</option>
              {team2Options.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.players[0].name} / {t.players[1].name})
                </option>
              ))}
            </select>
            {selectedTeam2Id && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted block mb-1">J3 - Derecha</label>
                  <div className="w-full bg-background/50 border border-border/50 rounded-md px-3 py-2 text-sm text-muted">
                    {players.J3}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">J4 - Izquierda</label>
                  <div className="w-full bg-background/50 border border-border/50 rounded-md px-3 py-2 text-sm text-muted">
                    {players.J4}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </>
      )}

      {/* MANUAL MODE: Free-form inputs */}
      {!leagueMode && (
        <>
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
        </>
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
        disabled={!canCreate || !!needsDifferentTeams}
        onClick={handleCreate}
      >
        Crear Partido
      </Button>
    </div>
  );
}
