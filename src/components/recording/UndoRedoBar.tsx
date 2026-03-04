'use client';

import { useMatchStore } from '@/stores/matchStore';

export function UndoRedoBar() {
  const undoStack = useMatchStore((s) => s.undoStack);
  const redoStack = useMatchStore((s) => s.redoStack);
  const undoLastPoint = useMatchStore((s) => s.undoLastPoint);
  const redoLastPoint = useMatchStore((s) => s.redoLastPoint);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  if (!canUndo && !canRedo) return null;

  return (
    <div className="flex items-center gap-2 text-xs">
      <button
        onClick={undoLastPoint}
        disabled={!canUndo}
        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
          canUndo
            ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25'
            : 'bg-border/20 text-muted/40 cursor-not-allowed'
        }`}
        title="Deshacer ultimo punto (Ctrl+Z)"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
        Deshacer
      </button>
      <button
        onClick={redoLastPoint}
        disabled={!canRedo}
        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
          canRedo
            ? 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25'
            : 'bg-border/20 text-muted/40 cursor-not-allowed'
        }`}
        title="Rehacer"
      >
        Rehacer
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
        </svg>
      </button>
      <span className="text-muted/50 text-[10px]">
        ({undoStack.length} cambios)
      </span>
    </div>
  );
}
