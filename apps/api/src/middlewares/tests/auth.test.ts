import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { authenticate, authorize } from '../auth'
import { verifyToken } from '../../utils/auth'
import { UserRole } from '@prisma/client'
import { faker } from '@faker-js/faker'

// Mock the auth utils
vi.mock('../../utils/auth')

describe('Auth Middleware', () => {
  let mockContext: any
  let mockNext: Next
  
  const mockPayload = {
    userId: faker.string.uuid(),
    email: faker.internet.email(),
    role: UserRole.BUYER
  }
  
  beforeEach(() => {
    mockContext = {
      req: {
        header: vi.fn()
      },
      set: vi.fn(),
      get: vi.fn()
    }
    mockNext = vi.fn()
    vi.clearAllMocks()
  })
  
  describe('authenticate', () => {
    it('should authenticate valid token and set user in context', async () => {
      const mockToken = faker.string.alphanumeric(100)
      mockContext.req.header.mockReturnValue(`Bearer ${mockToken}`)
      ;(verifyToken as any).mockReturnValue(mockPayload)
      
      await authenticate(mockContext as Context, mockNext)
      
      expect(mockContext.req.header).toHaveBeenCalledWith('Authorization')
      expect(verifyToken).toHaveBeenCalledWith(mockToken)
      expect(mockContext.set).toHaveBeenCalledWith('user', mockPayload)
      expect(mockNext).toHaveBeenCalled()
    })
    
    it('should throw 401 when no authorization header', async () => {
      mockContext.req.header.mockReturnValue(undefined)
      
      await expect(authenticate(mockContext as Context, mockNext))
        .rejects.toThrow(HTTPException)
      
      try {
        await authenticate(mockContext as Context, mockNext)
      } catch (error: any) {
        expect(error.status).toBe(401)
        expect(error.message).toBe('Unauthorized')
      }
      
      expect(mockNext).not.toHaveBeenCalled()
    })
    
    it('should throw 401 when authorization header does not start with Bearer', async () => {
      mockContext.req.header.mockReturnValue('Basic sometoken')
      
      await expect(authenticate(mockContext as Context, mockNext))
        .rejects.toThrow(HTTPException)
      
      try {
        await authenticate(mockContext as Context, mockNext)
      } catch (error: any) {
        expect(error.status).toBe(401)
        expect(error.message).toBe('Unauthorized')
      }
      
      expect(mockNext).not.toHaveBeenCalled()
    })
    
    it('should handle expired token error', async () => {
      const mockToken = faker.string.alphanumeric(100)
      mockContext.req.header.mockReturnValue(`Bearer ${mockToken}`)
      
      const expiredError = new Error('Token expired')
      expiredError.name = 'TokenExpiredError'
      ;(verifyToken as any).mockImplementation(() => {
        throw expiredError
      })
      
      await expect(authenticate(mockContext as Context, mockNext))
        .rejects.toThrow(HTTPException)
      
      try {
        await authenticate(mockContext as Context, mockNext)
      } catch (error: any) {
        expect(error.status).toBe(401)
        expect(error.message).toBe('Token has expired. Please login again.')
      }
      
      expect(mockNext).not.toHaveBeenCalled()
    })
    
    it('should handle invalid token format error', async () => {
      const mockToken = faker.string.alphanumeric(100)
      mockContext.req.header.mockReturnValue(`Bearer ${mockToken}`)
      
      const jwtError = new Error('Invalid token')
      jwtError.name = 'JsonWebTokenError'
      ;(verifyToken as any).mockImplementation(() => {
        throw jwtError
      })
      
      await expect(authenticate(mockContext as Context, mockNext))
        .rejects.toThrow(HTTPException)
      
      try {
        await authenticate(mockContext as Context, mockNext)
      } catch (error: any) {
        expect(error.status).toBe(401)
        expect(error.message).toBe('Invalid token format')
      }
      
      expect(mockNext).not.toHaveBeenCalled()
    })
    
    it('should handle generic authentication errors', async () => {
      const mockToken = faker.string.alphanumeric(100)
      mockContext.req.header.mockReturnValue(`Bearer ${mockToken}`)
      
      ;(verifyToken as any).mockImplementation(() => {
        throw new Error('Some other error')
      })
      
      await expect(authenticate(mockContext as Context, mockNext))
        .rejects.toThrow(HTTPException)
      
      try {
        await authenticate(mockContext as Context, mockNext)
      } catch (error: any) {
        expect(error.status).toBe(401)
        expect(error.message).toBe('Authentication failed')
      }
      
      expect(mockNext).not.toHaveBeenCalled()
    })
  })
  
  describe('authorize', () => {
    it('should authorize user with correct role', async () => {
      const middleware = authorize(UserRole.BUYER)
      mockContext.get.mockReturnValue(mockPayload)
      
      await middleware(mockContext as Context, mockNext)
      
      expect(mockContext.get).toHaveBeenCalledWith('user')
      expect(mockNext).toHaveBeenCalled()
    })
    
    it('should authorize user with multiple allowed roles', async () => {
      const middleware = authorize(UserRole.BUYER, UserRole.SELLER)
      mockContext.get.mockReturnValue(mockPayload)
      
      await middleware(mockContext as Context, mockNext)
      
      expect(mockContext.get).toHaveBeenCalledWith('user')
      expect(mockNext).toHaveBeenCalled()
    })
    
    it('should throw 403 when user role not in allowed roles', async () => {
      const middleware = authorize(UserRole.SELLER, UserRole.ADMIN)
      mockContext.get.mockReturnValue(mockPayload) // User is BUYER
      
      await expect(middleware(mockContext as Context, mockNext))
        .rejects.toThrow(HTTPException)
      
      try {
        await middleware(mockContext as Context, mockNext)
      } catch (error: any) {
        expect(error.status).toBe(403)
        expect(error.message).toBe('Forbidden')
      }
      
      expect(mockNext).not.toHaveBeenCalled()
    })
    
    it('should throw 403 when no user in context', async () => {
      const middleware = authorize(UserRole.BUYER)
      mockContext.get.mockReturnValue(null)
      
      await expect(middleware(mockContext as Context, mockNext))
        .rejects.toThrow(HTTPException)
      
      try {
        await middleware(mockContext as Context, mockNext)
      } catch (error: any) {
        expect(error.status).toBe(403)
        expect(error.message).toBe('Forbidden')
      }
      
      expect(mockNext).not.toHaveBeenCalled()
    })
    
    it('should allow ADMIN role to access any resource', async () => {
      const adminPayload = {
        ...mockPayload,
        role: UserRole.ADMIN
      }
      
      const middleware = authorize(UserRole.ADMIN)
      mockContext.get.mockReturnValue(adminPayload)
      
      await middleware(mockContext as Context, mockNext)
      
      expect(mockNext).toHaveBeenCalled()
    })
    
    it('should handle multiple role authorization correctly', async () => {
      const sellerPayload = {
        ...mockPayload,
        role: UserRole.SELLER
      }
      
      // Test SELLER can access SELLER-only resources
      const sellerOnlyMiddleware = authorize(UserRole.SELLER)
      mockContext.get.mockReturnValue(sellerPayload)
      
      await sellerOnlyMiddleware(mockContext as Context, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(1)
      
      // Test SELLER can access SELLER or ADMIN resources
      vi.clearAllMocks()
      const sellerAdminMiddleware = authorize(UserRole.SELLER, UserRole.ADMIN)
      mockContext.get.mockReturnValue(sellerPayload)
      
      await sellerAdminMiddleware(mockContext as Context, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(1)
      
      // Test SELLER cannot access BUYER-only resources
      vi.clearAllMocks()
      const buyerOnlyMiddleware = authorize(UserRole.BUYER)
      mockContext.get.mockReturnValue(sellerPayload)
      
      await expect(buyerOnlyMiddleware(mockContext as Context, mockNext))
        .rejects.toThrow(HTTPException)
      expect(mockNext).not.toHaveBeenCalled()
    })
  })
})