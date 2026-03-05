'use client';

import { useEffect, useState } from 'react';
import { useHistoryStore } from '@/stores/historyStore';
import { MatchList } from '@/components/match/MatchList';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ImportMatchModal } from '@/components/match/ImportMatchModal';
import { formatDuration } from '@/lib/utils/relativeTime';
import { PageTransition, StaggerContainer, StaggerItem, FadeIn } from '@/components/motion';

function StatCard({ value, label, color = 'text-foreground' }: { value: string | number; label: string; color?: string }) {
  return (
    <div className="gradient-border">
      <div className="bg-card rounded-xl p-4 text-center">
        <div className={`text-2xl font-black ${color}`}>{value}</div>
        <div className="text-[11px] text-muted mt-0.5 font-medium">{label}</div>
      </div>
    </div>
  );
}

function QuickLinkCard({ href, icon, title, description }: { href: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <Link href={href}>
      <div className="glass-card rounded-xl p-4 text-center hover:bg-card-hover cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group">
        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
        <div className="text-sm font-bold">{title}</div>
        <p className="text-[11px] text-muted mt-0.5">{description}</p>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="gradient-border">
      <div className="bg-card rounded-xl p-4 text-center">
        <div className="skeleton h-7 w-12 mx-auto mb-1.5 rounded" />
        <div className="skeleton h-3 w-16 mx-auto rounded" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const { matches, loadAll, deleteMatch } = useHistoryStore();
  const [showImport, setShowImport] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadAll();
    setIsLoaded(true);
  }, [loadAll]);

  const finishedMatches = matches.filter((m) => m.status === 'finished');
  const activeMatches = matches.filter((m) => m.status === 'live');
  const totalPoints = matches.reduce(
    (sum, m) => sum + m.sets.reduce((sSum, s) => sSum + s.games.reduce((gSum, g) => gSum + g.points.length, 0), 0),
    0
  );
  const totalTime = matches.reduce((sum, m) => sum + (m.totalDurationMs || 0), 0);

  // Calculate win streak
  const getWinStreak = () => {
    let streak = 0;
    for (const m of [...finishedMatches].reverse()) {
      if (m.winner) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  return (
    <PageTransition className="max-w-2xl mx-auto space-y-6">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-secondary/15" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/8 rounded-full blur-3xl" />
        <div className="relative p-6 border border-border/30 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                <span className="text-primary">Tactical</span>
                <span className="text-foreground">Padel</span>
              </h1>
              <p className="text-sm text-muted mt-1.5 font-medium">Registro y analisis tactico de padel</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="lg" variant="outline" onClick={() => setShowImport(true)} className="btn-press">
                Importar
              </Button>
              <Link href="/partido/nuevo">
                <Button size="lg" className="btn-press">Nuevo Partido</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Active match banner */}
      {activeMatches.length > 0 && (
        <Link href={`/partido/${activeMatches[0].id}/registro`}>
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-3 hover:bg-primary/15 transition-colors cursor-pointer animate-fade-in-up">
            <span className="w-2.5 h-2.5 rounded-full bg-primary serve-indicator flex-shrink-0" />
            <div className="flex-1">
              <span className="text-sm font-bold">Partido en curso</span>
              <span className="text-xs text-muted ml-2">
                {activeMatches[0].teams[0].name} vs {activeMatches[0].teams[1].name}
              </span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      )}

      {/* Global stats */}
      {!isLoaded ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : matches.length > 0 ? (
        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StaggerItem><StatCard value={matches.length} label="Partidos" /></StaggerItem>
          <StaggerItem><StatCard value={finishedMatches.length} label="Finalizados" color="text-primary" /></StaggerItem>
          <StaggerItem><StatCard value={totalPoints} label="Puntos jugados" color="text-secondary" /></StaggerItem>
          <StaggerItem><StatCard value={formatDuration(totalTime) || '0m'} label="Tiempo total" color="text-accent" /></StaggerItem>
        </StaggerContainer>
      ) : null}

      {/* Win streak badge */}
      {finishedMatches.length > 0 && getWinStreak() > 1 && (
        <FadeIn className="flex items-center justify-center gap-2 py-2">
          <span className="text-xs text-muted">Racha actual:</span>
          <span className="px-2 py-0.5 bg-primary/15 text-primary rounded-full text-xs font-bold">
            {getWinStreak()} victorias
          </span>
        </FadeIn>
      )}

      {/* Quick links */}
      <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StaggerItem><QuickLinkCard href="/ligas" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>} title="Ligas" description="Clasificaciones" /></StaggerItem>
        <StaggerItem><QuickLinkCard href="/entrenamiento" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline"><path d="m6.5 6.5 11 11" /><path d="m21 21-1-1" /><path d="m3 3 1 1" /><path d="m18 22 4-4" /><path d="m2 6 4-4" /><path d="m3 10 7-7" /><path d="m14 21 7-7" /></svg>} title="Entreno" description="Plan de entreno" /></StaggerItem>
        <StaggerItem><QuickLinkCard href="/scouting" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>} title="Scouting" description="Informes rivales" /></StaggerItem>
        <StaggerItem><QuickLinkCard href="/espectador" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>} title="Espectador" description="Seguir en vivo" /></StaggerItem>
        <StaggerItem><QuickLinkCard href="/estadisticas" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>} title="Stats" description="Dashboard global" /></StaggerItem>
        <StaggerItem><QuickLinkCard href="/jugadores" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>} title="Jugadores" description="Perfiles y stats" /></StaggerItem>
      </StaggerContainer>

      {/* Match list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Partidos</h2>
          {matches.length > 0 && (
            <span className="text-xs text-muted">{matches.length} total</span>
          )}
        </div>
        {!isLoaded ? (
          <div className="space-y-3">
            <div className="skeleton h-20 w-full" />
            <div className="skeleton h-20 w-full" />
            <div className="skeleton h-20 w-full" />
          </div>
        ) : (
          <MatchList matches={matches} onDelete={deleteMatch} />
        )}
      </div>

      {showImport && (
        <ImportMatchModal isOpen={showImport} onClose={() => setShowImport(false)} onImported={() => { setShowImport(false); loadAll(); }} />
      )}
    </PageTransition>
  );
}
