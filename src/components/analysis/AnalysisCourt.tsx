'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Match } from '@/types/match';
import { AnalysisFilter, computeWallHeatmap } from '@/lib/stats/advancedStats';
import { useAdvancedStats } from '@/hooks/useAdvancedStats';
import { CourtSVG } from '@/components/court/CourtSVG';
import { AnalysisTabBar, AnalysisTab } from './AnalysisTabBar';
import { AnalysisFilters } from './AnalysisFilters';
import { HeatmapOverlayV2 } from './overlays/HeatmapOverlayV2';
import { WinnersErrorsOverlay } from './overlays/WinnersErrorsOverlay';
import { ZoneFlowOverlay } from './overlays/ZoneFlowOverlay';
import { PointReplayOverlay } from './overlays/PointReplayOverlay';
import { PointReplayControls } from './PointReplayControls';
import { WallHeatmapOverlay } from '@/components/court/WallHeatmapOverlay';

interface AnalysisCourtProps {
  match: Match;
  setFilter?: number;
}

export function AnalysisCourt({ match, setFilter }: AnalysisCourtProps) {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('heatmap');
  const [filter, setFilter_] = useState<AnalysisFilter>({ type: 'all' });
  const [replayPointIdx, setReplayPointIdx] = useState(0);
  const [replayStep, setReplayStep] = useState(0);

  const stats = useAdvancedStats(match, filter);
  const wallHeatmap = useMemo(
    () => computeWallHeatmap(match, undefined, setFilter),
    [match, setFilter],
  );

  if (!stats) return null;

  const replayPoint = stats.replayPoints[replayPointIdx];

  const handleReplayPointChange = (idx: number) => {
    setReplayPointIdx(idx);
    setReplayStep(0);
  };

  const isWallTab = activeTab === 'wallHeatmap';

  const renderOverlay = () => {
    switch (activeTab) {
      case 'heatmap':
        return <HeatmapOverlayV2 data={stats.heatmap} />;
      case 'winnersErrors':
        return <WinnersErrorsOverlay data={stats.winnersErrors} />;
      case 'zoneFlow':
        return <ZoneFlowOverlay transitions={stats.zoneFlow} />;
      case 'wallHeatmap':
        return <WallHeatmapOverlay data={wallHeatmap} />;
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

      {/* Filters ABOVE tabs */}
      <AnalysisFilters
        match={match}
        filter={filter}
        onFilterChange={setFilter_}
        activeTab={activeTab}
        replayPoints={stats.replayPoints}
        selectedPointIdx={replayPointIdx}
        onSelectPoint={handleReplayPointChange}
      />

      <AnalysisTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <CourtSVG
            selectedDestination={null}
            onSelectZone={() => {}}
            showLabels={false}
            interactive={false}
            wallHeatmapData={isWallTab ? Object.fromEntries(
              Object.entries(wallHeatmap.zones).map(([k, v]) => [k, v.total])
            ) : undefined}
          >
            {renderOverlay()}
          </CourtSVG>
        </motion.div>
      </AnimatePresence>

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
