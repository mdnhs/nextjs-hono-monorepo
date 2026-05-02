import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService } from '../auth.service'
import { db } from '../../db'
import { hashPassword, comparePassword, generateToken } from '../../utils/auth'
import { faker } from '@faker-js/faker'

vi.mock('../../db')
vi.mock('../../utils/auth')

describe('AuthService', () => {
  let authService: AuthService

  const mockUser = {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    name: faker.person.fullName(),
    role: 'BUYER' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
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
      role: 'BUYER' as const,
    }

    it('should register a new user successfully', async () => {
      ;(db.query.users.findFirst as any).mockResolvedValue(undefined)
      ;(hashPassword as any).mockResolvedValue(mockHashedPassword)

      const createdUser = {
        id: faker.string.uuid(),
        email: registerData.email,
        name: registerData.name,
        role: registerData.role,
        createdAt: new Date(),
      }

      const returning = vi.fn().mockResolvedValue([createdUser])
      const values = vi.fn().mockReturnValue({ returning })
      ;(db.insert as any).mockReturnValue({ values })
      ;(generateToken as any).mockReturnValue(mockToken)

      const result = await authService.register(registerData)

      expect(db.query.users.findFirst).toHaveBeenCalled()
      expect(hashPassword).toHaveBeenCalledWith(registerData.password)
      expect(db.insert).toHaveBeenCalled()
      expect(generateToken).toHaveBeenCalledWith({
        userId: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
      })
      expect(result).toEqual({ user: createdUser, token: mockToken })
    })

    it('should use default BUYER role when role is not provided', async () => {
      const dataWithoutRole = {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 10 }),
        name: faker.person.fullName(),
      }

      ;(db.query.users.findFirst as any).mockResolvedValue(undefined)
      ;(hashPassword as any).mockResolvedValue(mockHashedPassword)

      const createdUser = { id: faker.string.uuid(), email: dataWithoutRole.email, name: dataWithoutRole.name, role: 'BUYER' as const, createdAt: new Date() }
      const returning = vi.fn().mockResolvedValue([createdUser])
      const values = vi.fn().mockReturnValue({ returning })
      ;(db.insert as any).mockReturnValue({ values })
      ;(generateToken as any).mockReturnValue(mockToken)

      await authService.register(dataWithoutRole)

      expect(values).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'BUYER' })
      )
    })

    it('should throw error when user already exists', async () => {
      ;(db.query.users.findFirst as any).mockResolvedValue(mockUser)

      await expect(authService.register(registerData)).rejects.toThrow('User already exists')

      expect(hashPassword).not.toHaveBeenCalled()
      expect(db.insert).not.toHaveBeenCalled()
    })
  })

  describe('login', () => {
    const loginData = { email: mockUser.email, password: mockUser.password }

    it('should login user successfully with valid credentials', async () => {
      ;(db.query.users.findFirst as any).mockResolvedValue({ ...mockUser, password: mockHashedPassword })
      ;(comparePassword as any).mockResolvedValue(true)
      ;(generateToken as any).mockReturnValue(mockToken)

      const result = await authService.login(loginData)

      expect(db.query.users.findFirst).toHaveBeenCalled()
      expect(comparePassword).toHaveBeenCalledWith(loginData.password, mockHashedPassword)
      expect(result).toEqual({
        user: { id: mockUser.id, email: mockUser.email, name: mockUser.name, role: mockUser.role },
        token: mockToken,
      })
    })

    it('should throw error when user not found', async () => {
      ;(db.query.users.findFirst as any).mockResolvedValue(undefined)

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials')

      expect(comparePassword).not.toHaveBeenCalled()
      expect(generateToken).not.toHaveBeenCalled()
    })

    it('should throw error when password is invalid', async () => {
      ;(db.query.users.findFirst as any).mockResolvedValue({ ...mockUser, password: mockHashedPassword })
      ;(comparePassword as any).mockResolvedValue(false)

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials')

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
        updatedAt: mockUser.updatedAt,
      }

      ;(db.query.users.findFirst as any).mockResolvedValue(userWithoutPassword)

      const result = await authService.getCurrentUser(mockUser.id)

      expect(db.query.users.findFirst).toHaveBeenCalled()
      expect(result).toEqual(userWithoutPassword)
    })

    it('should throw error when user not found', async () => {
      ;(db.query.users.findFirst as any).mockResolvedValue(undefined)

      await expect(authService.getCurrentUser('invalid-id')).rejects.toThrow('User not found')
    })
  })

  describe('edge cases', () => {
    it('should not leak password in register response', async () => {
      ;(db.query.users.findFirst as any).mockResolvedValue(undefined)
      ;(hashPassword as any).mockResolvedValue(mockHashedPassword)

      const createdUser = { id: faker.string.uuid(), email: faker.internet.email(), name: faker.person.fullName(), role: 'BUYER' as const, createdAt: new Date() }
      const returning = vi.fn().mockResolvedValue([createdUser])
      ;(db.insert as any).mockReturnValue({ values: vi.fn().mockReturnValue({ returning }) })
      ;(generateToken as any).mockReturnValue(mockToken)

      const result = await authService.register({ email: createdUser.email, password: 'pass', name: createdUser.name })

      expect(result.user).not.toHaveProperty('password')
    })
  })
})
