import { Match } from '@/types/match';

const MATCHES_KEY = 'tacticalpadel_matches';

export function loadMatches(): Match[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(MATCHES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveMatch(match: Match): void {
  if (typeof window === 'undefined') return;
  const matches = loadMatches();
  const index = matches.findIndex((m) => m.id === match.id);
  if (index >= 0) {
    matches[index] = match;
  } else {
    matches.unshift(match);
  }
  localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
}

export function getMatch(id: string): Match | null {
  const matches = loadMatches();
  return matches.find((m) => m.id === id) ?? null;
}

export function deleteMatch(id: string): void {
  if (typeof window === 'undefined') return;
  const matches = loadMatches().filter((m) => m.id !== id);
  localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
}

export function clearAllMatches(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MATCHES_KEY);
}
