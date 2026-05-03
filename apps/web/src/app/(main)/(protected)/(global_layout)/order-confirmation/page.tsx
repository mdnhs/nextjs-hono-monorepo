'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center space-y-6">
      <div className="rounded-full bg-success/10 p-4">
        <CheckCircle2 className="h-16 w-16 text-success" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Order Confirmed!</h1>
        <p className="text-muted-foreground max-w-md">
          Thank you for your purchase. We've received your order and are processing it. 
          You'll receive a confirmation email shortly.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button asChild size="lg">
          <Link href="/account/orders">View My Orders</Link>
        </Button>
        <Button variant="outline" asChild size="lg">
          <Link href="/">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>
    </div>
  );
}
