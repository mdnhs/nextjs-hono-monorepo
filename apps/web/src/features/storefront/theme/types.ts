export interface ThemeBlock {
  id: string;
  type: string;
  settings: Record<string, unknown>;
  position: number;
}

export interface ThemeSection {
  id: string;
  type: string;
  settings: Record<string, unknown>;
  position: number;
  blocks: ThemeBlock[];
}

export interface PublishedTheme {
  id: string;
  storeId: string;
  name: string;
  isPublished: boolean;
  settings: Record<string, unknown>;
  sections: ThemeSection[];
}

export interface RenderContext {
  storeId: string;
  storeSlug: string;
}
