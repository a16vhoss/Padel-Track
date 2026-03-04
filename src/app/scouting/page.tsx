'use client';

import { useState } from 'react';
import { useHistoryStore } from '@/stores/historyStore';
import { ScoutingReportCard } from '@/components/scouting/ScoutingReportCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { generateScoutingReport } from '@/lib/scouting/scoutingReport';
import type { ScoutingReport } from '@/types/scouting';
import type { PlayerId } from '@/types/shot';

const PLAYER_IDS: PlayerId[] = ['J1', 'J2', 'J3', 'J4'];

export default function ScoutingPage() {
  const { matches } = useHistoryStore();
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerId>('J1');
  const [report, setReport] = useState<ScoutingReport | null>(null);

  const handleGenerate = () => {
    if (matches.length === 0) return;
    const generated = generateScoutingReport(matches, selectedPlayer);
    setReport(generated);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Scouting Report</h1>

      <Card>
        <h3 className="text-sm font-semibold mb-3">Generar Informe</h3>
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
            Generar Report
          </Button>
        </div>
        {matches.length === 0 && (
          <p className="text-xs text-muted mt-2">Necesitas al menos un partido registrado</p>
        )}
      </Card>

      {report && <ScoutingReportCard report={report} />}
    </div>
  );
}
