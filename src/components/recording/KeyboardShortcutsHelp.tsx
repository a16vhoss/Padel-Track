'use client';

import { useState } from 'react';
import { SHORTCUTS } from '@/hooks/useKeyboardShortcuts';
import { useSettingsStore } from '@/stores/settingsStore';

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const enabled = useSettingsStore((s) => s.keyboardShortcutsEnabled);
  const toggle = useSettingsStore((s) => s.toggleKeyboardShortcuts);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-[10px] text-muted hover:text-foreground transition-colors flex items-center gap-1"
        title="Atajos de teclado"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <line x1="6" y1="8" x2="6" y2="8" />
          <line x1="10" y1="8" x2="10" y2="8" />
          <line x1="14" y1="8" x2="14" y2="8" />
          <line x1="18" y1="8" x2="18" y2="8" />
          <line x1="6" y1="16" x2="18" y2="16" />
        </svg>
        Atajos
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-1 w-56 bg-card border border-border rounded-lg shadow-xl p-3 z-50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold">Atajos de Teclado</h4>
            <button
              onClick={toggle}
              className={`text-[10px] px-1.5 py-0.5 rounded ${enabled ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}
            >
              {enabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {['player', 'shot', 'status', 'action'].map((cat) => (
              <div key={cat}>
                <div className="text-[9px] text-muted uppercase tracking-wide mb-0.5">
                  {cat === 'player' ? 'Jugador' : cat === 'shot' ? 'Golpe' : cat === 'status' ? 'Resultado' : 'Accion'}
                </div>
                {SHORTCUTS.filter((s) => s.category === cat).map((s) => (
                  <div key={s.key} className="flex justify-between text-[10px] py-0.5">
                    <span className="text-muted">{s.description}</span>
                    <kbd className="px-1 bg-background rounded text-[9px] font-mono">{s.key}</kbd>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
