'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useMatch } from '@/hooks/useMatch';
import { useRecordingStore } from '@/stores/recordingStore';
import { usePositionStore } from '@/stores/positionStore';
import { usePointStore } from '@/stores/pointStore';
import { PlayerId } from '@/types/shot';
import { inferPositions } from '@/lib/positions/inferPositions';
import { RecordingPanel } from '@/components/recording/RecordingPanel';
import { CourtSVG } from '@/components/court/CourtSVG';
import { DraggablePlayersOverlay } from '@/components/court/DraggablePlayersOverlay';
import { WallPanel } from '@/components/court/WallPanel';
import { Scoreboard } from '@/components/scoring/Scoreboard';
import { GuiaRegistro } from '@/components/ui/GuiaRegistro';
import { UndoRedoBar } from '@/components/recording/UndoRedoBar';
import { TimerDisplay } from '@/components/recording/TimerDisplay';
import { VoiceInput } from '@/components/recording/VoiceInput';
import { KeyboardShortcutsHelp } from '@/components/recording/KeyboardShortcutsHelp';
import { PointTransition } from '@/components/recording/PointTransition';

function playerToTeam(player: PlayerId | null): 'team1' | 'team2' | undefined {
  if (!player) return undefined;
  return player === 'J1' || player === 'J2' ? 'team1' : 'team2';
}

export default function RegistroPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const { match, scoring } = useMatch(matchId);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const destination = useRecordingStore((s) => s.destination);
  const setDestination = useRecordingStore((s) => s.setDestination);
  const wallBounces = useRecordingStore((s) => s.wallBounces);
  const toggleWallBounce = useRecordingStore((s) => s.toggleWallBounce);
  const quickMode = useRecordingStore((s) => s.quickMode);
  const player = useRecordingStore((s) => s.player);
  const shotType = useRecordingStore((s) => s.shotType);
  const currentStep = useRecordingStore((s) => s.currentStep);

  const trackingEnabled = usePositionStore((s) => s.trackingEnabled);
  const setTrackingEnabled = usePositionStore((s) => s.setTrackingEnabled);
  const positions = usePositionStore((s) => s.positions);
  const setPlayerPosition = usePositionStore((s) => s.setPlayerPosition);
  const setAllPositions = usePositionStore((s) => s.setAllPositions);
  const setNeedsManualInput = usePositionStore((s) => s.setNeedsManualInput);
  const needsManualInput = usePositionStore((s) => s.needsManualInput);

  const shots = usePointStore((s) => s.shots);

  // Auto-infer positions when shots change or player selection changes
  useEffect(() => {
    if (!trackingEnabled || !scoring || !player) return;

    const result = inferPositions(
      shots,
      player,
      scoring.server,
      scoring.serveSide,
      positions,
    );

    setAllPositions(result.positions);
    setNeedsManualInput(result.needsManualInput);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shots.length, player, trackingEnabled, scoring?.server, scoring?.serveSide]);

  const handlePositionChange = useCallback(
    (p: PlayerId, pos: { x: number; y: number }) => {
      setPlayerPosition(p, pos);
    },
    [setPlayerPosition],
  );

  // Court is active when we're on the modifier/destination step (step 2 in detailed mode)
  const isCourtActive = !quickMode && currentStep === 2;

  if (!match || !scoring) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        <div className="skeleton h-12 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="skeleton h-96 rounded-xl" />
          <div className="space-y-4">
            <div className="skeleton h-24 rounded-xl" />
            <div className="skeleton h-48 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const sets = match.sets.map((s) => ({
    team1: s.score.team1,
    team2: s.score.team2,
  }));

  const playerTeam = playerToTeam(player);
  const teamNames = {
    team1: match.teams[0].name,
    team2: match.teams[1].name,
  };

  return (
    <div className="space-y-4">
      <GuiaRegistro />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Court with integrated walls */}
      <div className={`space-y-4 rounded-xl transition-all duration-300 ${isCourtActive ? 'ring-2 ring-accent/60 ring-offset-2 ring-offset-background' : ''}`}>
        {/* Position tracking toggle */}
        <div className="flex items-center justify-end gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-[10px] text-muted">Posiciones</span>
            <button
              type="button"
              onClick={() => setTrackingEnabled(!trackingEnabled)}
              className={`
                relative w-8 h-4 rounded-full transition-colors
                ${trackingEnabled ? 'bg-primary' : 'bg-card border border-border'}
              `}
            >
              <span
                className={`
                  absolute top-0.5 w-3 h-3 rounded-full transition-transform
                  ${trackingEnabled ? 'translate-x-4 bg-black' : 'translate-x-0.5 bg-muted'}
                `}
              />
            </button>
          </label>
        </div>

        <CourtSVG
          selectedDestination={destination}
          onSelectZone={setDestination}
          wallBounces={wallBounces}
          onWallToggle={toggleWallBounce}
          showWalls={!quickMode}
          showFullCourt
          playerTeam={playerTeam}
          teamNames={teamNames}
          shotType={shotType}
          svgRef={svgRef}
        >
          {trackingEnabled && (
            <DraggablePlayersOverlay
              positions={positions}
              onPositionChange={handlePositionChange}
              teams={match.teams}
              needsManualInput={needsManualInput}
              svgRef={svgRef}
            />
          )}
        </CourtSVG>
        {/* Fallback WallPanel for quick mode or small screens */}
        {quickMode && (
          <details className="text-xs">
            <summary className="text-muted cursor-pointer hover:text-foreground">
              Zonas de pared (opcional)
            </summary>
            <div className="mt-2">
              <WallPanel selected={wallBounces} onToggle={toggleWallBounce} />
            </div>
          </details>
        )}
      </div>

      {/* Right: Recording panel + scoreboard */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <KeyboardShortcutsHelp />
          <TimerDisplay />
        </div>
        <Scoreboard
          team1Name={match.teams[0].name}
          team2Name={match.teams[1].name}
          sets={sets}
          currentGame={{
            team1: String(scoring.currentGame.team1),
            team2: String(scoring.currentGame.team2),
          }}
          server={scoring.server}
          serveSide={scoring.serveSide}
        />
        <UndoRedoBar />
        <RecordingPanel />
        <VoiceInput />
      </div>
      </div>
      <PointTransition />
    </div>
  );
}
