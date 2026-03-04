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

export function RecordingPanel() {
  const match = useMatchStore((s) => s.match);
  const scoring = useMatchStore((s) => s.scoring);
  const pointWon = useMatchStore((s) => s.pointWon);

  const {
    player, shotType, direction, power, spin, wallBounces,
    destination, status,
    setPlayer, setShotType, setDirection, setPower, setSpin,
    toggleWallBounce, setDestination, setStatus, reset: resetRecording,
  } = useRecordingStore();

  const { shots, addShot, removeLast, clearShots } = usePointStore();

  if (!match) return null;

  const canAddShot = player && shotType && destination;
  const isPointEnding = status === 'W' || status === 'X' || status === 'N' || status === 'DF';

  const handleAddShot = () => {
    if (!canAddShot) return;

    addShot({
      player: player!,
      type: shotType!,
      modifiers: { direction, power, spin, wallBounces },
      destination: destination!,
      status,
    });

    if (isPointEnding) {
      // Determine which team won
      const isTeam1Player = player === 'J1' || player === 'J2';
      let winningTeam: 'team1' | 'team2';

      if (status === 'W') {
        winningTeam = isTeam1Player ? 'team1' : 'team2';
      } else {
        // Error, no llega, double fault - other team wins
        winningTeam = isTeam1Player ? 'team2' : 'team1';
      }

      pointWon(winningTeam, shots);
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
      {/* Point timeline */}
      <Card>
        <PointTimeline shots={shots} onRemoveLast={removeLast} />
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

      {/* Step 3: Modifiers */}
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

      {/* Step 4: Status */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-primary bg-primary/10 rounded px-1.5 py-0.5">Paso 4</span>
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
