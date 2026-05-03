import type { ThemeSection, RenderContext } from '../types';
import { BlockRenderer } from '../renderer';

export function RichTextSection({ section, ctx }: { section: ThemeSection; ctx: RenderContext }) {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-10">
      <div className="prose prose-neutral mx-auto flex flex-col gap-4">
        {section.blocks.map((b) => (
          <BlockRenderer key={b.id} block={b} ctx={ctx} />
        ))}
      </div>
    </section>
  );
}
