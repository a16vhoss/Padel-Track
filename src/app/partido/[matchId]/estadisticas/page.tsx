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

export default function EstadisticasPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const { match } = useMatch(matchId);
  const stats = useStats(match);
  const advancedStats = useAdvancedStats(match, { type: 'all' });

  if (!match) {
    return <div className="text-center py-12 text-muted">Cargando...</div>;
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
    </div>
  );
}
