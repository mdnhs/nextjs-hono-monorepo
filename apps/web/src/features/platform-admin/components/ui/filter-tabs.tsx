'use client';

import { cn } from '@/lib/utils';

interface FilterTab {
  value: string;
  label: string;
  count?: number;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  value: string;
  onChange: (value: string) => void;
}

export function FilterTabs({ tabs, value, onChange }: FilterTabsProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
            value === tab.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none',
              value === tab.value ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
