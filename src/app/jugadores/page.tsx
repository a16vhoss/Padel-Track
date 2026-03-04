'use client';

import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/stores/playerStore';
import { useHistoryStore } from '@/stores/historyStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToastStore } from '@/stores/toastStore';
import { Match } from '@/types/match';

function getPlayerMatchStats(playerName: string, matches: Match[]) {
  let totalMatches = 0;
  let totalWins = 0;
  let totalShots = 0;
  let totalWinners = 0;
  let totalErrors = 0;
  const shotTypes: Record<string, number> = {};

  for (const match of matches) {
    const team1Players = match.teams[0].players.map((p) => p.name.toLowerCase());
    const team2Players = match.teams[1].players.map((p) => p.name.toLowerCase());
    const nameLower = playerName.toLowerCase();

    let playerTeam: 'team1' | 'team2' | null = null;
    let playerId: string | null = null;

    if (team1Players.includes(nameLower)) {
      playerTeam = 'team1';
      const idx = team1Players.indexOf(nameLower);
      playerId = match.teams[0].players[idx]?.id || null;
    } else if (team2Players.includes(nameLower)) {
      playerTeam = 'team2';
      const idx = team2Players.indexOf(nameLower);
      playerId = match.teams[1].players[idx]?.id || null;
    }

    if (!playerTeam) continue;

    totalMatches++;
    if (match.winner === playerTeam) totalWins++;

    if (playerId) {
      for (const set of match.sets) {
        for (const game of set.games) {
          for (const point of game.points) {
            for (const shot of point.shots) {
              if (shot.player === playerId) {
                totalShots++;
                shotTypes[shot.type] = (shotTypes[shot.type] || 0) + 1;
                if (shot.status === 'W') totalWinners++;
                if (shot.status === 'X' || shot.status === 'DF') totalErrors++;
              }
            }
          }
        }
      }
    }
  }

  const topShot = Object.entries(shotTypes).sort(([, a], [, b]) => b - a)[0];

  return {
    totalMatches,
    totalWins,
    winRate: totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0,
    totalShots,
    totalWinners,
    totalErrors,
    effectiveness: totalShots > 0 ? Math.round((totalWinners / totalShots) * 100) : 0,
    favoriteShot: topShot ? topShot[0] : '-',
    favoriteShotCount: topShot ? topShot[1] : 0,
  };
}

export default function JugadoresPage() {
  const { players, loadAll, addPlayer, deletePlayer } = usePlayerStore();
  const { matches, loadAll: loadMatches } = useHistoryStore();
  const { addToast } = useToastStore();
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
    loadMatches();
  }, [loadAll, loadMatches]);

  const handleAdd = () => {
    if (!name.trim()) return;
    addPlayer(name.trim(), shortName.trim());
    setName('');
    setShortName('');
    addToast('Jugador añadido');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Seguro que quieres eliminar este jugador?')) {
      deletePlayer(id);
      addToast('Jugador eliminado', 'info');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">Jugadores</h1>
        <p className="text-sm text-muted mt-1">Gestiona tus jugadores y consulta sus estadísticas</p>
      </div>

      {/* Add player form */}
      <Card>
        <h3 className="text-sm font-semibold mb-3">Añadir Jugador</h3>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <div className="w-24">
            <Input
              label="Alias"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="ABC"
              maxLength={5}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <Button onClick={handleAdd} disabled={!name.trim()}>Añadir</Button>
        </div>
      </Card>

      {/* Player list */}
      {players.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <div className="text-4xl mb-3 opacity-30">👥</div>
          <p className="text-lg mb-1">No hay jugadores registrados</p>
          <p className="text-sm text-muted/70">Añade jugadores para ver sus estadísticas acumuladas</p>
        </div>
      ) : (
        <div className="space-y-3 animate-stagger">
          {players.map((player) => {
            const isExpanded = expandedId === player.id;
            const stats = isExpanded ? getPlayerMatchStats(player.name, matches) : null;

            return (
              <Card key={player.id}>
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : player.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">
                      {player.shortName.slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{player.name}</div>
                      <div className="text-xs text-muted">{player.shortName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(player.id); }}
                      className="text-muted hover:text-danger transition-colors p-1 rounded hover:bg-danger/10"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className={`text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {isExpanded && stats && (
                  <div className="mt-4 pt-4 border-t border-border/50 animate-fade-in-up">
                    {stats.totalMatches === 0 ? (
                      <p className="text-xs text-muted">No se encontraron partidos para este jugador. El nombre debe coincidir con el usado en los partidos.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="text-center">
                          <div className="text-lg font-bold">{stats.totalMatches}</div>
                          <div className="text-xs text-muted">Partidos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">{stats.winRate}%</div>
                          <div className="text-xs text-muted">Win Rate</div>
                          <div className="text-xs text-muted/60">{stats.totalWins}/{stats.totalMatches}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-secondary">{stats.totalShots}</div>
                          <div className="text-xs text-muted">Golpes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">{stats.effectiveness}%</div>
                          <div className="text-xs text-muted">Efectividad</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">{stats.totalWinners}</div>
                          <div className="text-xs text-muted">Winners</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-400">{stats.totalErrors}</div>
                          <div className="text-xs text-muted">Errores</div>
                        </div>
                        <div className="text-center col-span-2">
                          <div className="text-lg font-bold text-accent">{stats.favoriteShot}</div>
                          <div className="text-xs text-muted">Golpe favorito ({stats.favoriteShotCount}x)</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
