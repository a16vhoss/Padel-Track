'use client';

import { useState } from 'react';
import { Match } from '@/types/match';
import { AnalysisFilter } from '@/lib/stats/advancedStats';
import { useAdvancedStats } from '@/hooks/useAdvancedStats';
import { CourtSVG } from '@/components/court/CourtSVG';
import { AnalysisTabBar, AnalysisTab } from './AnalysisTabBar';
import { AnalysisFilters } from './AnalysisFilters';
import { HeatmapOverlayV2 } from './overlays/HeatmapOverlayV2';
import { WinnersErrorsOverlay } from './overlays/WinnersErrorsOverlay';
import { ZoneFlowOverlay } from './overlays/ZoneFlowOverlay';
import { PointReplayOverlay } from './overlays/PointReplayOverlay';
import { PointReplayControls } from './PointReplayControls';

interface AnalysisCourtProps {
  match: Match;
}

export function AnalysisCourt({ match }: AnalysisCourtProps) {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('heatmap');
  const [filter, setFilter] = useState<AnalysisFilter>({ type: 'all' });
  const [replayPointIdx, setReplayPointIdx] = useState(0);
  const [replayStep, setReplayStep] = useState(0);

  const stats = useAdvancedStats(match, filter);

  if (!stats) return null;

  const replayPoint = stats.replayPoints[replayPointIdx];
  const totalReplaySteps = replayPoint?.shots.length ?? 0;

  const handleReplayPointChange = (idx: number) => {
    setReplayPointIdx(idx);
    setReplayStep(0);
  };

  const renderOverlay = () => {
    switch (activeTab) {
      case 'heatmap':
        return <HeatmapOverlayV2 data={stats.heatmap} />;
      case 'winnersErrors':
        return <WinnersErrorsOverlay data={stats.winnersErrors} />;
      case 'zoneFlow':
        return <ZoneFlowOverlay transitions={stats.zoneFlow} />;
      case 'pointReplay':
        return replayPoint ? (
          <PointReplayOverlay
            shots={replayPoint.shots}
            currentStep={replayStep}
            match={match}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Analisis de Cancha</h3>

      <AnalysisTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <AnalysisFilters
        match={match}
        filter={filter}
        onFilterChange={setFilter}
        activeTab={activeTab}
        replayPoints={stats.replayPoints}
        selectedPointIdx={replayPointIdx}
        onSelectPoint={handleReplayPointChange}
      />

      <CourtSVG
        selectedDestination={null}
        onSelectZone={() => {}}
        showLabels={false}
        interactive={false}
      >
        {renderOverlay()}
      </CourtSVG>

      {activeTab === 'pointReplay' && replayPoint && (
        <PointReplayControls
          shots={replayPoint.shots}
          currentStep={replayStep}
          onStepChange={setReplayStep}
          match={match}
        />
      )}
    </div>
  );
}
