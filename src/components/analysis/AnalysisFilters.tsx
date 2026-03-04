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
  teamIndex?: number;
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
    { label: match.teams[0].name, filter: { type: 'team', team: 'team1' }, teamIndex: 0 },
    { label: match.teams[1].name, filter: { type: 'team', team: 'team2' }, teamIndex: 1 },
    ...match.teams[0].players.map((p) => ({
      label: p.shortName,
      filter: { type: 'player' as const, player: p.id },
      teamIndex: 0,
    })),
    ...match.teams[1].players.map((p) => ({
      label: p.shortName,
      filter: { type: 'player' as const, player: p.id },
      teamIndex: 1,
    })),
  ];

  const isActive = (opt: FilterOption) => JSON.stringify(opt.filter) === JSON.stringify(filter);

  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((opt) => {
        const active = isActive(opt);
        const teamBorder = opt.teamIndex === 0
          ? 'border-team1/50'
          : opt.teamIndex === 1
            ? 'border-secondary/50'
            : 'border-border';
        const teamBg = opt.teamIndex === 0
          ? 'bg-team1/10'
          : opt.teamIndex === 1
            ? 'bg-secondary/10'
            : 'bg-card';

        return (
          <button
            key={opt.label}
            onClick={() => onFilterChange(opt.filter)}
            className={`
              px-3 py-1 rounded-full text-xs font-medium transition-colors border
              ${active
                ? 'bg-primary text-black border-primary'
                : `${teamBg} ${teamBorder} text-muted hover:text-foreground`
              }
            `}
          >
            {opt.teamIndex !== undefined && !active && (
              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                opt.teamIndex === 0 ? 'bg-team1' : 'bg-secondary'
              }`} />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
