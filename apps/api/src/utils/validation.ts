import { z } from 'zod'

// Valid hostname: mystore.com, shop.mystore.com — no bare labels, must have TLD
const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['BUYER', 'SELLER', 'ADMIN']).optional().default('SELLER')
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

export const createStoreSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  // slug becomes the subdomain: {slug}.{APP_DOMAIN}
  slug: z.string().min(2).max(63).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  logo: z.string().url().optional(),
  planId: z.string().optional(),
  // Custom domain requires a plan with customDomain feature enabled (Pro/Enterprise)
  customDomain: z
    .string()
    .regex(domainRegex, 'Invalid domain format. Use format: mystore.com or shop.mystore.com')
    .toLowerCase()
    .optional(),
  // Optional: Create an initial store admin user
  adminName: z.string().min(2).optional(),
  adminEmail: z.string().email().optional(),
  adminPassword: z.string().min(6).optional(),
})

export const updateStoreSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  slug: z.string().min(2).max(63).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens').optional(),
  logo: z.string().url().optional(),
  // Set to null to remove custom domain, string to update it
  customDomain: z
    .string()
    .regex(domainRegex, 'Invalid domain format. Use format: mystore.com or shop.mystore.com')
    .toLowerCase()
    .nullable()
    .optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']).optional()
})

export const createProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive(),
  images: z.array(z.string().url()).optional().default([]),
  sku: z.string().min(2),
  quantity: z.number().int().min(0).default(0),
  categoryId: z.string().optional(),
  isActive: z.boolean().optional().default(true)
})
