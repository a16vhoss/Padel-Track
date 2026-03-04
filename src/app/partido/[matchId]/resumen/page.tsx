'use client';

import { useParams } from 'next/navigation';
import { useMatch } from '@/hooks/useMatch';
import { buildExportJSON } from '@/lib/export/json-builder';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ShareMatch } from '@/components/match/ShareMatch';
import { useToastStore } from '@/stores/toastStore';

export default function ResumenPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const { match } = useMatch(matchId);
  const { addToast } = useToastStore();

  if (!match) {
    return <div className="text-center py-12 text-muted">Cargando...</div>;
  }

  const exportData = buildExportJSON(match);
  const jsonStr = JSON.stringify(exportData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr);
    addToast('JSON copiado al portapapeles');
  };

  const handleDownload = () => {
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `partido_${match.id.slice(0, 8)}_${new Date(match.createdAt).toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Archivo descargado');
  };

  const allPoints = match.sets.flatMap((s) => s.games.flatMap((g) => g.points));

  return (
    <div className="space-y-6">
      {/* Match summary */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">Resumen del Partido</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-muted">Equipo 1</span>
            <div className="font-medium">{match.teams[0].name}</div>
            <div className="text-xs text-muted">
              {match.teams[0].players.map((p) => p.name).join(' / ')}
            </div>
          </div>
          <div>
            <span className="text-xs text-muted">Equipo 2</span>
            <div className="font-medium">{match.teams[1].name}</div>
            <div className="text-xs text-muted">
              {match.teams[1].players.map((p) => p.name).join(' / ')}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm text-muted">Resultado:</span>
          {match.sets.map((s, i) => (
            <Badge key={i} variant="default">
              S{i + 1}: {s.score.team1}-{s.score.team2}
            </Badge>
          ))}
          {match.winner && (
            <Badge variant="primary">
              Ganador: {match.teams[match.winner === 'team1' ? 0 : 1].name}
            </Badge>
          )}
        </div>

        <div className="mt-3 text-sm text-muted">
          {allPoints.length} puntos registrados | {exportData.estadisticas.total_golpes} golpes totales
        </div>

        {/* Share buttons */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <h3 className="text-xs text-muted mb-2">Compartir</h3>
          <ShareMatch match={match} />
        </div>
      </Card>

      {/* Compact notation summary */}
      {allPoints.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold mb-2">Notación Compacta</h3>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {allPoints.map((point) => (
              <div key={point.id} className="text-xs font-mono bg-background rounded p-1.5 border border-border">
                <span className="text-muted">P{point.pointNumber}:</span>{' '}
                {point.notation}
                {point.shots[point.shots.length - 1]?.status === 'W' && (
                  <span className="text-primary ml-1">W</span>
                )}
                {(point.shots[point.shots.length - 1]?.status === 'X' ||
                  point.shots[point.shots.length - 1]?.status === 'DF') && (
                  <span className="text-danger ml-1">{point.shots[point.shots.length - 1].status}</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* JSON Export */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">JSON Export v{exportData.version}</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              Copiar JSON
            </Button>
            <Button variant="primary" size="sm" onClick={handleDownload}>
              Descargar JSON
            </Button>
          </div>
        </div>
        <pre className="bg-background border border-border rounded-lg p-3 text-xs font-mono overflow-auto max-h-96 text-muted">
          {jsonStr}
        </pre>
      </Card>
    </div>
  );
}
