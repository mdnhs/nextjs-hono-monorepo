'use client';

import { usePlatformDashboard } from '../hooks/api/query/use-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export const PlatformOverview = () => {
  const { data, isLoading, error } = usePlatformDashboard();
  console.log(data, '&&');
  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (error || data?.error) {
    return <div className='py-12 text-center text-destructive'>{data?.message ?? 'Failed to load dashboard'}</div>;
  }

  const dashboard = data?.data;

  return (
    <div>
      <h1 className='mb-1 text-2xl font-bold'>Platform Overview</h1>
      <p className='mb-6 text-sm text-muted-foreground'>Manage stores, users, plans, and billing.</p>

      <div className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Total Stores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{dashboard?.stores.total ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Approved Stores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{dashboard?.stores.approved ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Pending Stores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{dashboard?.stores.pending ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{dashboard?.users.total ?? 0}</div>
            <p className='mt-1 text-xs text-muted-foreground'>{dashboard?.users.sellers ?? 0} sellers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{dashboard?.products ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{dashboard?.orders ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>${dashboard?.revenue?.toLocaleString() ?? 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
