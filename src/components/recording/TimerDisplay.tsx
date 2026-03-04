'use client';

import { useTimer } from '@/hooks/useTimer';

export function TimerDisplay() {
  const { matchTime, pointTime, isRunning, showTimers, startMatch, pauseTimer, resumeTimer, startPoint } = useTimer();

  if (!showTimers) return null;

  return (
    <div className="flex items-center gap-3 text-xs">
      {/* Match timer */}
      <div className="flex items-center gap-1.5 bg-card/50 rounded-md px-2 py-1 border border-border/30">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span className="font-mono text-foreground">{matchTime}</span>
        <button
          onClick={isRunning ? pauseTimer : (matchTime === '00:00' ? startMatch : resumeTimer)}
          className="text-muted hover:text-foreground transition-colors"
          title={isRunning ? 'Pausar' : 'Iniciar'}
        >
          {isRunning ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
          )}
        </button>
      </div>

      {/* Point timer */}
      {pointTime !== '00:00' && (
        <div className="flex items-center gap-1 text-muted">
          <span className="text-[10px]">Punto:</span>
          <span className="font-mono text-amber-400">{pointTime}</span>
        </div>
      )}
    </div>
  );
}
