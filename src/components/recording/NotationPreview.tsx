'use client';

import { PlayerId, ShotType, ShotDirection, ShotPower, ShotSpin, ShotStatus } from '@/types/shot';
import { ZoneDestination, WallZoneId } from '@/types/zones';

interface NotationPreviewProps {
  player: PlayerId | null;
  shotType: ShotType | null;
  direction: ShotDirection | undefined;
  power: ShotPower;
  spin: ShotSpin;
  wallBounces: WallZoneId[];
  destination: ZoneDestination | null;
  status: ShotStatus;
}

export function NotationPreview({
  player,
  shotType,
  direction,
  power,
  spin,
  wallBounces,
  destination,
  status,
}: NotationPreviewProps) {
  const parts: string[] = [];

  // Player
  parts.push(player || '___');

  // Shot type
  parts.push(':');
  parts.push(shotType || '__');

  // Wall bounces
  if (wallBounces.length > 0) {
    parts.push(':');
    parts.push(wallBounces.join('-'));
  }

  // Direction
  if (direction) {
    parts.push('/');
    parts.push(direction);
  }

  // Power
  if (power) {
    parts.push(power);
  }

  // Spin
  if (spin) {
    parts.push(spin);
  }

  // Destination
  parts.push('->');
  if (destination) {
    if (destination.type === 'single') {
      parts.push(String(destination.zone));
    } else {
      parts.push(`${destination.primary},${destination.secondary}`);
    }
  } else {
    parts.push('__');
  }

  // Status
  parts.push(status);

  const notation = parts.join('');

  return (
    <div className="bg-background border border-border rounded-lg p-3">
      <label className="text-xs text-muted block mb-1">Notacion</label>
      <div className="font-mono text-lg tracking-wide">
        {notation.split('').map((char, i) => {
          let color = 'text-foreground';
          if (char === ':' || char === '/' || char === '-' || char === '>') color = 'text-muted';
          if (char === 'W') color = 'text-primary';
          if (char === 'X' || (char === 'D' && notation[i + 1] === 'F')) color = 'text-danger';
          if (char === 'N') color = 'text-accent';
          return (
            <span key={i} className={color}>
              {char}
            </span>
          );
        })}
      </div>
    </div>
  );
}
