'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;

  useEffect(() => {
    router.replace(`/partido/${matchId}/registro`);
  }, [matchId, router]);

  return null;
}
