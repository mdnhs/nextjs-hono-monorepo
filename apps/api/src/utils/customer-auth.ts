import jwt from 'jsonwebtoken'
import { randomBytes } from 'node:crypto'

const SECRET = process.env.CUSTOMER_JWT_SECRET ?? process.env.JWT_SECRET
if (!SECRET) {
  throw new Error('CUSTOMER_JWT_SECRET or JWT_SECRET environment variable is required')
}

export interface CustomerJWTPayload {
  customerId: string
  storeId: string
  email: string
}

export const signCustomerToken = (payload: CustomerJWTPayload): string =>
  jwt.sign(payload, SECRET as string, { expiresIn: '30d' })

export const verifyCustomerToken = (token: string): CustomerJWTPayload =>
  jwt.verify(token, SECRET as string) as CustomerJWTPayload

export const generateCartToken = (): string =>
  randomBytes(24).toString('base64url')

export const CART_TOKEN_COOKIE = 'cart_token'
export const CUSTOMER_TOKEN_COOKIE = 'customer_token'
