'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export function NavBar() {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-primary">TacticalPadel</span>
          <span className="text-muted text-sm font-normal">AI v2.1</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-muted hover:text-foreground transition-colors">
            Partidos
          </Link>
          <Link href="/ligas" className="text-sm text-muted hover:text-foreground transition-colors">
            Ligas
          </Link>
          <Link href="/entrenamiento" className="text-sm text-muted hover:text-foreground transition-colors">
            Entreno
          </Link>
          <ThemeToggle />
          <Link
            href="/partido/nuevo"
            className="text-sm bg-primary text-black px-3 py-1.5 rounded-md font-medium hover:bg-primary-hover transition-colors"
          >
            Nuevo Partido
          </Link>
        </div>
      </nav>
    </header>
  );
}
