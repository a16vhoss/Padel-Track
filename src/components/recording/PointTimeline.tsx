'use client';

import { Shot, ShotType } from '@/types/shot';
import { Team } from '@/types/match';
import { Badge } from '@/components/ui/Badge';
import { SHOT_TYPES } from './ShotTypeSelector';

const ZONE_NAMES: Record<number, string> = {
  1: 'Fondo Lat. Izq', 2: 'Fondo Int. Izq', 3: 'Fondo Centro',
  4: 'Fondo Int. Der', 5: 'Fondo Lat. Der',
  6: 'Media Lat. Izq', 7: 'Media Int. Izq', 8: 'Media Centro',
  9: 'Media Int. Der', 10: 'Media Lat. Der',
  11: 'Red Lat. Izq', 12: 'Red Int. Izq', 13: 'Red Centro',
  14: 'Red Int. Der', 15: 'Red Lat. Der',
};

function getShotTypeName(code: ShotType): string {
  return SHOT_TYPES.find((st) => st.code === code)?.name ?? code;
}

function getZoneLabel(shot: Shot): string | null {
  if (!shot.destination) return null;
  if (shot.destination.type === 'single') {
    return ZONE_NAMES[shot.destination.zone] ?? `Zona ${shot.destination.zone}`;
  }
  const z1 = ZONE_NAMES[shot.destination.primary] ?? `${shot.destination.primary}`;
  const z2 = ZONE_NAMES[shot.destination.secondary] ?? `${shot.destination.secondary}`;
  return `${z1} / ${z2}`;
}

function getStatusBg(status: string): string {
  switch (status) {
    case 'W': return 'bg-green-500/10 border-green-500/30';
    case 'X': case 'DF': return 'bg-red-500/10 border-red-500/30';
    case 'N': return 'bg-amber-500/10 border-amber-500/30';
    default: return 'bg-card border-border';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'W': return 'Winner';
    case 'X': return 'Error';
    case 'N': return 'No llega';
    case 'DF': return 'Doble Falta';
    default: return '';
  }
}

interface PointTimelineProps {
  shots: Shot[];
  onRemoveLast: () => void;
  teams?: [Team, Team];
  onRemoveAt?: (index: number) => void;
}

function getPlayerName(playerId: string, teams?: [Team, Team]): string {
  if (!teams) return playerId;
  for (const team of teams) {
    for (const player of team.players) {
      if (player.id === playerId) return player.shortName;
    }
  }
  return playerId;
}

export function PointTimeline({ shots, onRemoveLast, teams, onRemoveAt }: PointTimelineProps) {
  if (shots.length === 0) {
    return (
      <div className="text-center py-3 text-xs text-muted border border-dashed border-border rounded-lg">
        Registra el primer golpe del punto
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-muted">Secuencia del Punto ({shots.length} golpes)</label>
        <button
          onClick={onRemoveLast}
          className="text-xs text-danger hover:text-red-400 transition-colors"
        >
          Deshacer ultimo
        </button>
      </div>

      {/* Visual cards */}
      <div className="space-y-1">
        {shots.map((shot, i) => {
          const isTeam1 = shot.player === 'J1' || shot.player === 'J2';
          const statusVariant = shot.status === 'W' ? 'primary'
            : shot.status === 'X' || shot.status === 'DF' ? 'danger'
            : shot.status === 'N' ? 'accent'
            : 'default';
          const canDelete = onRemoveAt && i >= shots.length - 3;

          return (
            <div key={shot.id}>
              <div
                className={`
                  flex items-center gap-2 p-2 rounded-lg border transition-all text-xs
                  ${getStatusBg(shot.status)}
                `}
              >
                {/* Sequence number */}
                <div className="text-[10px] text-muted font-mono w-4 text-center flex-shrink-0">
                  {i + 1}
                </div>

                {/* Player badge */}
                <div className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[11px] font-bold ${
                  isTeam1
                    ? 'bg-team1/20 text-team1 border border-team1/30'
                    : 'bg-secondary/20 text-secondary border border-secondary/30'
                }`}>
                  {getPlayerName(shot.player, teams)}
                </div>

                {/* Shot info */}
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{getShotTypeName(shot.type)}</span>
                  {getZoneLabel(shot) && (
                    <span className="text-muted ml-1">→ {getZoneLabel(shot)}</span>
                  )}
                </div>

                {/* Status badge */}
                {shot.status && (
                  <Badge variant={statusVariant}>{getStatusLabel(shot.status)}</Badge>
                )}

                {/* Delete button for last 3 */}
                {canDelete && (
                  <button
                    onClick={() => onRemoveAt!(i)}
                    className="text-danger/50 hover:text-danger text-[10px] flex-shrink-0"
                    title="Eliminar golpe"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Arrow between cards */}
              {i < shots.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <span className="text-muted/40 text-[10px]">↓</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Compact notation (collapsible) */}
      <details className="mt-2">
        <summary className="text-[10px] text-muted cursor-pointer hover:text-foreground">
          Notacion compacta
        </summary>
        <div className="mt-1 text-xs text-muted font-mono bg-card/50 rounded p-1.5">
          {shots.map((s) => s.notation).join(' | ')}
        </div>
      </details>
    </div>
  );
}
