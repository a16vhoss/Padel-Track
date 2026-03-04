'use client';

import { Set } from '@/types/match';

interface SetFilterBarProps {
  sets: Set[];
  activeFilter: number | null;
  onChange: (setNumber: number | null) => void;
}

export function SetFilterBar({ sets, activeFilter, onChange }: SetFilterBarProps) {
  return (
    <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/50 -mx-4 px-4 py-2">
      <div className="flex gap-1.5 overflow-x-auto">
        <button
          onClick={() => onChange(null)}
          className={`
            px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
            ${activeFilter === null
              ? 'bg-primary text-black shadow-sm'
              : 'bg-card border border-border text-muted hover:text-foreground hover:border-primary/50'
            }
          `}
        >
          Todo el partido
        </button>
        {sets.map((set) => (
          <button
            key={set.setNumber}
            onClick={() => onChange(set.setNumber)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
              ${activeFilter === set.setNumber
                ? 'bg-primary text-black shadow-sm'
                : 'bg-card border border-border text-muted hover:text-foreground hover:border-primary/50'
              }
            `}
          >
            Set {set.setNumber}
            {set.winner && (
              <span className="ml-1 opacity-70">
                ({set.score.team1}-{set.score.team2})
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
