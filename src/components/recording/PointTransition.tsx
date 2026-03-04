'use client';

import { useEffect, useState } from 'react';

interface PointTransitionProps {
  winner: 'team1' | 'team2' | null;
  team1Name: string;
  team2Name: string;
  cause: string;
  onComplete: () => void;
}

const CAUSE_LABELS: Record<string, string> = {
  winner_S: 'ACE!',
  winner_Rm: 'REMATE GANADOR!',
  winner_B: 'BANDEJA GANADORA!',
  winner_Vi: 'VIBORA GANADORA!',
  winner_V: 'VOLEA GANADORA!',
  winner_D: 'DEJADA GANADORA!',
  winner_Ps: 'PASSING SHOT!',
  winner_Ch: 'CHIQUITA GANADORA!',
  winner_G: 'GLOBO GANADOR!',
  winner_BP: 'BAJADA GANADORA!',
  winner_CP: 'CONTRAPARED GANADORA!',
  winner_Re: 'RESTO GANADOR!',
  winner_Bl: 'BLOQUEO GANADOR!',
  winner_x4: 'POR 4 GANADOR!',
  error_S: 'Error de saque',
  error_Re: 'Error de resto',
  error_V: 'Error de volea',
  error_B: 'Error de bandeja',
  error_Rm: 'Error de remate',
  no_llega: 'No llega',
  doble_falta: 'DOBLE FALTA',
};

export function PointTransition({ winner, team1Name, team2Name, cause, onComplete }: PointTransitionProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!winner) return;

    setVisible(true);
    setExiting(false);

    const exitTimer = setTimeout(() => setExiting(true), 1200);
    const completeTimer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 1600);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [winner, onComplete]);

  if (!visible || !winner) return null;

  const teamName = winner === 'team1' ? team1Name : team2Name;
  const isWinner = cause.startsWith('winner_');
  const causeLabel = CAUSE_LABELS[cause] || (isWinner ? 'PUNTO!' : 'Error');
  const bgColor = isWinner ? 'from-green-500/20 to-transparent' : 'from-red-500/20 to-transparent';
  const textColor = isWinner ? 'text-green-400' : 'text-red-400';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
        exiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className={`bg-gradient-to-b ${bgColor} rounded-2xl px-8 py-6 text-center backdrop-blur-sm`}>
        <div className={`text-3xl font-black ${textColor} mb-1`}
          style={{ animation: 'wall-bounce 0.4s ease-out' }}
        >
          {causeLabel}
        </div>
        <div className="text-sm text-foreground/80 font-medium">
          Punto para {teamName}
        </div>
      </div>
    </div>
  );
}
