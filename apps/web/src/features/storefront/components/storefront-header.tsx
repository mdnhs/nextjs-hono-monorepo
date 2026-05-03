'use client';

import { CartDrawer } from './cart-drawer';
import { CategoryNav } from './category-nav';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface StorefrontHeaderProps {
  storeName: string;
}

export function StorefrontHeader({ storeName }: StorefrontHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">{storeName}</span>
          </Link>

          <div className="hidden flex-1 items-center justify-center md:flex max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full bg-muted pl-9 md:w-[300px] lg:w-[400px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CartDrawer />
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
        
        <div className="flex h-10 items-center border-t border-transparent py-2">
          <CategoryNav />
        </div>
      </div>
    </header>
  );
}

import { Button } from '@/components/ui/button';
