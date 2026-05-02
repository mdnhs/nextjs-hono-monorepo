import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { verifyToken, JWTPayload } from '../utils/auth'
import type { UserRole } from '../db/schema'

declare module 'hono' {
  interface ContextVariableMap {
    user: JWTPayload
  }
}

export const authenticate = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization')
  let token: string | undefined

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  } else {
    const cookieHeader = c.req.header('Cookie')
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map((cookie) => cookie.trim())
      const tokenCookie = cookies.find((cookie) => cookie.startsWith('token='))
      if (tokenCookie) {
        token = tokenCookie.split('=')[1]
      }
    }
  }

  if (!token) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }

  try {
    const payload = verifyToken(token)
    c.set('user', payload)
    await next()
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new HTTPException(401, { message: 'Token has expired. Please login again.' })
    }
    if (error.name === 'JsonWebTokenError') {
      throw new HTTPException(401, { message: 'Invalid token format' })
    }
    throw new HTTPException(401, { message: 'Authentication failed' })
  }
}

export const authorize = (...roles: UserRole[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user')

    if (!user || !roles.includes(user.role)) {
      throw new HTTPException(403, { message: 'Forbidden' })
    }

    await next()
  }
}
