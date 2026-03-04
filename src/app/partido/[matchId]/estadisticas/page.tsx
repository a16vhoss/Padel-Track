'use client';

import { useParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useMatch } from '@/hooks/useMatch';
import { useStats } from '@/hooks/useStats';
import { useAdvancedStats } from '@/hooks/useAdvancedStats';
import { StatsOverview } from '@/components/stats/StatsOverview';
import { AnalysisCourt } from '@/components/analysis/AnalysisCourt';
import { ServeStatsCard } from '@/components/stats/ServeStatsCard';
import { ReturnStatsCard } from '@/components/stats/ReturnStatsCard';
import { ServeDirectionDiagram } from '@/components/stats/ServeDirectionDiagram';
import { MomentumChart } from '@/components/stats/MomentumChart';
import { PatternsCard } from '@/components/stats/PatternsCard';
import { WallStatsCard } from '@/components/stats/WallStatsCard';
import { RallyStatsCard } from '@/components/stats/RallyStatsCard';
import { SetFilterBar } from '@/components/stats/SetFilterBar';
import { PlayerRadarChart } from '@/components/stats/PlayerRadarChart';
import { TacticalInsights } from '@/components/analysis/TacticalInsights';
import { Card } from '@/components/ui/Card';
import { computeServeStats, computeReturnStats, computeServeDirections } from '@/lib/stats/serveStats';
import { computeMomentum } from '@/lib/stats/momentum';
import { computePatterns } from '@/lib/stats/patterns';
import { computeWallStats } from '@/lib/stats/wallStats';
import { computeRallyStats } from '@/lib/stats/rallyStats';
import { computePlayerRadarStats } from '@/lib/stats/advancedStats';
import { generateTacticalRecommendations, generateMatchNarrative } from '@/lib/ai/tacticalAnalysis';
import { PlayerId } from '@/types/shot';

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <span className="text-base">{icon}</span>
      <h2 className="text-sm font-bold tracking-wide uppercase text-muted">{title}</h2>
      <div className="flex-1 h-px bg-border/50" />
    </div>
  );
}

export default function EstadisticasPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const { match } = useMatch(matchId);
  const stats = useStats(match);
  const [setFilter, setSetFilter] = useState<number | null>(null);
  const sf = setFilter ?? undefined;

  const advancedStats = useAdvancedStats(match, { type: 'all' });

  const serveStatsTeam1 = useMemo(() => match ? computeServeStats(match, { type: 'team', team: 'team1' }, sf) : null, [match, sf]);
  const serveStatsTeam2 = useMemo(() => match ? computeServeStats(match, { type: 'team', team: 'team2' }, sf) : null, [match, sf]);
  const returnStatsTeam1 = useMemo(() => match ? computeReturnStats(match, 'team1', sf) : null, [match, sf]);
  const returnStatsTeam2 = useMemo(() => match ? computeReturnStats(match, 'team2', sf) : null, [match, sf]);
  const serveDirections = useMemo(() => match ? computeServeDirections(match, sf) : null, [match, sf]);
  const momentum = useMemo(() => match ? computeMomentum(match, sf) : null, [match, sf]);
  const patterns = useMemo(() => match ? computePatterns(match, sf) : null, [match, sf]);
  const wallStats = useMemo(() => match ? computeWallStats(match, undefined, sf) : null, [match, sf]);
  const rallyStats = useMemo(() => match ? computeRallyStats(match, sf) : null, [match, sf]);
  const recommendations = useMemo(() => match ? generateTacticalRecommendations(match) : [], [match]);
  const narrative = useMemo(() => match ? generateMatchNarrative(match) : null, [match]);

  // Radar stats for all 4 players
  const radarStats = useMemo(() => {
    if (!match) return null;
    const players: PlayerId[] = ['J1', 'J2', 'J3', 'J4'];
    return players.map((pid) => ({
      playerId: pid,
      stats: computePlayerRadarStats(match, pid, sf),
    }));
  }, [match, sf]);

  // Player name lookup
  const playerNames = useMemo(() => {
    if (!match) return {} as Record<string, string>;
    const map: Record<string, string> = {};
    for (const team of match.teams) {
      for (const player of team.players) {
        map[player.id] = player.name;
      }
    }
    return map;
  }, [match]);

  if (!match) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="grid grid-cols-3 gap-3">
          <div className="skeleton h-24 rounded-xl" />
          <div className="skeleton h-24 rounded-xl" />
          <div className="skeleton h-24 rounded-xl" />
        </div>
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  if (stats.totalPoints === 0) {
    return (
      <div className="text-center py-12 text-muted">
        <p className="text-lg">No hay datos disponibles</p>
        <p className="text-sm mt-1">Registra puntos para ver estadisticas</p>
      </div>
    );
  }

  const team1Color = '#22c55e';
  const team2Color = '#3b82f6';

  return (
    <div className="space-y-6">
      {/* Set Filter Bar — sticky at top */}
      <SetFilterBar
        sets={match.sets}
        activeFilter={setFilter}
        onChange={setSetFilter}
      />

      {/* ========== SECTION 1: RESUMEN ========== */}
      <SectionHeader icon="📊" title="Resumen" />

      <StatsOverview
        stats={stats}
        team1Name={match.teams[0].name}
        team2Name={match.teams[1].name}
        match={match}
        shotEffectiveness={advancedStats?.shotEffectiveness}
      />

      {/* Player Radar Charts */}
      {radarStats && (
        <Card>
          <h3 className="text-sm font-semibold mb-3">Perfil de Jugadores</h3>
          <div className="grid grid-cols-2 gap-2">
            {radarStats.map(({ playerId, stats: rs }) => {
              const isTeam1 = playerId === 'J1' || playerId === 'J2';
              return (
                <PlayerRadarChart
                  key={playerId}
                  playerName={playerNames[playerId] || playerId}
                  color={isTeam1 ? team1Color : team2Color}
                  stats={[
                    { label: 'Ataque', value: rs.attack },
                    { label: 'Defensa', value: rs.defense },
                    { label: 'Saque', value: rs.serve },
                    { label: 'Resto', value: rs.return_ },
                    { label: 'Red', value: rs.net },
                    { label: 'Consist.', value: rs.consistency },
                  ]}
                />
              );
            })}
          </div>
        </Card>
      )}

      {/* ========== SECTION 2: ANALISIS DE CANCHA ========== */}
      <SectionHeader icon="🏟" title="Analisis de Cancha" />

      <AnalysisCourt match={match} setFilter={sf} />

      {/* ========== SECTION 3: SERVICIO Y RESTO ========== */}
      <SectionHeader icon="🎾" title="Servicio y Resto" />

      {/* Serve Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {serveStatsTeam1 && (
          <ServeStatsCard stats={serveStatsTeam1} teamName={match.teams[0].name} />
        )}
        {serveStatsTeam2 && (
          <ServeStatsCard stats={serveStatsTeam2} teamName={match.teams[1].name} />
        )}
      </div>

      {/* Return Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {returnStatsTeam1 && (
          <ReturnStatsCard stats={returnStatsTeam1} teamName={match.teams[0].name} />
        )}
        {returnStatsTeam2 && (
          <ReturnStatsCard stats={returnStatsTeam2} teamName={match.teams[1].name} />
        )}
      </div>

      {/* Serve Direction */}
      {serveDirections && (
        <ServeDirectionDiagram
          data={serveDirections}
          playerNames={playerNames}
        />
      )}

      {/* ========== SECTION 4: ANALISIS PROFUNDO ========== */}
      <SectionHeader icon="🔬" title="Analisis Profundo" />

      {/* Momentum Chart */}
      {momentum && (
        <MomentumChart
          data={momentum}
          team1Name={match.teams[0].name}
          team2Name={match.teams[1].name}
        />
      )}

      {/* Rally & Wall Stats side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rallyStats && (
          <RallyStatsCard
            stats={rallyStats}
            team1Name={match.teams[0].name}
            team2Name={match.teams[1].name}
          />
        )}
        {wallStats && <WallStatsCard stats={wallStats} />}
      </div>

      {/* Tactical Patterns */}
      {patterns && <PatternsCard analysis={patterns} />}

      {/* AI Tactical Insights */}
      {narrative && (
        <TacticalInsights
          recommendations={recommendations}
          narrative={narrative}
        />
      )}

      {/* Navigation to Scouting & Training */}
      <Card>
        <h3 className="text-sm font-semibold mb-3">Analisis por jugador</h3>
        <div className="grid grid-cols-2 gap-3">
          {match.teams.flatMap((team) =>
            team.players.map((player) => (
              <Link
                key={player.id}
                href={`/scouting?player=${player.id}`}
                className="text-xs bg-background border border-border rounded px-3 py-2 hover:border-primary transition-colors text-center"
              >
                Scouting de {player.name}
              </Link>
            ))
          )}
        </div>
        <div className="mt-3">
          <Link
            href="/entrenamiento"
            className="inline-block text-xs bg-primary text-black rounded px-3 py-2 font-medium hover:bg-primary-hover transition-colors"
          >
            Plan de Entrenamiento
          </Link>
        </div>
      </Card>
    </div>
  );
}
