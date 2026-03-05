'use client';

import { useState } from 'react';
import { useVideoStore } from '@/stores/videoStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PlayerId, ShotType, ShotStatus, ShotDirection, ShotPower, ShotSpin } from '@/types/shot';
import { WallZoneId } from '@/types/zones';
import { AnimatePresence, motion } from 'framer-motion';

const PLAYERS: { id: PlayerId; label: string; color: string }[] = [
  { id: 'J1', label: 'J1', color: 'bg-[var(--team1)]' },
  { id: 'J2', label: 'J2', color: 'bg-[var(--team1)]' },
  { id: 'J3', label: 'J3', color: 'bg-[var(--team2)]' },
  { id: 'J4', label: 'J4', color: 'bg-[var(--team2)]' },
];

const SHOT_TYPES: { code: ShotType; name: string }[] = [
  { code: 'S', name: 'Saque' },
  { code: 'Re', name: 'Resto' },
  { code: 'V', name: 'Volea' },
  { code: 'B', name: 'Bandeja' },
  { code: 'Rm', name: 'Remate' },
  { code: 'Vi', name: 'Vibora' },
  { code: 'G', name: 'Globo' },
  { code: 'D', name: 'Dejada' },
  { code: 'Ch', name: 'Chiquita' },
  { code: 'Ps', name: 'Passing' },
  { code: 'BP', name: 'Bajada' },
  { code: 'CP', name: 'Contrapared' },
  { code: 'x4', name: 'Por 4' },
  { code: 'Bl', name: 'Bloqueo' },
];

const STATUSES: { code: ShotStatus; label: string; color: string }[] = [
  { code: 'W', label: 'Winner', color: 'bg-green-500' },
  { code: 'X', label: 'Error', color: 'bg-red-500' },
  { code: 'N', label: 'No llega', color: 'bg-orange-500' },
  { code: 'DF', label: 'Doble Falta', color: 'bg-red-700' },
  { code: '', label: 'Continua', color: 'bg-blue-500' },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VideoAnnotationPanel() {
  const currentTime = useVideoStore((s) => s.currentTime);
  const isAnnotating = useVideoStore((s) => s.isAnnotating);
  const setIsAnnotating = useVideoStore((s) => s.setIsAnnotating);
  const addAnnotation = useVideoStore((s) => s.addAnnotation);
  const annotations = useVideoStore((s) => s.annotations);
  const removeAnnotation = useVideoStore((s) => s.removeAnnotation);
  const activeClipId = useVideoStore((s) => s.activeClipId);
  const setIsPlaying = useVideoStore((s) => s.setIsPlaying);

  const [player, setPlayer] = useState<PlayerId | null>(null);
  const [shotType, setShotType] = useState<ShotType | null>(null);
  const [status, setStatus] = useState<ShotStatus>('');
  const [step, setStep] = useState(0);

  const handleStartAnnotation = () => {
    setIsAnnotating(true);
    setIsPlaying(false);
    setPlayer(null);
    setShotType(null);
    setStatus('');
    setStep(0);
  };

  const handleSubmit = () => {
    if (!player || !shotType) return;

    addAnnotation({
      timestamp: currentTime,
      player,
      shotType,
      status,
      power: '' as ShotPower,
      spin: '' as ShotSpin,
      wallBounces: [] as WallZoneId[],
      destination: null,
      clipId: activeClipId || undefined,
    });

    // Reset for next annotation but stay in annotating mode
    setPlayer(null);
    setShotType(null);
    setStatus('');
    setStep(0);
  };

  const handleCancel = () => {
    setIsAnnotating(false);
    setPlayer(null);
    setShotType(null);
    setStatus('');
    setStep(0);
  };

  // Recent annotations near current time
  const nearAnnotations = annotations.filter(
    (a) => Math.abs(a.timestamp - currentTime) < 5
  );

  return (
    <div className="space-y-3">
      {/* Quick annotate button */}
      {!isAnnotating && (
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleStartAnnotation}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Anotar en {formatTime(currentTime)}
        </Button>
      )}

      {/* Annotation wizard */}
      <AnimatePresence mode="wait">
        {isAnnotating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="p-3 space-y-3 ring-2 ring-accent/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-xs font-semibold">
                    Anotando @ {formatTime(currentTime)}
                  </span>
                </div>
                <button onClick={handleCancel} className="text-muted hover:text-foreground text-xs">
                  Cancelar
                </button>
              </div>

              {/* Step 0: Player */}
              {step === 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] text-muted">Jugador:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {PLAYERS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setPlayer(p.id);
                          setStep(1);
                        }}
                        className={`py-2 rounded-lg text-xs font-bold transition-all ${
                          player === p.id
                            ? `${p.color} text-white ring-2 ring-offset-1 ring-offset-background`
                            : 'bg-card border border-border text-muted hover:text-foreground hover:border-primary'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Shot type */}
              {step === 1 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setStep(0)} className="text-muted hover:text-foreground">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <p className="text-[11px] text-muted">Tipo de golpe ({player}):</p>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {SHOT_TYPES.map((st) => (
                      <button
                        key={st.code}
                        onClick={() => {
                          setShotType(st.code);
                          setStep(2);
                        }}
                        className={`py-1.5 rounded text-[10px] font-semibold transition-all ${
                          shotType === st.code
                            ? 'bg-primary text-black'
                            : 'bg-card border border-border text-muted hover:text-foreground hover:border-primary'
                        }`}
                      >
                        {st.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Status */}
              {step === 2 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setStep(1)} className="text-muted hover:text-foreground">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <p className="text-[11px] text-muted">
                      Resultado ({player} - {SHOT_TYPES.find((s) => s.code === shotType)?.name}):
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {STATUSES.map((st) => (
                      <button
                        key={st.code}
                        onClick={() => {
                          setStatus(st.code);
                          // Auto-submit
                          setTimeout(() => {
                            const store = useVideoStore.getState();
                            store.addAnnotation({
                              timestamp: store.currentTime,
                              player: player!,
                              shotType: shotType!,
                              status: st.code,
                              power: '' as ShotPower,
                              spin: '' as ShotSpin,
                              wallBounces: [] as WallZoneId[],
                              destination: null,
                              clipId: store.activeClipId || undefined,
                            });
                            setPlayer(null);
                            setShotType(null);
                            setStatus('');
                            setStep(0);
                          }, 0);
                        }}
                        className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                          st.code === 'W'
                            ? 'border-green-500/50 text-green-400 hover:bg-green-500/20'
                            : st.code === 'X' || st.code === 'DF'
                            ? 'border-red-500/50 text-red-400 hover:bg-red-500/20'
                            : st.code === 'N'
                            ? 'border-orange-500/50 text-orange-400 hover:bg-orange-500/20'
                            : 'border-blue-500/50 text-blue-400 hover:bg-blue-500/20'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nearby annotations list */}
      {nearAnnotations.length > 0 && (
        <Card className="p-2">
          <p className="text-[10px] text-muted mb-1.5 font-semibold">Anotaciones cercanas:</p>
          <div className="space-y-1">
            {nearAnnotations.map((ann) => (
              <div key={ann.id} className="flex items-center justify-between text-[11px] bg-card-hover rounded px-2 py-1">
                <div className="flex items-center gap-2">
                  <span className="text-muted">{formatTime(ann.timestamp)}</span>
                  <span className="font-bold text-primary">{ann.player}</span>
                  <span>{SHOT_TYPES.find((s) => s.code === ann.shotType)?.name || ann.shotType}</span>
                  <span className={
                    ann.status === 'W' ? 'text-green-400' :
                    ann.status === 'X' ? 'text-red-400' :
                    ann.status === 'N' ? 'text-orange-400' :
                    ann.status === 'DF' ? 'text-red-400' :
                    'text-blue-400'
                  }>
                    {ann.status || 'cont.'}
                  </span>
                </div>
                <button
                  onClick={() => removeAnnotation(ann.id)}
                  className="text-muted hover:text-red-400 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Total annotations count */}
      {annotations.length > 0 && (
        <div className="text-[10px] text-muted text-center">
          {annotations.length} anotacion{annotations.length !== 1 ? 'es' : ''} total
        </div>
      )}
    </div>
  );
}
