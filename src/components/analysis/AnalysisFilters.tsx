'use client';

import { Match } from '@/types/match';
import { AnalysisFilter } from '@/lib/stats/advancedStats';
import { ReplayPoint } from '@/lib/stats/advancedStats';
import { AnalysisTab } from './AnalysisTabBar';

interface AnalysisFiltersProps {
  match: Match;
  filter: AnalysisFilter;
  onFilterChange: (filter: AnalysisFilter) => void;
  activeTab: AnalysisTab;
  // Replay-specific
  replayPoints?: ReplayPoint[];
  selectedPointIdx?: number;
  onSelectPoint?: (idx: number) => void;
}

type FilterOption = {
  label: string;
  filter: AnalysisFilter;
};

export function AnalysisFilters({
  match,
  filter,
  onFilterChange,
  activeTab,
  replayPoints,
  selectedPointIdx,
  onSelectPoint,
}: AnalysisFiltersProps) {
  if (activeTab === 'pointReplay') {
    return (
      <div className="flex gap-2 items-center">
        <label className="text-xs text-muted whitespace-nowrap">Punto:</label>
        <select
          value={selectedPointIdx ?? 0}
          onChange={(e) => onSelectPoint?.(Number(e.target.value))}
          className="flex-1 bg-card border border-border rounded-md px-2 py-1.5 text-xs"
        >
          {(replayPoints ?? []).map((p) => (
            <option key={p.index} value={p.index}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const options: FilterOption[] = [
    { label: 'Todos', filter: { type: 'all' } },
    { label: match.teams[0].name, filter: { type: 'team', team: 'team1' } },
    { label: match.teams[1].name, filter: { type: 'team', team: 'team2' } },
    ...match.teams[0].players.map((p) => ({
      label: p.shortName,
      filter: { type: 'player' as const, player: p.id },
    })),
    ...match.teams[1].players.map((p) => ({
      label: p.shortName,
      filter: { type: 'player' as const, player: p.id },
    })),
  ];

  const isActive = (opt: FilterOption) => JSON.stringify(opt.filter) === JSON.stringify(filter);

  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.label}
          onClick={() => onFilterChange(opt.filter)}
          className={`
            px-3 py-1 rounded-full text-xs font-medium transition-colors
            ${isActive(opt)
              ? 'bg-primary text-black'
              : 'bg-card border border-border text-muted hover:text-foreground'
            }
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
