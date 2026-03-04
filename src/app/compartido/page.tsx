'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { decodeMatchFromUrl } from '@/lib/share/shareMatch';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

function SharedMatchContent() {
  const searchParams = useSearchParams();
  const data = searchParams.get('data');

  if (!data) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-4">
        <div className="text-4xl opacity-30">🔗</div>
        <h1 className="text-xl font-bold">Enlace no válido</h1>
        <p className="text-sm text-muted">Este enlace no contiene datos de un partido.</p>
        <Link href="/" className="inline-block mt-2 px-4 py-2 bg-primary text-black rounded-md font-medium text-sm hover:bg-primary-hover transition-colors">
          Ir al inicio
        </Link>
      </div>
    );
  }

  const match = decodeMatchFromUrl(data);

  if (!match) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-4">
        <div className="text-4xl opacity-30">⚠️</div>
        <h1 className="text-xl font-bold">Error al decodificar</h1>
        <p className="text-sm text-muted">No se pudieron leer los datos del partido.</p>
        <Link href="/" className="inline-block mt-2 px-4 py-2 bg-primary text-black rounded-md font-medium text-sm hover:bg-primary-hover transition-colors">
          Ir al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in-up">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Resultado del Partido</h1>
        <p className="text-sm text-muted mt-1">Compartido desde TacticalPadel AI</p>
      </div>

      <Card className="text-center py-6">
        <div className="flex items-center justify-center gap-6 mb-4">
          <div>
            <div className="text-lg font-bold">{match.t1}</div>
            <div className="text-xs text-muted">{match.p1.join(' / ')}</div>
          </div>
          <div className="text-2xl font-bold text-muted">vs</div>
          <div>
            <div className="text-lg font-bold">{match.t2}</div>
            <div className="text-xs text-muted">{match.p2.join(' / ')}</div>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {match.sets.split('/').map((set, i) => (
            <Badge key={i} variant="default">
              Set {i + 1}: {set}
            </Badge>
          ))}
        </div>

        {match.winner && (
          <div className="mb-4">
            <Badge variant="primary">Ganador: {match.winner}</Badge>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/50">
          <div>
            <div className="text-xl font-bold text-secondary">{match.pts}</div>
            <div className="text-xs text-muted">Puntos</div>
          </div>
          <div>
            <div className="text-xl font-bold text-accent">{match.shots}</div>
            <div className="text-xs text-muted">Golpes</div>
          </div>
          <div>
            <div className="text-xl font-bold text-muted">{match.date}</div>
            <div className="text-xs text-muted">Fecha</div>
          </div>
        </div>
      </Card>

      <div className="text-center">
        <Link href="/" className="inline-block px-4 py-2 bg-primary text-black rounded-md font-medium text-sm hover:bg-primary-hover transition-colors">
          Abrir TacticalPadel AI
        </Link>
      </div>
    </div>
  );
}

export default function CompartidoPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-muted">Cargando...</div>}>
      <SharedMatchContent />
    </Suspense>
  );
}
