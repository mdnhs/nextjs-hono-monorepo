'use client';

import { useCategories } from '@/hooks/api/query/use-categories';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function CategoryNav() {
  const { data: response, isLoading } = useCategories();
  const pathname = usePathname();
  
  const categories = response?.data || [];

  if (isLoading) {
    return (
      <div className="flex gap-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-20" />
        ))}
      </div>
    );
  }

  return (
    <nav className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-hide">
      <Link
        href="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
          pathname === "/" ? "text-primary" : "text-muted-foreground"
        )}
      >
        All Products
      </Link>
      {categories.map((category: any) => (
        <Link
          key={category.id}
          href={`/category/${category.slug}`}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
            pathname === `/category/${category.slug}` ? "text-primary" : "text-muted-foreground"
          )}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
