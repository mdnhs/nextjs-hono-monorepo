import { HeroSection } from './sections/hero';
import { ProductGridSection } from './sections/product-grid-section';
import { RichTextSection } from './sections/rich-text';
import { HeadingBlock } from './blocks/heading';
import { ButtonBlock } from './blocks/button';
import { RichTextBlock } from './blocks/rich-text-block';
import type { ThemeBlock, ThemeSection, RenderContext } from './types';

type SectionComponent = (props: { section: ThemeSection; ctx: RenderContext }) => JSX.Element | null;
type BlockComponent = (props: { block: ThemeBlock; ctx: RenderContext }) => JSX.Element | null;

// Adding a new section/block type? Register it here. Frontend renderer will dispatch by `type`.
export const SECTION_REGISTRY: Record<string, SectionComponent> = {
  hero: HeroSection,
  product_grid: ProductGridSection,
  rich_text: RichTextSection,
};

export const BLOCK_REGISTRY: Record<string, BlockComponent> = {
  heading: HeadingBlock,
  button: ButtonBlock,
  rich_text: RichTextBlock,
};
