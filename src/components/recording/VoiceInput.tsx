'use client';

import { useEffect } from 'react';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useRecordingStore } from '@/stores/recordingStore';

export function VoiceInput() {
  const { isListening, isSupported, transcript, lastCommand, startListening, stopListening, error } = useVoiceRecording();
  const setPlayer = useRecordingStore((s) => s.setPlayer);
  const setShotType = useRecordingStore((s) => s.setShotType);
  const setStatus = useRecordingStore((s) => s.setStatus);

  // Apply voice commands
  useEffect(() => {
    if (!lastCommand) return;
    if (lastCommand.player) setPlayer(lastCommand.player);
    if (lastCommand.shotType) setShotType(lastCommand.shotType);
    if (lastCommand.status) setStatus(lastCommand.status);
  }, [lastCommand, setPlayer, setShotType, setStatus]);

  if (!isSupported) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          isListening
            ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
            : 'bg-card hover:bg-card-hover text-muted border border-border'
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
        {isListening ? 'Escuchando...' : 'Voz'}
      </button>

      {isListening && transcript && (
        <span className="text-[10px] text-muted truncate max-w-[150px]">
          &quot;{transcript}&quot;
        </span>
      )}

      {error && (
        <span className="text-[10px] text-red-400">{error}</span>
      )}

      {lastCommand && (
        <div className="flex gap-1">
          {lastCommand.player && (
            <span className="px-1 py-0.5 bg-primary/15 text-primary rounded text-[10px]">{lastCommand.player}</span>
          )}
          {lastCommand.shotType && (
            <span className="px-1 py-0.5 bg-amber-500/15 text-amber-400 rounded text-[10px]">{lastCommand.shotType}</span>
          )}
          {lastCommand.status && (
            <span className="px-1 py-0.5 bg-blue-500/15 text-blue-400 rounded text-[10px]">{lastCommand.status}</span>
          )}
        </div>
      )}
    </div>
  );
}
