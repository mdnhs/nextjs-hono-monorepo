'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Globe } from 'lucide-react';
import { setLocale } from '@/lib/translation/actions';
import { LOCALES, type Locale } from '@/lib/translation/locale/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  bn: 'বাংলা',
};

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchLocale(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={isPending} className='flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50'>
        <Globe className='h-4 w-4' />
        <span className='text-xs font-medium uppercase'>{locale}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {LOCALES.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => switchLocale(l)}
            className={l === locale ? 'font-semibold' : ''}
          >
            {LOCALE_LABELS[l]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
