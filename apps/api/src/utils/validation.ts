import { z } from 'zod'
import { UserRole } from '@prisma/client'

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.nativeEnum(UserRole).optional().default(UserRole.SELLER)
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

export const createStoreSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  logo: z.string().url().optional(),
  planId: z.string().optional(),
  customDomain: z.string().optional(),
})

export const updateStoreSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
  logo: z.string().url().optional(),
  customDomain: z.string().nullable().optional(),
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
