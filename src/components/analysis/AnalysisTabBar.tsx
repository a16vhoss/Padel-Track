'use client';

export type AnalysisTab = 'heatmap' | 'winnersErrors' | 'zoneFlow' | 'pointReplay';

interface AnalysisTabBarProps {
  activeTab: AnalysisTab;
  onTabChange: (tab: AnalysisTab) => void;
}

const TABS: { id: AnalysisTab; label: string; icon: string }[] = [
  { id: 'heatmap', label: 'Calor', icon: '🔥' },
  { id: 'winnersErrors', label: 'W vs X', icon: '🎯' },
  { id: 'zoneFlow', label: 'Flujo', icon: '↗' },
  { id: 'pointReplay', label: 'Replay', icon: '▶' },
];

export function AnalysisTabBar({ activeTab, onTabChange }: AnalysisTabBarProps) {
  return (
    <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors
            flex items-center justify-center gap-1.5
            ${activeTab === tab.id
              ? 'bg-primary text-black'
              : 'text-muted hover:text-foreground hover:bg-card-hover'
            }
          `}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
