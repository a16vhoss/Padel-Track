'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Tab {
  label: string;
  href: string;
}

interface TabsProps {
  tabs: Tab[];
}

export function Tabs({ tabs }: TabsProps) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${isActive
                ? 'bg-primary text-black'
                : 'text-muted hover:text-foreground hover:bg-card-hover'
              }
            `}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
