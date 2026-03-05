'use client';

import { useRef } from 'react';
import { useRecordingStore } from '@/stores/recordingStore';
import { usePointStore } from '@/stores/pointStore';
import { useMatchStore } from '@/stores/matchStore';
import { PlayerSelector } from './PlayerSelector';
import { ShotTypeSelector } from './ShotTypeSelector';
import { ModifierSelector } from './ModifierSelector';
import { StatusSelector } from './StatusSelector';
import { NotationPreview } from './NotationPreview';
import { PointTimeline } from './PointTimeline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { WallZoneId } from '@/types/zones';
import { AnimatePresence, motion } from 'framer-motion';

function ProgressBar({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: { label: string; done: boolean }[];
  currentStep: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 mb-4">
      {steps.map((step, i) => {
        // Can click if step is done (visited) or is a previous step
        const canClick = i < currentStep || step.done;
        const isActive = i === currentStep;

        return (
          <div key={step.label} className="flex items-center gap-1 flex-1">
            <button
              type="button"
              disabled={!canClick && !isActive}
              onClick={() => canClick && onStepClick(i)}
              className={`
                w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all flex-shrink-0
                ${step.done && !isActive
                  ? 'bg-primary text-black cursor-pointer hover:ring-2 hover:ring-primary/50'
                  : isActive
                    ? 'bg-accent text-black ring-2 ring-accent/50 animate-pulse'
                    : 'bg-card border border-border text-muted cursor-default'
                }
              `}
            >
              {step.done && !isActive ? '✓' : i + 1}
            </button>
            <span className={`text-[10px] truncate ${step.done && !isActive ? 'text-primary' : isActive ? 'text-accent' : 'text-muted'}`}>
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`h-px flex-1 ${step.done ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function RecordingPanel() {
  const match = useMatchStore((s) => s.match);
  const scoring = useMatchStore((s) => s.scoring);
  const pointWon = useMatchStore((s) => s.pointWon);

  const {
    player, shotType, direction, power, spin, wallBounces,
    destination, status, quickMode, currentStep,
    setPlayer, setShotType, setDirection, setPower, setSpin,
    toggleWallBounce, setDestination, setStatus, setQuickMode,
    setCurrentStep, goToNextStep, goToPrevStep,
    reset: resetRecording,
  } = useRecordingStore();

  const { shots, addShot, removeLast, removeAt, clearShots } = usePointStore();

  const slideDirection = useRef(1);

  if (!match) return null;

  const lastStep = quickMode ? 2 : 3;

  const canAddShot = quickMode
    ? player && shotType
    : player && shotType && destination;

  const isPointEnding = status === 'W' || status === 'X' || status === 'N' || status === 'DF';

  // Progress steps definition
  const progressSteps = quickMode
    ? [
        { label: 'Jugador', done: !!player },
        { label: 'Golpe', done: !!shotType },
        { label: 'Resultado', done: !!status },
      ]
    : [
        { label: 'Jugador', done: !!player },
        { label: 'Golpe', done: !!shotType },
        { label: 'Modif.', done: !!destination || !!direction || power !== '' || spin !== '' },
        { label: 'Resultado', done: !!status },
      ];

  // Step labels for header
  const stepLabels = quickMode
    ? ['¿Quién golpea?', 'Tipo de golpe', 'Resultado del golpe']
    : ['¿Quién golpea?', 'Tipo de golpe', 'Modificadores y destino', 'Resultado del golpe'];

  const handleStepClick = (step: number) => {
    slideDirection.current = step > currentStep ? 1 : -1;
    setCurrentStep(step);
  };

  const handleNext = () => {
    slideDirection.current = 1;
    goToNextStep();
  };

  const handlePrev = () => {
    slideDirection.current = -1;
    goToPrevStep();
  };

  const handlePlayerSelect = (p: typeof player) => {
    if (!p) return;
    setPlayer(p);
    slideDirection.current = 1;
    // Use setTimeout to let the state update render, then advance
    setTimeout(() => goToNextStep(), 0);
  };

  const handleShotTypeSelect = (t: typeof shotType) => {
    if (!t) return;
    setShotType(t);
    slideDirection.current = 1;
    setTimeout(() => goToNextStep(), 0);
  };

  const handleStatusSelect = (s: typeof status) => {
    setStatus(s);
  };

  const handleAddShot = () => {
    if (!canAddShot) return;

    addShot({
      player: player!,
      type: shotType!,
      modifiers: { direction, power, spin, wallBounces },
      destination: destination,
      status,
    });

    if (isPointEnding) {
      const isTeam1Player = player === 'J1' || player === 'J2';
      let winningTeam: 'team1' | 'team2';

      if (status === 'W') {
        winningTeam = isTeam1Player ? 'team1' : 'team2';
      } else {
        winningTeam = isTeam1Player ? 'team2' : 'team1';
      }

      const freshShots = usePointStore.getState().shots;
      pointWon(winningTeam, freshShots);
      clearShots();
    }

    resetRecording();
  };

  const handleCancel = () => {
    resetRecording();
    clearShots();
  };

  // Auto-submit when status is point-ending
  const handleStatusAndSubmit = (s: typeof status) => {
    handleStatusSelect(s);
    const pointEnding = s === 'W' || s === 'X' || s === 'N' || s === 'DF';
    if (pointEnding && canAddShot) {
      // Defer to let status state update
      setTimeout(() => {
        const store = useRecordingStore.getState();
        const canAdd = quickMode
          ? store.player && store.shotType
          : store.player && store.shotType && store.destination;
        if (canAdd) {
          // Re-read fresh state for the shot
          const { player: p, shotType: st, direction: d, power: pw, spin: sp, wallBounces: wb, destination: dest } = store;
          const ptStore = usePointStore.getState();
          ptStore.addShot({
            player: p!,
            type: st!,
            modifiers: { direction: d, power: pw, spin: sp, wallBounces: wb },
            destination: dest,
            status: s,
          });

          const isTeam1 = p === 'J1' || p === 'J2';
          let winTeam: 'team1' | 'team2';
          if (s === 'W') {
            winTeam = isTeam1 ? 'team1' : 'team2';
          } else {
            winTeam = isTeam1 ? 'team2' : 'team1';
          }

          const freshShots = usePointStore.getState().shots;
          const matchStore = useMatchStore.getState();
          matchStore.pointWon(winTeam, freshShots);
          usePointStore.getState().clearShots();
          useRecordingStore.getState().reset();
        }
      }, 0);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setQuickMode(false); setCurrentStep(0); }}
            className={`text-xs px-3 py-1 rounded-l-full border transition-colors ${
              !quickMode
                ? 'bg-primary text-black border-primary font-bold'
                : 'bg-card border-border text-muted hover:text-foreground'
            }`}
          >
            Detallado
          </button>
          <button
            onClick={() => { setQuickMode(true); setCurrentStep(0); }}
            className={`text-xs px-3 py-1 rounded-r-full border transition-colors ${
              quickMode
                ? 'bg-accent text-black border-accent font-bold'
                : 'bg-card border-border text-muted hover:text-foreground'
            }`}
          >
            Rapido
          </button>
        </div>
        <span className="text-[10px] text-muted">
          {quickMode ? 'Solo jugador + golpe + resultado' : 'Flujo completo con detalles'}
        </span>
      </div>

      {/* Progress bar */}
      <ProgressBar
        steps={progressSteps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      {/* Point timeline */}
      <Card>
        <PointTimeline
          shots={shots}
          onRemoveLast={removeLast}
          teams={match.teams}
          onRemoveAt={removeAt}
        />
      </Card>

      {/* Notation preview */}
      <NotationPreview
        player={player}
        shotType={shotType}
        direction={direction}
        power={power}
        spin={spin}
        wallBounces={wallBounces}
        destination={destination}
        status={status}
      />

      {/* Step header with back button */}
      <div className="flex items-center gap-2">
        {currentStep > 0 && (
          <button
            type="button"
            onClick={handlePrev}
            className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-primary transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-primary bg-primary/10 rounded px-1.5 py-0.5">
            Paso {currentStep + 1}
          </span>
          <span className="text-[11px] text-muted">{stepLabels[currentStep]}</span>
        </div>
      </div>

      {/* Wizard content with slide animation */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentStep}
          initial={{ x: slideDirection.current > 0 ? 80 : -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: slideDirection.current > 0 ? -80 : 80, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {/* Step 0: Player */}
          {currentStep === 0 && (
            <PlayerSelector
              teams={match.teams}
              selected={player}
              onSelect={handlePlayerSelect}
            />
          )}

          {/* Step 1: Shot type */}
          {currentStep === 1 && (
            <ShotTypeSelector
              selected={shotType}
              onSelect={handleShotTypeSelect}
            />
          )}

          {/* Step 2 (detailed): Modifiers + Destination */}
          {currentStep === 2 && !quickMode && (
            <div className="space-y-3">
              {/* Court destination indicator */}
              <Card className="p-3">
                {destination ? (
                  <div className="flex items-center gap-2 text-primary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span className="text-xs font-semibold">
                      Destino: {destination.type === 'single'
                        ? `zona ${destination.zone}`
                        : `${destination.primary} / ${destination.secondary}`}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-accent">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="12" y1="3" x2="12" y2="21" />
                      </svg>
                    </motion.div>
                    <span className="text-xs font-medium">Toca la zona en la cancha</span>
                  </div>
                )}
              </Card>

              {/* Modifiers */}
              <ModifierSelector
                direction={direction}
                power={power}
                spin={spin}
                wallBounces={wallBounces}
                onDirectionChange={setDirection}
                onPowerChange={setPower}
                onSpinChange={setSpin}
                onWallToggle={(w: WallZoneId) => toggleWallBounce(w)}
              />

              {/* Manual next button for this step */}
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleNext}
              >
                Siguiente →
              </Button>
            </div>
          )}

          {/* Last step: Status */}
          {currentStep === lastStep && (
            <div className="space-y-3">
              <StatusSelector selected={status} onSelect={handleStatusAndSubmit} />

              {/* Show add button only for non-point-ending status */}
              {status && !isPointEnding && (
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    disabled={!canAddShot}
                    onClick={handleAddShot}
                  >
                    Agregar Golpe
                  </Button>
                  <Button variant="ghost" size="lg" onClick={handleCancel}>
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
