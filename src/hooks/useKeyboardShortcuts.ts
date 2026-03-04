'use client';

import { useEffect } from 'react';
import { useRecordingStore } from '@/stores/recordingStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { PlayerId, ShotType, ShotStatus } from '@/types/shot';

// Key mappings
const PLAYER_KEYS: Record<string, PlayerId> = {
  '1': 'J1',
  '2': 'J2',
  '3': 'J3',
  '4': 'J4',
};

const SHOT_TYPE_KEYS: Record<string, ShotType> = {
  's': 'S',   // Saque
  'r': 'Re',  // Resto
  'b': 'B',   // Bandeja
  'm': 'Rm',  // Remate
  'i': 'Vi',  // Vibora
  'p': 'BP',  // Bajada de Pared
  'g': 'G',   // Globo
  'v': 'V',   // Volea
  'd': 'D',   // Dejada
  'c': 'Ch',  // Chiquita
  'x': 'Ps',  // Passing Shot
  'k': 'CP',  // Contrapared
  'l': 'Bl',  // Bloqueo
};

const STATUS_KEYS: Record<string, ShotStatus> = {
  'w': 'W',   // Winner
  'e': 'X',   // Error
  'n': 'N',   // No llega
  'f': 'DF',  // Doble falta
};

export interface ShortcutInfo {
  key: string;
  description: string;
  category: 'player' | 'shot' | 'status' | 'action';
}

export const SHORTCUTS: ShortcutInfo[] = [
  { key: '1-4', description: 'Seleccionar jugador J1-J4', category: 'player' },
  { key: 'S', description: 'Saque', category: 'shot' },
  { key: 'R', description: 'Resto', category: 'shot' },
  { key: 'B', description: 'Bandeja', category: 'shot' },
  { key: 'M', description: 'Remate', category: 'shot' },
  { key: 'I', description: 'Vibora', category: 'shot' },
  { key: 'V', description: 'Volea', category: 'shot' },
  { key: 'G', description: 'Globo', category: 'shot' },
  { key: 'D', description: 'Dejada', category: 'shot' },
  { key: 'C', description: 'Chiquita', category: 'shot' },
  { key: 'W', description: 'Winner', category: 'status' },
  { key: 'E', description: 'Error', category: 'status' },
  { key: 'N', description: 'No llega', category: 'status' },
  { key: 'F', description: 'Doble falta', category: 'status' },
  { key: 'Esc', description: 'Reset seleccion', category: 'action' },
  { key: 'Ctrl+Z', description: 'Deshacer ultimo golpe', category: 'action' },
];

export function useKeyboardShortcuts(
  onUndoShot?: () => void,
) {
  const enabled = useSettingsStore((s) => s.keyboardShortcutsEnabled);
  const setPlayer = useRecordingStore((s) => s.setPlayer);
  const setShotType = useRecordingStore((s) => s.setShotType);
  const setStatus = useRecordingStore((s) => s.setStatus);
  const reset = useRecordingStore((s) => s.reset);

  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const key = e.key.toLowerCase();

      // Ctrl+Z = undo
      if (e.ctrlKey && key === 'z') {
        e.preventDefault();
        onUndoShot?.();
        return;
      }

      // Escape = reset
      if (key === 'escape') {
        e.preventDefault();
        reset();
        return;
      }

      // Player selection (1-4)
      if (PLAYER_KEYS[key]) {
        e.preventDefault();
        setPlayer(PLAYER_KEYS[key]);
        return;
      }

      // Shot type
      if (SHOT_TYPE_KEYS[key]) {
        e.preventDefault();
        setShotType(SHOT_TYPE_KEYS[key]);
        return;
      }

      // Status
      if (STATUS_KEYS[key]) {
        e.preventDefault();
        setStatus(STATUS_KEYS[key]);
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled, setPlayer, setShotType, setStatus, reset, onUndoShot]);
}
