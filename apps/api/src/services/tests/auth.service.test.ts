import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService } from '../auth.service'
import { prisma } from '../../utils/prisma'
import { hashPassword, comparePassword, generateToken } from '../../utils/auth'
import { UserRole } from '@prisma/client'
import { faker } from '@faker-js/faker'

// Mock the prisma client
vi.mock('../../utils/prisma')

// Mock the auth utils
vi.mock('../../utils/auth')

describe('AuthService', () => {
  let authService: AuthService
  
  const mockUser = {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    name: faker.person.fullName(),
    role: UserRole.BUYER,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  const mockToken = faker.string.alphanumeric(100)
  const mockHashedPassword = `hashed_${mockUser.password}`
  
  beforeEach(() => {
    authService = new AuthService()
    vi.clearAllMocks()
  })
  
  describe('register', () => {
    const registerData = {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 10 }),
      name: faker.person.fullName(),
      role: UserRole.BUYER
    }
    
    it('should register a new user successfully', async () => {
      // Mock prisma.user.findUnique to return null (user doesn't exist)
      ;(prisma.user.findUnique as any).mockResolvedValue(null)
      
      // Mock hashPassword
      ;(hashPassword as any).mockResolvedValue(mockHashedPassword)
      
      // Mock prisma.user.create
      const createdUser = {
        id: faker.string.uuid(),
        email: registerData.email,
        name: registerData.name,
        role: registerData.role,
        createdAt: new Date()
      }
      ;(prisma.user.create as any).mockResolvedValue(createdUser)
      
      // Mock generateToken
      ;(generateToken as any).mockReturnValue(mockToken)
      
      const result = await authService.register(registerData)
      
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerData.email }
      })
      
      expect(hashPassword).toHaveBeenCalledWith(registerData.password)
      
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: registerData.email,
          password: mockHashedPassword,
          name: registerData.name,
          role: registerData.role
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      })
      
      expect(generateToken).toHaveBeenCalledWith({
        userId: createdUser.id,
        email: createdUser.email,
        role: createdUser.role
      })
      
      expect(result).toEqual({
        user: createdUser,
        token: mockToken
      })
    })
    
    it('should use default BUYER role when role is not provided', async () => {
      const registerDataWithoutRole = {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 10 }),
        name: faker.person.fullName()
      }
      
      ;(prisma.user.findUnique as any).mockResolvedValue(null)
      ;(hashPassword as any).mockResolvedValue(mockHashedPassword)
      
      const createdUser = {
        id: faker.string.uuid(),
        email: registerDataWithoutRole.email,
        name: registerDataWithoutRole.name,
        role: UserRole.BUYER,
        createdAt: new Date()
      }
      ;(prisma.user.create as any).mockResolvedValue(createdUser)
      ;(generateToken as any).mockReturnValue(mockToken)
      
      await authService.register(registerDataWithoutRole)
      
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDataWithoutRole.email,
          password: mockHashedPassword,
          name: registerDataWithoutRole.name,
          role: UserRole.BUYER
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      })
    })
    
    it('should throw error when user already exists', async () => {
      ;(prisma.user.findUnique as any).mockResolvedValue(mockUser)
      
      await expect(authService.register(registerData)).rejects.toThrow('User already exists')
      
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerData.email }
      })
      expect(hashPassword).not.toHaveBeenCalled()
      expect(prisma.user.create).not.toHaveBeenCalled()
      expect(generateToken).not.toHaveBeenCalled()
    })
  })
  
  describe('login', () => {
    const loginData = {
      email: mockUser.email,
      password: mockUser.password
    }
    
    it('should login user successfully with valid credentials', async () => {
      ;(prisma.user.findUnique as any).mockResolvedValue({
        ...mockUser,
        password: mockHashedPassword
      })
      ;(comparePassword as any).mockResolvedValue(true)
      ;(generateToken as any).mockReturnValue(mockToken)
      
      const result = await authService.login(loginData)
      
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email }
      })
      
      expect(comparePassword).toHaveBeenCalledWith(loginData.password, mockHashedPassword)
      
      expect(generateToken).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role
      })
      
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role
        },
        token: mockToken
      })
    })
    
    it('should throw error when user not found', async () => {
      ;(prisma.user.findUnique as any).mockResolvedValue(null)
      
      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials')
      
      expect(comparePassword).not.toHaveBeenCalled()
      expect(generateToken).not.toHaveBeenCalled()
    })
    
    it('should throw error when password is invalid', async () => {
      ;(prisma.user.findUnique as any).mockResolvedValue({
        ...mockUser,
        password: mockHashedPassword
      })
      ;(comparePassword as any).mockResolvedValue(false)
      
      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials')
      
      expect(comparePassword).toHaveBeenCalledWith(loginData.password, mockHashedPassword)
      expect(generateToken).not.toHaveBeenCalled()
    })
  })
  
  describe('getCurrentUser', () => {
    it('should return current user data', async () => {
      const userWithoutPassword = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt
      }
      
      ;(prisma.user.findUnique as any).mockResolvedValue(userWithoutPassword)
      
      const result = await authService.getCurrentUser(mockUser.id)
      
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      })
      
      expect(result).toEqual(userWithoutPassword)
    })
    
    it('should throw error when user not found', async () => {
      ;(prisma.user.findUnique as any).mockResolvedValue(null)
      
      await expect(authService.getCurrentUser('invalid-id')).rejects.toThrow('User not found')
      
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'invalid-id' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      })
    })
  })
  
  describe('Edge cases and security', () => {
    it('should handle different user roles during registration', async () => {
      const roles = [UserRole.BUYER, UserRole.SELLER, UserRole.ADMIN]
      
      for (const role of roles) {
        vi.clearAllMocks()
        
        const registerData = {
          email: faker.internet.email(),
          password: faker.internet.password({ length: 10 }),
          name: faker.person.fullName(),
          role
        }
        
        ;(prisma.user.findUnique as any).mockResolvedValue(null)
        ;(hashPassword as any).mockResolvedValue(mockHashedPassword)
        
        const createdUser = {
          id: faker.string.uuid(),
          email: registerData.email,
          name: registerData.name,
          role,
          createdAt: new Date()
        }
        ;(prisma.user.create as any).mockResolvedValue(createdUser)
        ;(generateToken as any).mockReturnValue(mockToken)
        
        const result = await authService.register(registerData)
        
        expect(result.user.role).toBe(role)
      }
    })
    
    it('should handle case-insensitive email during login', async () => {
      const upperCaseEmail = mockUser.email.toUpperCase()
      const loginData = {
        email: upperCaseEmail,
        password: mockUser.password
      }
      
      ;(prisma.user.findUnique as any).mockResolvedValue({
        ...mockUser,
        password: mockHashedPassword
      })
      ;(comparePassword as any).mockResolvedValue(true)
      ;(generateToken as any).mockReturnValue(mockToken)
      
      const result = await authService.login(loginData)
      
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: upperCaseEmail }
      })
      
      expect(result.user.email).toBe(mockUser.email)
    })
    
    it('should not leak password information in responses', async () => {
      ;(prisma.user.findUnique as any).mockResolvedValue(null)
      ;(hashPassword as any).mockResolvedValue(mockHashedPassword)
      
      const createdUser = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        role: UserRole.BUYER,
        createdAt: new Date()
      }
      ;(prisma.user.create as any).mockResolvedValue(createdUser)
      ;(generateToken as any).mockReturnValue(mockToken)
      
      const registerData = {
        email: createdUser.email,
        password: faker.internet.password({ length: 10 }),
        name: createdUser.name
      }
      
      const result = await authService.register(registerData)
      
      expect(result.user).not.toHaveProperty('password')
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          password: mockHashedPassword
        }),
        select: expect.not.objectContaining({
          password: true
        })
      })
    })
  })
})