import { vi, beforeEach } from 'vitest'

// Mock the prisma module
vi.mock('../utils/prisma')

beforeEach(() => {
  vi.clearAllMocks()
})