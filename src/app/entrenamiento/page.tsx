'use client';

import { useState } from 'react';
import { useHistoryStore } from '@/stores/historyStore';
import { TrainingPlanCard } from '@/components/training/TrainingPlanCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { generateTrainingPlan } from '@/lib/training/exercises';
import { buildPlayerProfile } from '@/lib/scouting/scoutingReport';
import type { TrainingPlan } from '@/types/training';
import type { PlayerId } from '@/types/shot';

const PLAYER_IDS: PlayerId[] = ['J1', 'J2', 'J3', 'J4'];

export default function EntrenamientoPage() {
  const { matches } = useHistoryStore();
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerId>('J1');
  const [plan, setPlan] = useState<TrainingPlan | null>(null);

  const handleGenerate = () => {
    if (matches.length === 0) return;
    const profile = buildPlayerProfile(matches, selectedPlayer);
    const generated = generateTrainingPlan(profile);
    setPlan(generated);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Plan de Entrenamiento</h1>

      <Card>
        <h3 className="text-sm font-semibold mb-3">Generar Plan</h3>
        <div className="flex items-center gap-3">
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value as PlayerId)}
            className="bg-background border border-border rounded px-3 py-2 text-sm"
          >
            {PLAYER_IDS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <Button onClick={handleGenerate} disabled={matches.length === 0}>
            Generar Plan
          </Button>
        </div>
        {matches.length === 0 && (
          <p className="text-xs text-muted mt-2">Necesitas al menos un partido registrado</p>
        )}
      </Card>

      {plan && <TrainingPlanCard plan={plan} />}
    </div>
  );
}
