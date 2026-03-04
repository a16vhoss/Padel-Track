'use client';

import { CourtSVG } from '@/components/court/CourtSVG';

interface ZoneHeatmapProps {
  shotsByZone: Record<number, number>;
}

export function ZoneHeatmap({ shotsByZone }: ZoneHeatmapProps) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Mapa de Calor por Zona</h3>
      <CourtSVG
        selectedDestination={null}
        onSelectZone={() => {}}
        heatmapData={shotsByZone}
        showLabels={false}
      />
    </div>
  );
}
