'use client';

import { useStoreOrders } from '@/hooks/api/query/use-orders';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useParams } from 'next/navigation';

export default function StoreOrdersPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const { data: response, isLoading } = useStoreOrders(storeId);
  const orders = response?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">Manage and fulfill your store's orders.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>A list of recent orders from your store.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.orderNumber || order.id.substring(0, 8)}
                    </TableCell>
                    <TableCell>{order.user?.name || 'Guest Customer'}</TableCell>
                    <TableCell>
                      <Badge variant={
                        order.status === 'DELIVERED' ? 'success' : 
                        order.status === 'CANCELLED' ? 'destructive' : 
                        'default'
                      }>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(order.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right font-medium">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: order.currency || 'USD',
                      }).format(order.total)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
