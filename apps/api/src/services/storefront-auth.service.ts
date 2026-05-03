import { db } from '../db'
import { customers } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { hashPassword, comparePassword, generateToken } from '../utils/auth'

export interface CustomerRegisterData {
  storeId: string
  email: string
  password: string
  name: string
}

export interface CustomerLoginData {
  storeId: string
  email: string
  password: string
}

export class StorefrontAuthService {
  async register(data: CustomerRegisterData) {
    const existingCustomer = await db.query.customers.findFirst({
      where: and(
        eq(customers.email, data.email),
        eq(customers.storeId, data.storeId)
      ),
    })

    if (existingCustomer) {
      throw new Error('Customer already exists in this store')
    }

    const hashedPassword = await hashPassword(data.password)

    const [customer] = await db
      .insert(customers)
      .values({
        storeId: data.storeId,
        email: data.email,
        passwordHash: hashedPassword,
        name: data.name,
      })
      .returning({
        id: customers.id,
        email: customers.email,
        name: customers.name,
        createdAt: customers.createdAt,
      })

    const token = generateToken({
      userId: customer.id,
      email: customer.email,
      role: 'BUYER',
    })

    return { customer, token }
  }

  async login(data: CustomerLoginData) {
    const customer = await db.query.customers.findFirst({
      where: and(
        eq(customers.email, data.email),
        eq(customers.storeId, data.storeId)
      ),
    })

    if (!customer || !customer.passwordHash) {
      throw new Error('Invalid credentials')
    }

    const isPasswordValid = await comparePassword(data.password, customer.passwordHash)

    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    const token = generateToken({
      userId: customer.id,
      email: customer.email,
      role: 'BUYER',
    })

    return {
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
      },
      token,
    }
  }

  async getProfile(customerId: string) {
    const customer = await db.query.customers.findFirst({
      where: eq(customers.id, customerId),
      columns: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!customer) {
      throw new Error('Customer not found')
    }

    return customer
  }
}

export const storefrontAuthService = new StorefrontAuthService()
