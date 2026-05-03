'use client';

import { useStore } from '@/hooks/api/query/use-stores';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Users, CreditCard, Settings, ArrowUpRight, Package, Palette, Globe } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export const StoreOverview = () => {
  const params = useParams();
  const storeId = params.storeId as string;
  const { data: response, isLoading } = useStore(storeId);
  const store = response?.data;

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-10 w-[250px]' />
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className='h-32 w-full' />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { title: 'Total Sales', value: '$1,234.56', icon: CreditCard, color: 'text-blue-600' },
    { title: 'Active Orders', value: '12', icon: ShoppingBag, color: 'text-green-600' },
    { title: 'Customers', value: '45', icon: Users, color: 'text-purple-600' },
    { title: 'Products', value: '8', icon: Package, color: 'text-orange-600' },
  ];

  const quickLinks = [
    { title: 'Product Inventory', href: `/store-admin/${storeId}/content`, icon: Package },
    { title: 'Store Design', href: `/store-admin/${storeId}/cms`, icon: Palette },
    { title: 'Domain Settings', href: `/store-admin/${storeId}/settings`, icon: Globe },
    { title: 'Staff & Team', href: `/store-admin/${storeId}/settings`, icon: Users },
  ];

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Dashboard: {store?.name}</h1>
        <p className='text-muted-foreground'>Welcome back! Here&apos;s what&apos;s happening with your store today.</p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stat.value}</div>
              <p className='text-xs text-muted-foreground'>+2.5% from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='md:col-span-4'>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>You have 5 orders to fulfill today.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {[...Array(3)].map((_, i) => (
                <div key={i} className='flex items-center gap-4'>
                  <div className='flex h-9 w-9 items-center justify-center rounded-full bg-muted font-medium'>JD</div>
                  <div className='flex-1 space-y-1'>
                    <p className='text-sm font-medium leading-none'>John Doe</p>
                    <p className='text-xs text-muted-foreground'>Order #3421 • 2 items</p>
                  </div>
                  <div className='text-sm font-medium'>+$89.00</div>
                </div>
              ))}
            </div>
            <Link
              href={`/store-admin/${storeId}/orders`}
              className='mt-6 block text-center text-sm font-medium text-primary hover:underline'
            >
              View all orders
            </Link>
          </CardContent>
        </Card>

        <Card className='md:col-span-3'>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-2'>
            {quickLinks.map((link) => (
              <Link key={link.title} href={link.href}>
                <Button variant='outline' className='w-full justify-between'>
                  <span className='flex items-center gap-2'>
                    <link.icon className='h-4 w-4' />
                    {link.title}
                  </span>
                  <ArrowUpRight className='h-4 w-4 text-muted-foreground' />
                </Button>
              </Link>
            ))}
            <Link href={`/store-admin/${storeId}/settings`}>
              <Button variant='default' className='mt-4 w-full'>
                <Settings className='mr-2 h-4 w-4' />
                Store Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
