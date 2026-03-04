'use client';

import { useParams } from 'next/navigation';
import { useMatch } from '@/hooks/useMatch';
import { useRecordingStore } from '@/stores/recordingStore';
import { RecordingPanel } from '@/components/recording/RecordingPanel';
import { CourtSVG } from '@/components/court/CourtSVG';
import { WallPanel } from '@/components/court/WallPanel';
import { Scoreboard } from '@/components/scoring/Scoreboard';

export default function RegistroPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const { match, scoring } = useMatch(matchId);

  const destination = useRecordingStore((s) => s.destination);
  const setDestination = useRecordingStore((s) => s.setDestination);
  const wallBounces = useRecordingStore((s) => s.wallBounces);
  const toggleWallBounce = useRecordingStore((s) => s.toggleWallBounce);

  if (!match || !scoring) {
    return <div className="text-center py-12 text-muted">Cargando...</div>;
  }

  const sets = match.sets.map((s) => ({
    team1: s.score.team1,
    team2: s.score.team2,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Court + Wall panel */}
      <div className="space-y-4">
        <CourtSVG
          selectedDestination={destination}
          onSelectZone={setDestination}
        />
        <WallPanel selected={wallBounces} onToggle={toggleWallBounce} />
      </div>

      {/* Right: Recording panel + scoreboard */}
      <div className="space-y-4">
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
        <RecordingPanel />
      </div>
    </div>
  );
}
