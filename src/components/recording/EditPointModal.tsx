'use client';

import { useState } from 'react';
import { Point } from '@/types/match';
import { Shot } from '@/types/shot';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface EditPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  point: Point;
  onSave: (updatedShots: Shot[], newWinner: 'team1' | 'team2') => void;
}

export function EditPointModal({ isOpen, onClose, point, onSave }: EditPointModalProps) {
  const [shots, setShots] = useState<Shot[]>([...point.shots]);
  const [winner, setWinner] = useState(point.winner);

  const removeShot = (index: number) => {
    setShots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(shots, winner);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Editar Punto #${point.pointNumber}`}>
      <div className="space-y-3">
        <div className="text-xs text-muted">
          {point.scoreBefore} - Set {point.setNumber}, Juego {point.gameNumber}
        </div>

        {/* Shot list */}
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {shots.map((shot, i) => (
            <div key={shot.id} className="flex items-center gap-2 bg-background/50 rounded px-2 py-1.5 text-xs">
              <span className="font-mono text-muted w-6">{i + 1}.</span>
              <span className="font-bold w-8">{shot.player}</span>
              <span className="text-primary">{shot.type}</span>
              <span className="flex-1 font-mono text-[10px] text-muted truncate">{shot.notation}</span>
              <span className={`text-[10px] font-bold ${
                shot.status === 'W' ? 'text-green-400' :
                shot.status === 'X' || shot.status === 'DF' ? 'text-red-400' :
                'text-muted'
              }`}>
                {shot.status || '-'}
              </span>
              <button
                onClick={() => removeShot(i)}
                className="text-red-400/60 hover:text-red-400 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Winner selector */}
        <div>
          <label className="text-xs text-muted block mb-1">Ganador del punto</label>
          <div className="flex gap-2">
            <button
              onClick={() => setWinner('team1')}
              className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                winner === 'team1' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-card text-muted border border-border'
              }`}
            >
              Equipo 1
            </button>
            <button
              onClick={() => setWinner('team2')}
              className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                winner === 'team2' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-card text-muted border border-border'
              }`}
            >
              Equipo 2
            </button>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={handleSave}>Guardar Cambios</Button>
        </div>
      </div>
    </Modal>
  );
}
