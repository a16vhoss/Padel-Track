'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { PlayerId, ShotType, ShotStatus } from '@/types/shot';

// Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

interface VoiceCommand {
  player?: PlayerId;
  shotType?: ShotType;
  status?: ShotStatus;
  raw: string;
}

interface UseVoiceRecordingReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  lastCommand: VoiceCommand | null;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
}

// Spanish word mappings
const PLAYER_WORDS: Record<string, PlayerId> = {
  'jugador 1': 'J1', 'jugador uno': 'J1', 'j1': 'J1', 'uno': 'J1',
  'jugador 2': 'J2', 'jugador dos': 'J2', 'j2': 'J2', 'dos': 'J2',
  'jugador 3': 'J3', 'jugador tres': 'J3', 'j3': 'J3', 'tres': 'J3',
  'jugador 4': 'J4', 'jugador cuatro': 'J4', 'j4': 'J4', 'cuatro': 'J4',
};

const SHOT_WORDS: Record<string, ShotType> = {
  'saque': 'S', 'servicio': 'S', 'serve': 'S',
  'resto': 'Re', 'return': 'Re', 'devolucion': 'Re',
  'bandeja': 'B',
  'remate': 'Rm', 'smash': 'Rm',
  'vibora': 'Vi', 'víbora': 'Vi',
  'bajada': 'BP', 'bajada de pared': 'BP',
  'por cuatro': 'x4', 'por 4': 'x4',
  'globo': 'G', 'lob': 'G',
  'volea': 'V', 'volley': 'V',
  'dejada': 'D', 'drop': 'D',
  'chiquita': 'Ch',
  'passing': 'Ps', 'passing shot': 'Ps', 'pasante': 'Ps',
  'contrapared': 'CP', 'contra pared': 'CP',
  'bloqueo': 'Bl', 'block': 'Bl',
};

const STATUS_WORDS: Record<string, ShotStatus> = {
  'winner': 'W', 'ganador': 'W', 'punto': 'W',
  'error': 'X', 'fallo': 'X', 'fuera': 'X', 'red': 'X',
  'no llega': 'N', 'no llegó': 'N',
  'doble falta': 'DF', 'doble': 'DF',
};

function parseVoiceCommand(text: string): VoiceCommand {
  const lower = text.toLowerCase().trim();
  const command: VoiceCommand = { raw: text };

  // Find player
  for (const [phrase, pid] of Object.entries(PLAYER_WORDS)) {
    if (lower.includes(phrase)) {
      command.player = pid;
      break;
    }
  }

  // Find shot type (longest match first to avoid partial matches)
  const sortedShots = Object.entries(SHOT_WORDS).sort((a, b) => b[0].length - a[0].length);
  for (const [phrase, type] of sortedShots) {
    if (lower.includes(phrase)) {
      command.shotType = type;
      break;
    }
  }

  // Find status
  const sortedStatuses = Object.entries(STATUS_WORDS).sort((a, b) => b[0].length - a[0].length);
  for (const [phrase, status] of sortedStatuses) {
    if (lower.includes(phrase)) {
      command.status = status;
      break;
    }
  }

  return command;
}

export function useVoiceRecording(): UseVoiceRecordingReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Reconocimiento de voz no soportado en este navegador');
      return;
    }

    setError(null);
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;
    const recognition = new Ctor();

    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = event as any;
      let finalTranscript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        const cmd = parseVoiceCommand(finalTranscript);
        if (cmd.player || cmd.shotType || cmd.status) {
          setLastCommand(cmd);
        }
      }
    };

    recognition.onerror = (event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = event as any;
      setError(`Error: ${e.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    lastCommand,
    startListening,
    stopListening,
    error,
  };
}
