'use client';

import { Match } from '@/types/match';
import { Button } from '@/components/ui/Button';
import { useToastStore } from '@/stores/toastStore';
import { generateTextSummary, encodeMatchForUrl } from '@/lib/share/shareMatch';

interface ShareMatchProps {
  match: Match;
}

export function ShareMatch({ match }: ShareMatchProps) {
  const { addToast } = useToastStore();

  const handleCopyText = async () => {
    const text = generateTextSummary(match);
    await navigator.clipboard.writeText(text);
    addToast('Resumen copiado al portapapeles');
  };

  const handleCopyLink = async () => {
    const encoded = encodeMatchForUrl(match);
    const url = `${window.location.origin}/compartido?data=${encoded}`;
    await navigator.clipboard.writeText(url);
    addToast('Enlace copiado al portapapeles');
  };

  const handleShare = async () => {
    const text = generateTextSummary(match);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'TacticalPadel - Partido', text });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      addToast('Resumen copiado al portapapeles');
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={handleCopyText}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        Copiar Resumen
      </Button>
      <Button variant="outline" size="sm" onClick={handleCopyLink}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        Copiar Enlace
      </Button>
      <Button variant="secondary" size="sm" onClick={handleShare}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Compartir
      </Button>
    </div>
  );
}
