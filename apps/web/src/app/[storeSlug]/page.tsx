import { storeService } from '@/services/store.service';
import { notFound, headers } from 'next/headers';
import { ProductGrid } from '@/features/storefront/components/product-grid';
import { fetchPublishedTheme } from '@/features/storefront/theme/service';
import { ThemeRenderer } from '@/features/storefront/theme/renderer';

interface StorefrontPageProps {
  params: {
    storeSlug: string;
  };
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const { storeSlug } = await params;

  const response = await storeService.getStoreBySlug(storeSlug);
  const store = response.data;
  if (!store || response.error) notFound();

  const h = await headers();
  const host = h.get('host') ?? '';
  const theme = await fetchPublishedTheme(host, store.id);

  // No published theme → fall back to the default storefront layout so new stores still render.
  if (!theme) {
    return (
      <div className="container mx-auto px-4 py-10">
        <header className="mb-10 text-center">
          <h1 className="font-heading mb-2 text-4xl font-bold">{store.name}</h1>
          {store.description && <p className="text-muted-foreground">{store.description}</p>}
        </header>
        <main>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Featured Products</h2>
          </div>
          <ProductGrid storeId={store.id} />
        </main>
      </div>
    );
  }

  return <ThemeRenderer theme={theme} ctx={{ storeId: store.id, storeSlug }} />;
}
