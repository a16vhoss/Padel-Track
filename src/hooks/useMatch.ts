'use client';

import { useEffect } from 'react';
import { useMatchStore } from '@/stores/matchStore';

export function useMatch(matchId: string) {
  const match = useMatchStore((s) => s.match);
  const scoring = useMatchStore((s) => s.scoring);
  const loadMatch = useMatchStore((s) => s.loadMatch);
  const getCurrentGameScore = useMatchStore((s) => s.getCurrentGameScore);

  useEffect(() => {
    if (!match || match.id !== matchId) {
      loadMatch(matchId);
    }
  }, [matchId, match, loadMatch]);

  return {
    match,
    scoring,
    gameScore: getCurrentGameScore(),
    isLoaded: match?.id === matchId,
  };
}
