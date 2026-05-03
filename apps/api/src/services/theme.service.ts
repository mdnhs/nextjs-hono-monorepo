import { db } from '../db'
import { themes, themeSections, themeBlocks } from '../db/schema'
import { and, eq, asc, sql } from 'drizzle-orm'
import { revalidateNext, tagFor } from '../utils/revalidate'

export interface CreateThemeInput {
  storeId: string
  name: string
  settings?: Record<string, unknown>
}

export interface SectionInput {
  themeId: string
  type: string
  settings?: Record<string, unknown>
  position?: number
}

export interface BlockInput {
  sectionId: string
  type: string
  settings?: Record<string, unknown>
  position?: number
}

export class ThemeService {
  // Public storefront read: returns the published theme assembled with sections + ordered blocks.
  // Returns null if the store has not published anything yet.
  async getPublishedTheme(storeId: string) {
    const theme = await db.query.themes.findFirst({
      where: and(eq(themes.storeId, storeId), eq(themes.isPublished, true)),
      with: {
        sections: {
          orderBy: (s, { asc }) => [asc(s.position)],
          with: { blocks: { orderBy: (b, { asc }) => [asc(b.position)] } },
        },
      },
    })
    return theme ?? null
  }

  async listThemes(storeId: string) {
    return db.query.themes.findMany({
      where: eq(themes.storeId, storeId),
      orderBy: (t, { desc }) => [desc(t.updatedAt)],
    })
  }

  async getThemeWithLayout(themeId: string) {
    return db.query.themes.findFirst({
      where: eq(themes.id, themeId),
      with: {
        sections: {
          orderBy: (s, { asc }) => [asc(s.position)],
          with: { blocks: { orderBy: (b, { asc }) => [asc(b.position)] } },
        },
      },
    })
  }

  async createTheme(input: CreateThemeInput) {
    const [row] = await db
      .insert(themes)
      .values({ storeId: input.storeId, name: input.name, settings: input.settings ?? {} })
      .returning()
    return row
  }

  async updateTheme(themeId: string, patch: Partial<CreateThemeInput>) {
    const [row] = await db
      .update(themes)
      .set({
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.settings !== undefined ? { settings: patch.settings } : {}),
      })
      .where(eq(themes.id, themeId))
      .returning()
    if (row?.isPublished) await revalidateNext([tagFor.theme(row.storeId)])
    return row
  }

  // Publishing is mutually exclusive: only one theme per store can be published. Done atomically.
  async publishTheme(themeId: string) {
    return db.transaction(async (tx) => {
      const target = await tx.query.themes.findFirst({ where: eq(themes.id, themeId) })
      if (!target) throw new Error('Theme not found')

      await tx
        .update(themes)
        .set({ isPublished: false })
        .where(and(eq(themes.storeId, target.storeId), eq(themes.isPublished, true)))

      const [row] = await tx
        .update(themes)
        .set({ isPublished: true })
        .where(eq(themes.id, themeId))
        .returning()
      await revalidateNext([tagFor.theme(target.storeId)])
      return row
    })
  }

  async deleteTheme(themeId: string) {
    const existing = await db.query.themes.findFirst({ where: eq(themes.id, themeId) })
    await db.delete(themes).where(eq(themes.id, themeId))
    if (existing?.isPublished) await revalidateNext([tagFor.theme(existing.storeId)])
  }

  // Look up the storeId for a section/block so we can dispatch revalidation.
  // Cheap (indexed FK chain) but only used on admin writes — skip on hot paths.
  private async storeIdForSection(sectionId: string): Promise<string | null> {
    const row = await db.query.themeSections.findFirst({
      where: eq(themeSections.id, sectionId),
      with: { theme: { columns: { storeId: true, isPublished: true } } },
    })
    return row?.theme?.isPublished ? row.theme.storeId : null
  }

  private async storeIdForBlock(blockId: string): Promise<string | null> {
    const row = await db.query.themeBlocks.findFirst({
      where: eq(themeBlocks.id, blockId),
      with: {
        section: {
          with: { theme: { columns: { storeId: true, isPublished: true } } },
        },
      },
    })
    return row?.section?.theme?.isPublished ? row.section.theme.storeId : null
  }

  // Sections.
  async addSection(input: SectionInput) {
    const position = input.position ?? (await this.nextPosition('section', input.themeId))
    const [row] = await db
      .insert(themeSections)
      .values({
        themeId: input.themeId,
        type: input.type,
        settings: input.settings ?? {},
        position,
      })
      .returning()
    const theme = await db.query.themes.findFirst({ where: eq(themes.id, input.themeId), columns: { storeId: true, isPublished: true } })
    if (theme?.isPublished) await revalidateNext([tagFor.theme(theme.storeId)])
    return row
  }

  async updateSection(sectionId: string, patch: Partial<Omit<SectionInput, 'themeId'>>) {
    const [row] = await db
      .update(themeSections)
      .set({
        ...(patch.type !== undefined ? { type: patch.type } : {}),
        ...(patch.settings !== undefined ? { settings: patch.settings } : {}),
        ...(patch.position !== undefined ? { position: patch.position } : {}),
      })
      .where(eq(themeSections.id, sectionId))
      .returning()
    const storeId = await this.storeIdForSection(sectionId)
    if (storeId) await revalidateNext([tagFor.theme(storeId)])
    return row
  }

  async reorderSections(themeId: string, orderedIds: string[]) {
    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx
          .update(themeSections)
          .set({ position: i })
          .where(and(eq(themeSections.id, orderedIds[i]), eq(themeSections.themeId, themeId)))
      }
    })
  }

  async deleteSection(sectionId: string) {
    const storeId = await this.storeIdForSection(sectionId)
    await db.delete(themeSections).where(eq(themeSections.id, sectionId))
    if (storeId) await revalidateNext([tagFor.theme(storeId)])
  }

  // Blocks.
  async addBlock(input: BlockInput) {
    const position = input.position ?? (await this.nextPosition('block', input.sectionId))
    const [row] = await db
      .insert(themeBlocks)
      .values({
        sectionId: input.sectionId,
        type: input.type,
        settings: input.settings ?? {},
        position,
      })
      .returning()
    return row
  }

  async updateBlock(blockId: string, patch: Partial<Omit<BlockInput, 'sectionId'>>) {
    const [row] = await db
      .update(themeBlocks)
      .set({
        ...(patch.type !== undefined ? { type: patch.type } : {}),
        ...(patch.settings !== undefined ? { settings: patch.settings } : {}),
        ...(patch.position !== undefined ? { position: patch.position } : {}),
      })
      .where(eq(themeBlocks.id, blockId))
      .returning()
    return row
  }

  async reorderBlocks(sectionId: string, orderedIds: string[]) {
    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx
          .update(themeBlocks)
          .set({ position: i })
          .where(and(eq(themeBlocks.id, orderedIds[i]), eq(themeBlocks.sectionId, sectionId)))
      }
    })
  }

  async deleteBlock(blockId: string) {
    const storeId = await this.storeIdForBlock(blockId)
    await db.delete(themeBlocks).where(eq(themeBlocks.id, blockId))
    if (storeId) await revalidateNext([tagFor.theme(storeId)])
  }

  // Computes next position so callers do not need to track it client-side.
  private async nextPosition(kind: 'section' | 'block', parentId: string): Promise<number> {
    if (kind === 'section') {
      const [row] = await db
        .select({ max: sql<number>`COALESCE(MAX(${themeSections.position}), -1)::int` })
        .from(themeSections)
        .where(eq(themeSections.themeId, parentId))
      return (row?.max ?? -1) + 1
    }
    const [row] = await db
      .select({ max: sql<number>`COALESCE(MAX(${themeBlocks.position}), -1)::int` })
      .from(themeBlocks)
      .where(eq(themeBlocks.sectionId, parentId))
    return (row?.max ?? -1) + 1
  }
}

export const themeService = new ThemeService()
// Suppress unused import warning when only ordering helpers reference asc.
void asc
