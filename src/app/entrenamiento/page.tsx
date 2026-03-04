'use client';

import { useState, useEffect, useMemo } from 'react';
import { useHistoryStore } from '@/stores/historyStore';
import { TrainingPlanCard } from '@/components/training/TrainingPlanCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { generateTrainingPlan } from '@/lib/training/exercises';
import { buildPlayerProfile } from '@/lib/scouting/scoutingReport';
import type { TrainingPlan } from '@/types/training';
import type { PlayerId } from '@/types/shot';

export default function EntrenamientoPage() {
  const { matches, loadAll } = useHistoryStore();
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerId>('J1');
  const [plan, setPlan] = useState<TrainingPlan | null>(null);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Build unique player map from match history: PlayerId -> real name
  const playerMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const match of matches) {
      for (const team of match.teams) {
        for (const player of team.players) {
          if (player.name && player.name !== player.id) {
            map[player.id] = player.name;
          } else if (!map[player.id]) {
            map[player.id] = player.id;
          }
        }
      }
    }
    return map;
  }, [matches]);

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
            {(['J1', 'J2', 'J3', 'J4'] as PlayerId[]).map((p) => (
              <option key={p} value={p}>
                {playerMap[p] ? `${p} - ${playerMap[p]}` : p}
              </option>
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
