'use client';

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

function ProgressBar({
  steps,
  quickMode,
}: {
  steps: { label: string; done: boolean; active: boolean }[];
  quickMode: boolean;
}) {
  return (
    <div className="flex items-center gap-1 mb-4">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-1 flex-1">
          <div
            className={`
              w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all flex-shrink-0
              ${step.done
                ? 'bg-primary text-black'
                : step.active
                  ? 'bg-accent text-black ring-2 ring-accent/50'
                  : 'bg-card border border-border text-muted'
              }
            `}
          >
            {step.done ? '✓' : i + 1}
          </div>
          <span className={`text-[10px] truncate ${step.done ? 'text-primary' : step.active ? 'text-accent' : 'text-muted'}`}>
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <div className={`h-px flex-1 ${step.done ? 'bg-primary' : 'bg-border'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export function RecordingPanel() {
  const match = useMatchStore((s) => s.match);
  const scoring = useMatchStore((s) => s.scoring);
  const pointWon = useMatchStore((s) => s.pointWon);

  const {
    player, shotType, direction, power, spin, wallBounces,
    destination, status, quickMode,
    setPlayer, setShotType, setDirection, setPower, setSpin,
    toggleWallBounce, setDestination, setStatus, setQuickMode, reset: resetRecording,
  } = useRecordingStore();

  const { shots, addShot, removeLast, removeAt, clearShots } = usePointStore();

  if (!match) return null;

  const canAddShot = quickMode
    ? player && shotType
    : player && shotType && destination;

  const isPointEnding = status === 'W' || status === 'X' || status === 'N' || status === 'DF';

  // Progress steps
  const progressSteps = quickMode
    ? [
        { label: 'Jugador', done: !!player, active: !player },
        { label: 'Golpe', done: !!shotType, active: !!player && !shotType },
        { label: 'Resultado', done: !!status, active: !!player && !!shotType && !status },
      ]
    : [
        { label: 'Jugador', done: !!player, active: !player },
        { label: 'Golpe', done: !!shotType, active: !!player && !shotType },
        { label: 'Modif.', done: !!direction || power !== '' || spin !== '', active: !!player && !!shotType && !destination },
        { label: 'Resultado', done: !!status, active: !!player && !!shotType && !!destination && !status },
      ];

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

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuickMode(false)}
            className={`text-xs px-3 py-1 rounded-l-full border transition-colors ${
              !quickMode
                ? 'bg-primary text-black border-primary font-bold'
                : 'bg-card border-border text-muted hover:text-foreground'
            }`}
          >
            Detallado
          </button>
          <button
            onClick={() => setQuickMode(true)}
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
      <ProgressBar steps={progressSteps} quickMode={quickMode} />

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

      {/* Step 1: Player */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-primary bg-primary/10 rounded px-1.5 py-0.5">Paso 1</span>
          <span className="text-[11px] text-muted">Quien golpea</span>
        </div>
        <PlayerSelector
          teams={match.teams}
          selected={player}
          onSelect={setPlayer}
        />
      </div>

      {/* Step 2: Shot type */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-primary bg-primary/10 rounded px-1.5 py-0.5">Paso 2</span>
          <span className="text-[11px] text-muted">Tipo de golpe</span>
        </div>
        <ShotTypeSelector
          selected={shotType}
          onSelect={setShotType}
        />
      </div>

      {/* Step 3: Modifiers (hidden in quick mode) */}
      {!quickMode && (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-primary bg-primary/10 rounded px-1.5 py-0.5">Paso 3</span>
            <span className="text-[11px] text-muted">Modificadores (opcional)</span>
          </div>
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
        </div>
      )}

      {/* Step 4 (or 3 in quick mode): Status */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-primary bg-primary/10 rounded px-1.5 py-0.5">
            Paso {quickMode ? 3 : 4}
          </span>
          <span className="text-[11px] text-muted">Resultado del golpe</span>
        </div>
        <StatusSelector selected={status} onSelect={setStatus} />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          disabled={!canAddShot}
          onClick={handleAddShot}
        >
          {isPointEnding ? 'Finalizar Punto' : 'Agregar Golpe'}
        </Button>
        <Button variant="ghost" size="lg" onClick={handleCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
