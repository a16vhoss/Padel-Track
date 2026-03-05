'use client';

import { useVideoStore } from '@/stores/videoStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const SHOT_NAMES: Record<string, string> = {
  S: 'Saque', Re: 'Resto', V: 'Volea', B: 'Bandeja',
  Rm: 'Remate', Vi: 'Vibora', G: 'Globo', D: 'Dejada',
  Ch: 'Chiquita', Ps: 'Passing', BP: 'Bajada', CP: 'Contrapared',
  x4: 'Por 4', Bl: 'Bloqueo',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function AnnotationsList() {
  const annotations = useVideoStore((s) => s.annotations);
  const clips = useVideoStore((s) => s.clips);
  const removeAnnotation = useVideoStore((s) => s.removeAnnotation);
  const clearAnnotations = useVideoStore((s) => s.clearAnnotations);
  const setCurrentTime = useVideoStore((s) => s.setCurrentTime);

  const seekTo = (time: number) => {
    setCurrentTime(time);
    const video = document.querySelector('video');
    if (video) video.currentTime = time;
  };

  if (annotations.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-xs text-muted text-center">
          No hay anotaciones. Usa el boton "Anotar" mientras ves el video.
        </p>
      </Card>
    );
  }

  // Group annotations by clip
  const unclipped = annotations.filter((a) => !a.clipId);
  const clipped = clips.map((clip) => ({
    clip,
    annotations: annotations.filter((a) => a.clipId === clip.id),
  }));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold">
          Todas las anotaciones ({annotations.length})
        </span>
        <Button variant="ghost" size="sm" onClick={clearAnnotations} className="text-red-400 text-[10px]">
          Limpiar todo
        </Button>
      </div>

      {/* Clipped annotations */}
      {clipped.map(({ clip, annotations: clipAnns }) => {
        if (clipAnns.length === 0) return null;
        return (
          <Card key={clip.id} className="p-2 space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-primary">{clip.label}</span>
              <span className="text-[9px] text-muted">
                {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
              </span>
            </div>
            {clipAnns.map((ann) => (
              <AnnotationRow
                key={ann.id}
                ann={ann}
                onSeek={seekTo}
                onRemove={removeAnnotation}
              />
            ))}
          </Card>
        );
      })}

      {/* Unclipped annotations */}
      {unclipped.length > 0 && (
        <Card className="p-2 space-y-1">
          <p className="text-[10px] font-bold text-muted mb-1">Sin clip asignado</p>
          {unclipped.map((ann) => (
            <AnnotationRow
              key={ann.id}
              ann={ann}
              onSeek={seekTo}
              onRemove={removeAnnotation}
            />
          ))}
        </Card>
      )}
    </div>
  );
}

function AnnotationRow({
  ann,
  onSeek,
  onRemove,
}: {
  ann: { id: string; timestamp: number; player: string; shotType: string; status: string };
  onSeek: (time: number) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px] bg-card-hover rounded px-2 py-1 group">
      <button
        onClick={() => onSeek(ann.timestamp)}
        className="text-muted hover:text-primary transition-colors"
        title="Ir al momento"
      >
        {formatTime(ann.timestamp)}
      </button>
      <span className="font-bold text-primary">{ann.player}</span>
      <span>{SHOT_NAMES[ann.shotType] || ann.shotType}</span>
      <span
        className={
          ann.status === 'W'
            ? 'text-green-400 font-bold'
            : ann.status === 'X'
            ? 'text-red-400'
            : ann.status === 'N'
            ? 'text-orange-400'
            : ann.status === 'DF'
            ? 'text-red-400'
            : 'text-blue-400'
        }
      >
        {ann.status === 'W' ? 'Winner' : ann.status === 'X' ? 'Error' : ann.status === 'N' ? 'No llega' : ann.status === 'DF' ? 'Doble Falta' : 'Continua'}
      </span>
      <div className="flex-1" />
      <button
        onClick={() => onRemove(ann.id)}
        className="text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
