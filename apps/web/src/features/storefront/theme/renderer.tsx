import { SECTION_REGISTRY, BLOCK_REGISTRY } from './registry';
import type { PublishedTheme, ThemeSection, ThemeBlock, RenderContext } from './types';

export function ThemeRenderer({ theme, ctx }: { theme: PublishedTheme; ctx: RenderContext }) {
  return (
    <>
      {theme.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} ctx={ctx} />
      ))}
    </>
  );
}

export function SectionRenderer({ section, ctx }: { section: ThemeSection; ctx: RenderContext }) {
  const Component = SECTION_REGISTRY[section.type];
  if (!Component) {
    if (process.env.NODE_ENV !== 'production') {
      return (
        <div className="border border-dashed p-4 text-sm text-muted-foreground">
          Unknown section type: <code>{section.type}</code>
        </div>
      );
    }
    return null;
  }
  return <Component section={section} ctx={ctx} />;
}

export function BlockRenderer({ block, ctx }: { block: ThemeBlock; ctx: RenderContext }) {
  const Component = BLOCK_REGISTRY[block.type];
  if (!Component) {
    if (process.env.NODE_ENV !== 'production') {
      return <div className="text-xs text-muted-foreground">Unknown block: {block.type}</div>;
    }
    return null;
  }
  return <Component block={block} ctx={ctx} />;
}
