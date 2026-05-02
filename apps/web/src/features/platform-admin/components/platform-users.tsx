'use client';

import { useState } from 'react';
import { usePlatformUsers, usePlatformUserDetails } from '../hooks/api/query/use-users';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Mail, Calendar, Store, AlertCircle, RefreshCw, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { PlatformUser } from '../types';
import { PageHeader } from './ui/page-header';
import { FilterTabs } from './ui/filter-tabs';
import { StatusBadge } from './ui/status-badge';
import { InitialAvatar } from './ui/initial-avatar';

function TableSkeleton() {
  return (
    <Card>
      <div className="divide-y">
        <div className="flex gap-4 bg-muted/50 px-4 py-3">
          {[160, 80, 60, 100, 80].map((w, i) => (
            <Skeleton key={i} className="h-3" style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-14 rounded-md" />
          </div>
        ))}
      </div>
    </Card>
  );
}

const ROLE_TABS = [
  { value: 'all', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'seller', label: 'Sellers' },
  { value: 'buyer', label: 'Buyers' },
];

function UserDetailDialog({ userId, open, onClose }: { userId: string; open: boolean; onClose: () => void }) {
  const { data, isLoading } = usePlatformUserDetails(userId);
  const user = data?.data as any;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !user ? (
          <p className="py-8 text-center text-sm text-muted-foreground">User not found</p>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <InitialAvatar name={user.name} size="md" />
              <div className="min-w-0">
                <p className="font-semibold">{user.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />{user.email}
                </p>
              </div>
              <StatusBadge status={user.role} />
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Joined {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            {user.stores?.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Stores ({user.stores.length})
                </p>
                <div className="space-y-1.5">
                  {user.stores.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                      <div>
                        <span className="text-sm font-medium">{s.name}</span>
                        <span className="ml-1.5 font-mono text-xs text-muted-foreground">/{s.slug}</span>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export const PlatformUsers = ({ role }: { role?: string }) => {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const params = role ? { role } : undefined;
  const { data, isLoading, error, refetch } = usePlatformUsers(params);

  const users = (data?.data as PlatformUser[]) || [];

  const handleRoleFilter = (val: string) => {
    if (val === 'all') router.push('/admin/users');
    else router.push(`/admin/users?role=${val}`);
  };

  if (isLoading) return <TableSkeleton />;

  if (error || data?.error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-destructive/50" />
        <p className="text-sm text-muted-foreground">{data?.message ?? 'Failed to load users'}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users"
        description={`${users.length} user${users.length !== 1 ? 's' : ''}${role ? ` · ${role}` : ''}`}
      />

      <FilterTabs tabs={ROLE_TABS} value={role || 'all'} onChange={handleRoleFilter} />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {['User', 'Role', 'Stores', 'Joined', 'Actions'].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground ${i === 4 ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center justify-center gap-2 py-16">
                      <Users className="h-10 w-10 text-muted-foreground/20" />
                      <p className="text-sm text-muted-foreground">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="group transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <InitialAvatar name={user.name} />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{user.name}</p>
                          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                            <Mail className="h-2.5 w-2.5 shrink-0" />{user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.role} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Store className="h-3.5 w-3.5" />
                        <span className="font-mono">{user._count?.stores ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs opacity-70 transition-opacity group-hover:opacity-100"
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedUserId && (
        <UserDetailDialog
          userId={selectedUserId}
          open={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
};
