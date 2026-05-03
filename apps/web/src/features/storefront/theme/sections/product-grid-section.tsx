import { ProductGrid } from '../../components/product-grid';
import type { ThemeSection, RenderContext } from '../types';

interface Settings {
  heading?: string;
}

export function ProductGridSection({ section, ctx }: { section: ThemeSection; ctx: RenderContext }) {
  const s = section.settings as Settings;
  return (
    <section className="container mx-auto px-4 py-12">
      {s.heading && <h2 className="mb-8 font-heading text-2xl font-semibold">{s.heading}</h2>}
      <ProductGrid storeId={ctx.storeId} />
    </section>
  );
}
