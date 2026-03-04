'use client';

import { TrainingPlan } from '@/types/training';
import { Card } from '@/components/ui/Card';

interface TrainingPlanCardProps {
  plan: TrainingPlan;
}

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-500/15 text-green-400',
  intermediate: 'bg-amber-500/15 text-amber-400',
  advanced: 'bg-red-500/15 text-red-400',
};

const DIFFICULTY_LABELS = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

const CATEGORY_LABELS: Record<string, string> = {
  attack: 'Ataque',
  defense: 'Defensa',
  transition: 'Transicion',
  serve: 'Saque',
  wall: 'Pared',
};

export function TrainingPlanCard({ plan }: TrainingPlanCardProps) {
  const totalMinutes = plan.exercises.reduce((sum, e) => sum + e.durationMinutes, 0);

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold">Plan de Entrenamiento</h2>
            <p className="text-xs text-muted">Para {plan.playerName}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-primary">{totalMinutes}</div>
            <div className="text-[10px] text-muted">minutos</div>
          </div>
        </div>

        {/* Weaknesses addressed */}
        {plan.weaknesses.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-red-400 mb-1.5">Areas a Mejorar</h4>
            <div className="space-y-1">
              {plan.weaknesses.map((w, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    w.severity === 'high' ? 'bg-red-500/15 text-red-400' :
                    w.severity === 'medium' ? 'bg-amber-500/15 text-amber-400' :
                    'bg-muted/15 text-muted'
                  }`}>
                    {w.severity === 'high' ? 'ALTA' : w.severity === 'medium' ? 'MEDIA' : 'BAJA'}
                  </span>
                  <span className="flex-1">{w.area}: {w.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Exercises */}
      <div className="space-y-2">
        {plan.exercises.map((exercise, i) => (
          <Card key={exercise.id}>
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-primary/30">{i + 1}</span>
                <div>
                  <h4 className="text-sm font-semibold">{exercise.title}</h4>
                  <div className="flex gap-1.5 mt-0.5">
                    <span className={`text-[9px] px-1 py-0.5 rounded ${DIFFICULTY_COLORS[exercise.difficulty]}`}>
                      {DIFFICULTY_LABELS[exercise.difficulty]}
                    </span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-blue-500/10 text-blue-400">
                      {CATEGORY_LABELS[exercise.category] || exercise.category}
                    </span>
                    <span className="text-[9px] text-muted">{exercise.durationMinutes} min</span>
                  </div>
                </div>
              </div>
              <span className="font-mono text-xs text-muted bg-background/50 px-1.5 py-0.5 rounded">
                {exercise.targetShotType}
              </span>
            </div>
            <p className="text-xs text-muted mt-1">{exercise.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
