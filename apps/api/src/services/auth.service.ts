import { db } from '../db'
import { users } from '../db/schema'
import type { UserRole } from '../db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword, comparePassword, generateToken } from '../utils/auth'

export interface RegisterData {
  email: string
  password: string
  name: string
  role?: UserRole
}

export interface LoginData {
  email: string
  password: string
}

export class AuthService {
  async register(data: RegisterData) {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    })

    if (existingUser) {
      throw new Error('User already exists')
    }

    const hashedPassword = await hashPassword(data.password)

    const [user] = await db
      .insert(users)
      .values({
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role || 'BUYER',
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
      })

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return { user, token }
  }

  async login(data: LoginData) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isPasswordValid = await comparePassword(data.password, user.password)

    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    }
  }

  async getCurrentUser(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }
}

export const authService = new AuthService()
