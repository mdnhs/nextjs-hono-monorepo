import { storeService } from '@/services/store.service';
import { headers } from 'next/headers';
import { ProductGrid } from '@/features/storefront/components/product-grid';
import { fetchPublishedTheme } from '@/features/storefront/theme/service';
import { ThemeRenderer } from '@/features/storefront/theme/renderer';
import { StorefrontHeader } from '@/features/storefront/components/storefront-header';
import { Separator } from '@/components/ui/separator';
import { notFound } from 'next/navigation';

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
      <div className="flex min-h-screen flex-col">
        <StorefrontHeader storeName={store.name} />
        <main className="container mx-auto flex-1 px-4 py-10">
          <header className="mb-10">
            <h1 className="font-heading mb-2 text-4xl font-bold">{store.name}</h1>
            {store.description && <p className="text-muted-foreground">{store.description}</p>}
          </header>
          
          <div className="mb-12">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Featured Products</h2>
            </div>
            <ProductGrid storeId={store.id} />
          </div>

          <Separator className="my-12" />

          <section id="reviews" className="scroll-mt-20 text-center">
            <h2 className="mb-4 text-3xl font-bold">What our customers say</h2>
            <p className="text-muted-foreground italic max-w-2xl mx-auto">
              "This store has the best products I've ever bought online! Fast shipping and great quality."
            </p>
            <div className="mt-6 flex justify-center gap-1 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-xl">★</span>
              ))}
            </div>
          </section>
        </main>
        <footer className="border-t py-10 text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} {store.name}. Powered by Ecommerce Platform.
        </footer>
      </div>
    );
  }

  return <ThemeRenderer theme={theme} ctx={{ storeId: store.id, storeSlug }} />;
}
