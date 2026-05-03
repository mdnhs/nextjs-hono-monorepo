'use client';

import { useStoreProducts } from '@/hooks/api/query/use-products';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';

interface ProductGridProps {
  storeId: string;
}

export function ProductGrid({ storeId }: ProductGridProps) {
  const { data: response, isLoading } = useStoreProducts(storeId, { limit: 20 });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-[350px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const products = response?.data ?? [];

  if (products.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground">No products found for this store.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <div className="relative aspect-square">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover transition-transform hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <span className="text-muted-foreground text-xs">No image</span>
              </div>
            )}
            {!product.isActive && (
              <Badge variant="destructive" className="absolute top-2 right-2">
                Inactive
              </Badge>
            )}
          </div>
          <CardHeader className="p-4">
            <div className="flex items-start justify-between">
              <CardTitle className="line-clamp-1 text-lg">{product.name}</CardTitle>
            </div>
            {product.category && (
              <p className="text-muted-foreground text-xs">{product.category.name}</p>
            )}
          </CardHeader>
          <CardContent className="px-4 pb-2">
            <p className="font-bold text-xl">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: product.currency || 'USD',
              }).format(product.price)}
            </p>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button className="w-full gap-2">
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
