'use client';

import { useParams } from 'next/navigation';
import { useMatch } from '@/hooks/useMatch';
import { ScoreHeader } from '@/components/scoring/ScoreHeader';
import { Tabs } from '@/components/ui/Tabs';

export default function MatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const matchId = params.matchId as string;
  const { match, scoring } = useMatch(matchId);

  if (!match) {
    return (
      <div className="text-center py-12 text-muted">
        Cargando partido...
      </div>
    );
  }

  const sets = match.sets.map((s) => ({
    team1: s.score.team1,
    team2: s.score.team2,
  }));

  const currentGame = scoring
    ? { team1: String(scoring.currentGame.team1), team2: String(scoring.currentGame.team2) }
    : { team1: '0', team2: '0' };

  const tabs = [
    { label: 'Registro', href: `/partido/${matchId}/registro` },
    { label: 'Video', href: `/partido/${matchId}/video` },
    { label: 'Estadisticas', href: `/partido/${matchId}/estadisticas` },
    { label: 'Resumen', href: `/partido/${matchId}/resumen` },
  ];

  return (
    <div className="space-y-4">
      <ScoreHeader
        team1Name={match.teams[0].name}
        team2Name={match.teams[1].name}
        sets={sets}
        currentGame={currentGame}
        server={scoring?.server || 'J1'}
      />
      <Tabs tabs={tabs} />
      {children}
    </div>
  );
}
