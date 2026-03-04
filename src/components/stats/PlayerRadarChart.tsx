'use client';

interface RadarStat {
  label: string;
  value: number; // 0-100
}

interface PlayerRadarChartProps {
  stats: RadarStat[];
  playerName: string;
  color: string;
}

export function PlayerRadarChart({ stats, playerName, color }: PlayerRadarChartProps) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 70;
  const levels = 5;
  const n = stats.length;

  const getPoint = (i: number, value: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Grid polygons
  const gridPolygons = Array.from({ length: levels }, (_, level) => {
    const r = ((level + 1) / levels) * 100;
    return stats.map((_, i) => {
      const p = getPoint(i, r);
      return `${p.x},${p.y}`;
    }).join(' ');
  });

  // Data polygon
  const dataPolygon = stats.map((s, i) => {
    const p = getPoint(i, s.value);
    return `${p.x},${p.y}`;
  }).join(' ');

  // Axis lines
  const axes = stats.map((_, i) => {
    const p = getPoint(i, 100);
    return { x1: cx, y1: cy, x2: p.x, y2: p.y };
  });

  // Label positions (pushed out beyond the polygon)
  const labels = stats.map((s, i) => {
    const p = getPoint(i, 120);
    return { ...p, label: s.label, value: s.value };
  });

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-semibold mb-1 truncate max-w-[180px]">{playerName}</div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Grid */}
        {gridPolygons.map((points, i) => (
          <polygon
            key={`grid-${i}`}
            points={points}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.5"
          />
        ))}

        {/* Axes */}
        {axes.map((a, i) => (
          <line
            key={`axis-${i}`}
            x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.5"
          />
        ))}

        {/* Data polygon */}
        <polygon
          points={dataPolygon}
          fill={color}
          fillOpacity={0.2}
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {stats.map((s, i) => {
          const p = getPoint(i, s.value);
          return (
            <circle
              key={`dot-${i}`}
              cx={p.x} cy={p.y} r="3"
              fill={color}
              stroke="white"
              strokeWidth="1"
            />
          );
        })}

        {/* Labels */}
        {labels.map((l, i) => (
          <g key={`label-${i}`}>
            <text
              x={l.x}
              y={l.y - 5}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted"
              fontSize="8"
              fontWeight="500"
            >
              {l.label}
            </text>
            <text
              x={l.x}
              y={l.y + 6}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={color}
              fontSize="9"
              fontWeight="700"
            >
              {l.value}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
