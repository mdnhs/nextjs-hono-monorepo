'use client';

import { useStores } from '@/hooks/api/query/use-stores';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Plus, Store, ArrowRight, Settings } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const DashboardOverview = () => {
  const { data: response, isLoading } = useStores();
  const stores = response?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Stores</h1>
          <p className="text-muted-foreground">Manage your existing stores or create a new one.</p>
        </div>
        <Link 
          href="/dashboard/stores/new" 
          className={cn(buttonVariants({ variant: 'default' }))}
        >
          <Plus className="mr-2 h-4 w-4" /> Create Store
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse bg-muted h-[180px]" />
          ))}
        </div>
      ) : stores.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <Store className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle>No stores found</CardTitle>
          <CardDescription className="mt-2 max-w-sm">
            You haven't created any stores yet. Create your first store to start selling.
          </CardDescription>
          <Link 
            href="/dashboard/stores/new" 
            className={cn(buttonVariants({ variant: 'outline' }), "mt-6")}
          >
            Create First Store
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store: any) => (
            <Card key={store.id} className="group hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant={store.status === 'APPROVED' ? 'default' : 'secondary'}>
                    {store.status}
                  </Badge>
                  <Link 
                    href={`/dashboard/stores/${store.id}/settings`}
                    className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
                  >
                    <Settings className="h-4 w-4" />
                  </Link>
                </div>
                <CardTitle className="mt-2">{store.name}</CardTitle>
                <CardDescription className="truncate">{store.customDomain || `${store.slug}.localhost:3000`}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link 
                  href={`/store-admin/${store.id}`}
                  className={cn(buttonVariants({ variant: 'default' }), "w-full group-hover:bg-primary")}
                >
                  Manage Store <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
