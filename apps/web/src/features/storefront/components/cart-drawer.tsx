'use client';

import { useCart } from '@/hooks/api/query/use-cart';
import { useCartMutations } from '@/hooks/api/mutation/use-cart-mutations';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import Link from 'next/link';

export function CartDrawer() {
  const { data: response, isLoading } = useCart();
  const { removeItem, updateItem } = useCartMutations();
  
  const cart = response?.data;
  const items = cart?.items || [];
  const itemCount = items.reduce((acc: number, item: any) => acc + item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="px-1">
          <SheetTitle>Shopping Cart ({itemCount})</SheetTitle>
        </SheetHeader>
        
        <Separator className="my-4" />

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-4">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground text-lg">Your cart is empty</p>
            <SheetTrigger asChild>
              <Button variant="outline">Continue Shopping</Button>
            </SheetTrigger>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {items.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                      {item.product?.images?.[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between py-1">
                      <div>
                        <h4 className="line-clamp-1 font-medium text-sm">{item.product?.name}</h4>
                        <p className="text-muted-foreground text-sm">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: item.currency || 'USD',
                          }).format(item.price)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateItem.mutate({ itemId: item.id, quantity: Math.max(0, item.quantity - 1) })}
                            disabled={updateItem.isPending}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm w-4 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                            disabled={updateItem.isPending}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeItem.mutate(item.id)}
                          disabled={removeItem.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator className="my-4" />
            <div className="space-y-4 px-1">
              <div className="flex items-center justify-between font-medium">
                <span>Subtotal</span>
                <span>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: cart?.currency || 'USD',
                  }).format(cart?.total || 0)}
                </span>
              </div>
              <SheetFooter className="sm:flex-col sm:space-x-0">
                <Button className="w-full" asChild>
                  <Link href="/checkout">Checkout</Link>
                </Button>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
