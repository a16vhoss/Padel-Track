'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SHOT_TYPES } from '@/components/recording/ShotTypeSelector';
import { useChartTheme } from '@/lib/utils/chartTheme';

interface ShotDistributionChartProps {
  shotsByType: Record<string, number>;
}

export function ShotDistributionChart({ shotsByType }: ShotDistributionChartProps) {
  const theme = useChartTheme();
  const data = SHOT_TYPES
    .map((st) => ({
      name: st.shortName,
      code: st.code,
      count: shotsByType[st.code] || 0,
      color: st.color,
    }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count);

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted text-sm">
        No hay datos de golpes
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Distribución de Golpes</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: theme.muted }} />
            <YAxis tick={{ fontSize: 10, fill: theme.muted }} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.card,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                fontSize: '12px',
                color: theme.foreground,
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
