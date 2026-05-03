'use client';

import { useCartMutations } from '@/hooks/api/mutation/use-cart-mutations';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
  productId: string;
  variantId?: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function AddToCartButton({ productId, variantId, className, size = 'default' }: AddToCartButtonProps) {
  const { addItem } = useCartMutations();

  const handleAdd = () => {
    addItem.mutate({
      productId,
      variantId: variantId || '', // Handle default variant if not provided
      quantity: 1,
    });
  };

  return (
    <Button 
      className={cn("gap-2", className)} 
      onClick={handleAdd} 
      disabled={addItem.isPending}
      size={size}
    >
      <ShoppingCart className="h-4 w-4" />
      {size !== 'icon' && 'Add to Cart'}
    </Button>
  );
}
