import { Hono } from 'hono'
import { z } from 'zod'
import { authenticate } from '../middlewares/auth'
import { requirePermission, PERMISSIONS, requireStoreAccess } from '../middlewares/rbac'
import { resolveTenant } from '../middlewares/tenant'
import { themeService } from '../services/theme.service'
import { HTTPException } from 'hono/http-exception'

const router = new Hono()

const settings = z.record(z.string(), z.unknown())
const createTheme = z.object({ name: z.string().min(1), settings: settings.optional() })
const updateTheme = z.object({ name: z.string().min(1).optional(), settings: settings.optional() })
const sectionInput = z.object({ type: z.string().min(1), settings: settings.optional(), position: z.number().int().min(0).optional() })
const blockInput = z.object({ type: z.string().min(1), settings: settings.optional(), position: z.number().int().min(0).optional() })
const reorder = z.object({ orderedIds: z.array(z.string().min(1)).min(1) })

// Storefront read — public, scoped via resolveTenant.
router.get('/published', resolveTenant, async (c) => {
  const tenant = c.get('tenantStore')
  if (!tenant) throw new HTTPException(404, { message: 'Store not found' })
  const theme = await themeService.getPublishedTheme(tenant.id)
  return c.json({ data: theme, error: false, message: 'OK' })
})

// Admin: list themes for a store.
router.get(
  '/store/:storeId',
  authenticate,
  requirePermission(PERMISSIONS.STORE_THEME_MANAGE),
  requireStoreAccess,
  async (c) => {
    const storeId = c.req.param('storeId')!
    const data = await themeService.listThemes(storeId)
    return c.json({ data, error: false, message: 'OK' })
  },
)

// Admin: read a theme with full layout (sections + blocks).
router.get(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.STORE_THEME_MANAGE),
  async (c) => {
    const id = c.req.param('id')!
    const data = await themeService.getThemeWithLayout(id)
    if (!data) throw new HTTPException(404, { message: 'Theme not found' })
    return c.json({ data, error: false, message: 'OK' })
  },
)

router.post(
  '/store/:storeId',
  authenticate,
  requirePermission(PERMISSIONS.STORE_THEME_MANAGE),
  requireStoreAccess,
  async (c) => {
    const storeId = c.req.param('storeId')!
    const body = createTheme.parse(await c.req.json())
    const data = await themeService.createTheme({ storeId, ...body })
    return c.json({ data, error: false, message: 'Created' }, 201)
  },
)

router.patch(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.STORE_THEME_MANAGE),
  async (c) => {
    const id = c.req.param('id')!
    const body = updateTheme.parse(await c.req.json())
    const data = await themeService.updateTheme(id, body)
    return c.json({ data, error: false, message: 'Updated' })
  },
)

router.post(
  '/:id/publish',
  authenticate,
  requirePermission(PERMISSIONS.STORE_THEME_MANAGE),
  async (c) => {
    const id = c.req.param('id')!
    const data = await themeService.publishTheme(id)
    return c.json({ data, error: false, message: 'Published' })
  },
)

router.delete(
  '/:id',
  authenticate,
  requirePermission(PERMISSIONS.STORE_THEME_MANAGE),
  async (c) => {
    await themeService.deleteTheme(c.req.param('id')!)
    return c.json({ data: null, error: false, message: 'Deleted' })
  },
)

// Sections.
router.post(
  '/:themeId/sections',
  authenticate,
  requirePermission(PERMISSIONS.STORE_THEME_MANAGE),
  async (c) => {
    const themeId = c.req.param('themeId')!
    const body = sectionInput.parse(await c.req.json())
    const data = await themeService.addSection({ themeId, ...body })
    return c.json({ data, error: false, message: 'Section created' }, 201)
  },
)

router.patch(
  '/sections/:sectionId',
  authenticate,
  requirePermission(PERMISSIONS.STORE_THEME_MANAGE),
  async (c) => {
    const id = c.req.param('sectionId')!
    const body = sectionInput.partial().parse(await c.req.json())
    const data = await themeService.updateSection(id, body)
    return c.json({ data, error: false, message: 'Section updated' })
  },
)

router.post(
  '/:themeId/sections/reorder',
  authenticate,
  requirePermission(PERMISSIONS.STORE_THEME_MANAGE),
  async (c) => {
    const themeId = c.req.param('themeId')!
    const body = reorder.parse(await c.req.json())
    await themeService.reorderSections(themeId, body.orderedIds)
    return c.json({ data: null, error: false, message: 'Sections reordered' })
  },
)

router.delete(
  '/sections/:sectionId',
  authenticate,
  requirePermission(PERMISSIONS.STORE_THEME_MANAGE),
  async (c) => {
    await themeService.deleteSection(c.req.param('sectionId')!)
    return c.json({ data: null, error: false, message: 'Section deleted' })
  },
)

// Blocks.
router.post(
  '/sections/:sectionId/blocks',
  authenticate,
  requirePermission(PERMISSIONS.STORE_THEME_MANAGE),
  async (c) => {
    const sectionId = c.req.param('sectionId')!
    const body = blockInput.parse(await c.req.json())
    const data = await themeService.addBlock({ sectionId, ...body })
    return c.json({ data, error: false, message: 'Block created' }, 201)
  },
)

router.patch(
  '/blocks/:blockId',
  authenticate,
  requirePermission(PERMISSIONS.STORE_THEME_MANAGE),
  async (c) => {
    const id = c.req.param('blockId')!
    const body = blockInput.partial().parse(await c.req.json())
    const data = await themeService.updateBlock(id, body)
    return c.json({ data, error: false, message: 'Block updated' })
  },
)

router.post(
  '/sections/:sectionId/blocks/reorder',
  authenticate,
  requirePermission(PERMISSIONS.STORE_THEME_MANAGE),
  async (c) => {
    const sectionId = c.req.param('sectionId')!
    const body = reorder.parse(await c.req.json())
    await themeService.reorderBlocks(sectionId, body.orderedIds)
    return c.json({ data: null, error: false, message: 'Blocks reordered' })
  },
)

router.delete(
  '/blocks/:blockId',
  authenticate,
  requirePermission(PERMISSIONS.STORE_THEME_MANAGE),
  async (c) => {
    await themeService.deleteBlock(c.req.param('blockId')!)
    return c.json({ data: null, error: false, message: 'Block deleted' })
  },
)

export default router
