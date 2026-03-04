'use client';

import { useState, useEffect } from 'react';

interface ChartColors {
  foreground: string;
  muted: string;
  card: string;
  border: string;
  primary: string;
  secondary: string;
  accent: string;
  danger: string;
  team1: string;
  team2: string;
}

const defaultColors: ChartColors = {
  foreground: '#e2e8f0',
  muted: '#64748b',
  card: '#111827',
  border: '#1e293b',
  primary: '#22c55e',
  secondary: '#3b82f6',
  accent: '#f59e0b',
  danger: '#ef4444',
  team1: '#22c55e',
  team2: '#3b82f6',
};

function getColors(): ChartColors {
  if (typeof window === 'undefined') return defaultColors;
  const style = getComputedStyle(document.documentElement);
  return {
    foreground: style.getPropertyValue('--foreground').trim() || defaultColors.foreground,
    muted: style.getPropertyValue('--muted').trim() || defaultColors.muted,
    card: style.getPropertyValue('--card').trim() || defaultColors.card,
    border: style.getPropertyValue('--border').trim() || defaultColors.border,
    primary: style.getPropertyValue('--primary').trim() || defaultColors.primary,
    secondary: style.getPropertyValue('--secondary').trim() || defaultColors.secondary,
    accent: style.getPropertyValue('--accent').trim() || defaultColors.accent,
    danger: style.getPropertyValue('--danger').trim() || defaultColors.danger,
    team1: style.getPropertyValue('--team1').trim() || defaultColors.team1,
    team2: style.getPropertyValue('--team2').trim() || defaultColors.team2,
  };
}

export function useChartTheme(): ChartColors {
  const [colors, setColors] = useState<ChartColors>(defaultColors);

  useEffect(() => {
    setColors(getColors());

    const observer = new MutationObserver(() => {
      setColors(getColors());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return colors;
}
