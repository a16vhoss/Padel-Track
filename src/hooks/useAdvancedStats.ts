'use client';

import { useMemo } from 'react';
import { Match } from '@/types/match';
import {
  AnalysisFilter,
  HeatmapData,
  WinnersErrorsData,
  ZoneTransition,
  ShotEffectivenessEntry,
  TimelinePoint,
  ReplayPoint,
  computeHeatmap,
  computeWinnersErrors,
  computeZoneFlow,
  computeShotEffectiveness,
  computePointTimeline,
  getPointsForReplay,
} from '@/lib/stats/advancedStats';

export interface AdvancedStats {
  heatmap: HeatmapData;
  winnersErrors: WinnersErrorsData;
  zoneFlow: ZoneTransition[];
  shotEffectiveness: ShotEffectivenessEntry[];
  timeline: TimelinePoint[];
  replayPoints: ReplayPoint[];
}

export function useAdvancedStats(
  match: Match | null,
  filter: AnalysisFilter,
): AdvancedStats | null {
  const filterKey = JSON.stringify(filter);

  return useMemo(() => {
    if (!match) return null;

    return {
      heatmap: computeHeatmap(match, filter),
      winnersErrors: computeWinnersErrors(match, filter),
      zoneFlow: computeZoneFlow(match, filter),
      shotEffectiveness: computeShotEffectiveness(match, filter),
      timeline: computePointTimeline(match),
      replayPoints: getPointsForReplay(match),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match, filterKey]);
}
