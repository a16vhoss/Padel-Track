'use client';

import { Shot } from '@/types/shot';
import { Match } from '@/types/match';

interface PointReplayControlsProps {
  shots: Shot[];
  currentStep: number;
  onStepChange: (step: number) => void;
  match: Match;
}

function isTeam1(playerId: string): boolean {
  return playerId === 'J1' || playerId === 'J2';
}

export function PointReplayControls({
  shots,
  currentStep,
  onStepChange,
  match,
}: PointReplayControlsProps) {
  if (shots.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => onStepChange(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-3 py-1.5 bg-card border border-border rounded-md text-xs font-medium disabled:opacity-30 hover:bg-card-hover transition-colors"
        >
          Anterior
        </button>

        <span className="text-xs text-muted font-medium">
          {currentStep + 1} / {shots.length}
        </span>

        <button
          onClick={() => onStepChange(Math.min(shots.length - 1, currentStep + 1))}
          disabled={currentStep >= shots.length - 1}
          className="px-3 py-1.5 bg-card border border-border rounded-md text-xs font-medium disabled:opacity-30 hover:bg-card-hover transition-colors"
        >
          Siguiente
        </button>
      </div>

      {/* Shot chips strip */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {shots.map((shot, i) => {
          const team1 = isTeam1(shot.player);
          const isCurrent = i === currentStep;
          const teamColor = team1 ? match.teams[0].color || '#22c55e' : match.teams[1].color || '#3b82f6';

          return (
            <button
              key={shot.id}
              onClick={() => onStepChange(i)}
              className={`
                flex-shrink-0 px-2 py-1 rounded text-[10px] font-medium transition-all
                border
                ${isCurrent
                  ? 'border-white/50 ring-1 ring-white/30'
                  : 'border-border opacity-60 hover:opacity-100'
                }
              `}
              style={{
                backgroundColor: isCurrent ? teamColor : `${teamColor}33`,
                color: isCurrent ? 'white' : undefined,
              }}
            >
              {shot.player} {shot.type}
              {shot.status ? ` ${shot.status}` : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
