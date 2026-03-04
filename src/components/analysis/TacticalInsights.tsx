'use client';

import { TacticalRecommendation, MatchNarrative } from '@/lib/ai/tacticalAnalysis';
import { Card } from '@/components/ui/Card';

interface TacticalInsightsProps {
  recommendations: TacticalRecommendation[];
  narrative: MatchNarrative;
}

export function TacticalInsights({ recommendations, narrative }: TacticalInsightsProps) {
  return (
    <div className="space-y-4">
      {/* Match Narrative */}
      <Card>
        <h3 className="text-sm font-semibold mb-2">Resumen Narrativo</h3>
        <p className="text-xs text-foreground/80 mb-2">{narrative.summary}</p>
        <p className="text-xs text-muted italic">{narrative.tacticalSummary}</p>

        {narrative.keyMoments.length > 0 && (
          <div className="mt-3 pt-2 border-t border-border/30">
            <div className="text-[10px] text-muted uppercase mb-1">Momentos Clave</div>
            <ul className="space-y-0.5">
              {narrative.keyMoments.map((m, i) => (
                <li key={i} className="text-xs text-foreground/70 flex items-start gap-1">
                  <span className="text-amber-400 mt-0.5">-</span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        {Object.keys(narrative.playerHighlights).length > 0 && (
          <div className="mt-3 pt-2 border-t border-border/30">
            <div className="text-[10px] text-muted uppercase mb-1">Jugadores</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(narrative.playerHighlights).map(([name, highlights]) => (
                <div key={name} className="text-[10px]">
                  <span className="font-semibold">{name}:</span>{' '}
                  <span className="text-muted">{highlights.join(', ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Tactical Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold mb-3">Recomendaciones Tacticas (IA)</h3>
          <div className="space-y-2">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className={`rounded-md p-2.5 border ${
                  rec.type === 'strength' ? 'bg-green-500/5 border-green-500/20' :
                  rec.type === 'weakness' ? 'bg-red-500/5 border-red-500/20' :
                  rec.type === 'opportunity' ? 'bg-amber-500/5 border-amber-500/20' :
                  'bg-blue-500/5 border-blue-500/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    rec.type === 'strength' ? 'bg-green-500/15 text-green-400' :
                    rec.type === 'weakness' ? 'bg-red-500/15 text-red-400' :
                    rec.type === 'opportunity' ? 'bg-amber-500/15 text-amber-400' :
                    'bg-blue-500/15 text-blue-400'
                  }`}>
                    {rec.type === 'strength' ? 'Fortaleza' :
                     rec.type === 'weakness' ? 'Debilidad' :
                     rec.type === 'opportunity' ? 'Oportunidad' : 'Estrategia'}
                  </span>
                  <span className={`text-[9px] px-1 py-0.5 rounded ${
                    rec.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                    rec.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-muted/10 text-muted'
                  }`}>
                    {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Media' : 'Baja'}
                  </span>
                </div>
                <div className="text-xs font-medium mb-0.5">{rec.title}</div>
                <div className="text-[10px] text-muted">{rec.description}</div>
                <div className="text-[9px] text-muted/60 mt-1">{rec.basedOn}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
