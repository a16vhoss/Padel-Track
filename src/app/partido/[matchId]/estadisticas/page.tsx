'use client';

import { useParams } from 'next/navigation';
import { useMatch } from '@/hooks/useMatch';
import { useStats } from '@/hooks/useStats';
import { useAdvancedStats } from '@/hooks/useAdvancedStats';
import { StatsOverview } from '@/components/stats/StatsOverview';
import { ShotDistributionChart } from '@/components/stats/ShotDistributionChart';
import { PlayerComparison } from '@/components/stats/PlayerComparison';
import { AnalysisCourt } from '@/components/analysis/AnalysisCourt';
import { ShotEffectivenessChart } from '@/components/analysis/ShotEffectivenessChart';
import { MatchTimeline } from '@/components/analysis/MatchTimeline';
import { ServeStatsCard } from '@/components/stats/ServeStatsCard';
import { MomentumChart } from '@/components/stats/MomentumChart';
import { PatternsCard } from '@/components/stats/PatternsCard';
import { WallStatsCard } from '@/components/stats/WallStatsCard';
import { RallyStatsCard } from '@/components/stats/RallyStatsCard';
import { TacticalInsights } from '@/components/analysis/TacticalInsights';
import { computeServeStats } from '@/lib/stats/serveStats';
import { computeMomentum } from '@/lib/stats/momentum';
import { computePatterns } from '@/lib/stats/patterns';
import { computeWallStats } from '@/lib/stats/wallStats';
import { computeRallyStats } from '@/lib/stats/rallyStats';
import { generateTacticalRecommendations, generateMatchNarrative } from '@/lib/ai/tacticalAnalysis';
import { useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

export default function EstadisticasPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const { match } = useMatch(matchId);
  const stats = useStats(match);
  const advancedStats = useAdvancedStats(match, { type: 'all' });

  const serveStats = useMemo(() => match ? computeServeStats(match) : null, [match]);
  const momentum = useMemo(() => match ? computeMomentum(match) : null, [match]);
  const patterns = useMemo(() => match ? computePatterns(match) : null, [match]);
  const wallStats = useMemo(() => match ? computeWallStats(match) : null, [match]);
  const rallyStats = useMemo(() => match ? computeRallyStats(match) : null, [match]);
  const recommendations = useMemo(() => match ? generateTacticalRecommendations(match) : [], [match]);
  const narrative = useMemo(() => match ? generateMatchNarrative(match) : null, [match]);

  if (!match) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="grid grid-cols-3 gap-3">
          <div className="skeleton h-24 rounded-xl" />
          <div className="skeleton h-24 rounded-xl" />
          <div className="skeleton h-24 rounded-xl" />
        </div>
        <div className="skeleton h-64 rounded-xl" />
        <div className="grid grid-cols-2 gap-6">
          <div className="skeleton h-48 rounded-xl" />
          <div className="skeleton h-48 rounded-xl" />
        </div>
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

  return (
    <div className="space-y-6">
      <StatsOverview
        stats={stats}
        team1Name={match.teams[0].name}
        team2Name={match.teams[1].name}
        match={match}
        shotEffectiveness={advancedStats?.shotEffectiveness}
      />

      <AnalysisCourt match={match} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {advancedStats && (
          <ShotEffectivenessChart data={advancedStats.shotEffectiveness} />
        )}
        <ShotDistributionChart shotsByType={stats.shotsByType} />
      </div>

      {advancedStats && (
        <MatchTimeline
          data={advancedStats.timeline}
          team1Name={match.teams[0].name}
          team2Name={match.teams[1].name}
        />
      )}

      <PlayerComparison match={match} shotsByPlayer={stats.shotsByPlayer} />

      {/* Serve Stats - one card per team */}
      {serveStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ServeStatsCard
            stats={computeServeStats(match, { type: 'team', team: 'team1' })}
            teamName={match.teams[0].name}
          />
          <ServeStatsCard
            stats={computeServeStats(match, { type: 'team', team: 'team2' })}
            teamName={match.teams[1].name}
          />
        </div>
      )}

      {/* Momentum Chart */}
      {momentum && (
        <MomentumChart
          data={momentum}
          team1Name={match.teams[0].name}
          team2Name={match.teams[1].name}
        />
      )}

      {/* Tactical Patterns */}
      {patterns && <PatternsCard analysis={patterns} />}

      {/* Wall Stats & Rally Stats side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {wallStats && <WallStatsCard stats={wallStats} />}
        {rallyStats && (
          <RallyStatsCard
            stats={rallyStats}
            team1Name={match.teams[0].name}
            team2Name={match.teams[1].name}
          />
        )}
      </div>

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
