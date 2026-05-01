import { UserRole } from '@prisma/client'
import { prisma } from '../utils/prisma'
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
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })
    
    if (existingUser) {
      throw new Error('User already exists')
    }
    
    const hashedPassword = await hashPassword(data.password)
    
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role || UserRole.BUYER
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })
    
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })
    
    return { user, token }
  }
  
  async login(data: LoginData) {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
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
      role: user.role
    })
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    }
  }
  
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    if (!user) {
      throw new Error('User not found')
    }
    
    return user
  }
}

export const authService = new AuthService()