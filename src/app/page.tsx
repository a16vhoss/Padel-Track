'use client';

import { useEffect } from 'react';
import { useHistoryStore } from '@/stores/historyStore';
import { MatchList } from '@/components/match/MatchList';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const STEPS = [
  {
    icon: '🎾',
    title: 'Crea un partido',
    description: 'Configura equipos, jugadores y reglas del partido',
  },
  {
    icon: '📝',
    title: 'Registra golpes',
    description: 'Anota cada golpe con tipo, zona y resultado en tiempo real',
  },
  {
    icon: '📊',
    title: 'Analiza estadisticas',
    description: 'Ve patrones de juego, zonas calientes y efectividad',
  },
  {
    icon: '📤',
    title: 'Exporta datos',
    description: 'Descarga el analisis para compartir con tu equipo',
  },
];

export default function HomePage() {
  const { matches, loadAll } = useHistoryStore();

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">TacticalPadel AI</h1>
          <p className="text-sm text-muted mt-1">Registro y analisis tactico de padel</p>
        </div>
        <Link href="/partido/nuevo">
          <Button size="lg">Nuevo Partido</Button>
        </Link>
      </div>

      {/* How it works */}
      <Card>
        <h2 className="text-sm font-semibold text-muted mb-3">Como funciona</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STEPS.map((step, i) => (
            <div key={i} className="text-center space-y-1">
              <div className="text-2xl">{step.icon}</div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-xs font-bold text-primary">{i + 1}.</span>
                <span className="text-xs font-semibold">{step.title}</span>
              </div>
              <p className="text-[10px] text-muted leading-tight">{step.description}</p>
            </div>
          ))}
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3">Partidos</h2>
        <MatchList matches={matches} />
      </div>
    </div>
  );
}
