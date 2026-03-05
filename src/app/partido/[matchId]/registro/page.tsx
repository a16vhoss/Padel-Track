'use client';

import { useParams } from 'next/navigation';
import { useMatch } from '@/hooks/useMatch';
import { useRecordingStore } from '@/stores/recordingStore';
import { PlayerId } from '@/types/shot';
import { RecordingPanel } from '@/components/recording/RecordingPanel';
import { CourtSVG } from '@/components/court/CourtSVG';
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

  const destination = useRecordingStore((s) => s.destination);
  const setDestination = useRecordingStore((s) => s.setDestination);
  const wallBounces = useRecordingStore((s) => s.wallBounces);
  const toggleWallBounce = useRecordingStore((s) => s.toggleWallBounce);
  const quickMode = useRecordingStore((s) => s.quickMode);
  const player = useRecordingStore((s) => s.player);
  const shotType = useRecordingStore((s) => s.shotType);
  const currentStep = useRecordingStore((s) => s.currentStep);

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
        />
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
