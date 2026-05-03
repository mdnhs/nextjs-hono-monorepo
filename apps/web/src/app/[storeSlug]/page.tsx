import { storeService } from '@/services/store.service';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/features/storefront/components/product-grid';

interface StorefrontPageProps {
  params: {
    storeSlug: string;
  };
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const { storeSlug } = await params;
  
  const response = await storeService.getStoreBySlug(storeSlug);
  const store = response.data;

  if (!store || response.error) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-2 font-heading">{store.name}</h1>
        {store.description && (
          <p className="text-muted-foreground">{store.description}</p>
        )}
      </header>

      <main>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">Featured Products</h2>
        </div>
        
        <ProductGrid storeId={store.id} />
      </main>
    </div>
  );
}
