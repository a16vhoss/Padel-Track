'use client';

import { useEffect, useState } from 'react';
import { useHistoryStore } from '@/stores/historyStore';
import { MatchList } from '@/components/match/MatchList';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ImportMatchModal } from '@/components/match/ImportMatchModal';
import { formatDuration } from '@/lib/utils/relativeTime';

const STEPS = [
  {
    icon: '🎾',
    title: 'Crea un partido',
    description: 'Configura equipos, jugadores y reglas del partido',
    color: 'from-primary/20 to-primary/5',
  },
  {
    icon: '📝',
    title: 'Registra golpes',
    description: 'Anota cada golpe con tipo, zona y resultado en tiempo real',
    color: 'from-secondary/20 to-secondary/5',
  },
  {
    icon: '📊',
    title: 'Analiza estadísticas',
    description: 'Ve patrones de juego, zonas calientes y efectividad',
    color: 'from-accent/20 to-accent/5',
  },
  {
    icon: '📤',
    title: 'Exporta datos',
    description: 'Descarga el análisis para compartir con tu equipo',
    color: 'from-primary/20 to-secondary/5',
  },
];

export default function HomePage() {
  const { matches, loadAll, deleteMatch } = useHistoryStore();
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const finishedMatches = matches.filter((m) => m.status === 'finished');
  const totalPoints = matches.reduce(
    (sum, m) => sum + m.sets.reduce((sSum, s) => sSum + s.games.reduce((gSum, g) => gSum + g.points.length, 0), 0),
    0
  );
  const totalTime = matches.reduce((sum, m) => sum + (m.totalDurationMs || 0), 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Hero */}
      <div className="relative rounded-xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 border border-border/50 p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="text-primary">TacticalPadel</span> AI
            </h1>
            <p className="text-sm text-muted mt-1">Registro y análisis táctico de pádel</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="lg" variant="outline" onClick={() => setShowImport(true)}>
              Importar
            </Button>
            <Link href="/partido/nuevo">
              <Button size="lg">Nuevo Partido</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Global stats */}
      {matches.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in-up">
          <Card className="text-center py-3">
            <div className="text-xl font-bold text-foreground">{matches.length}</div>
            <div className="text-xs text-muted">Partidos</div>
          </Card>
          <Card className="text-center py-3">
            <div className="text-xl font-bold text-primary">{finishedMatches.length}</div>
            <div className="text-xs text-muted">Finalizados</div>
          </Card>
          <Card className="text-center py-3">
            <div className="text-xl font-bold text-secondary">{totalPoints}</div>
            <div className="text-xs text-muted">Puntos jugados</div>
          </Card>
          <Card className="text-center py-3">
            <div className="text-xl font-bold text-accent">{formatDuration(totalTime) || '0m'}</div>
            <div className="text-xs text-muted">Tiempo total</div>
          </Card>
        </div>
      )}

      {/* How it works */}
      <Card>
        <h2 className="text-sm font-semibold text-muted mb-3">Cómo funciona</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STEPS.map((step, i) => (
            <div key={i} className="text-center space-y-1.5">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${step.color} text-xl`}>
                {step.icon}
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-xs font-bold text-primary">{i + 1}.</span>
                <span className="text-xs font-semibold">{step.title}</span>
              </div>
              <p className="text-xs text-muted leading-tight">{step.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Match list */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Partidos</h2>
        <MatchList matches={matches} onDelete={deleteMatch} />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/estadisticas">
          <Card hover className="text-center py-4">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-sm font-semibold">Estadísticas</div>
            <p className="text-xs text-muted mt-0.5">Dashboard global</p>
          </Card>
        </Link>
        <Link href="/jugadores">
          <Card hover className="text-center py-4">
            <div className="text-2xl mb-1">👥</div>
            <div className="text-sm font-semibold">Jugadores</div>
            <p className="text-xs text-muted mt-0.5">Perfiles y stats</p>
          </Card>
        </Link>
        <Link href="/ligas">
          <Card hover className="text-center py-4">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-sm font-semibold">Ligas</div>
            <p className="text-xs text-muted mt-0.5">Clasificaciones</p>
          </Card>
        </Link>
        <Link href="/entrenamiento">
          <Card hover className="text-center py-4">
            <div className="text-2xl mb-1">🏋️</div>
            <div className="text-sm font-semibold">Entrenamiento</div>
            <p className="text-xs text-muted mt-0.5">Sesiones de entreno</p>
          </Card>
        </Link>
      </div>

      {showImport && (
        <ImportMatchModal isOpen={showImport} onClose={() => setShowImport(false)} onImported={() => { setShowImport(false); loadAll(); }} />
      )}
    </div>
  );
}
