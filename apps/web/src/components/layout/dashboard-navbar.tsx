'use client';

import { Bell, ExternalLink } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/features/auth/hooks/api/mutation/use-logout';

export function DashboardNavbar() {
  const logout = useLogout();

  return (
    <div className="flex h-16 items-center justify-end gap-1 px-4">
      <LocaleSwitcher />
      <ThemeToggle />
      <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
        <Bell className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Visit storefront"
        onClick={() => window.open('/', '_blank')}
      >
        <ExternalLink className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
      >
        Logout
      </Button>
    </div>
  );
}
