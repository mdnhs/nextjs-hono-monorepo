import { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodError, z } from 'zod'

export interface ApiResponse<T = any> {
  data: T | null
  pagination?: {
    total: number
    total_pages: number
    current_page: number
    limit: number
    has_next_page: boolean
    has_prev_page: boolean
  }
  error: boolean
  message: string
  causes?: any
}

export abstract class BaseController {
  protected success<T>(c: Context, data: T, message = 'Success', status: number = 200) {
    return c.json({
      data,
      error: false,
      message
    }, status as any)
  }

  protected paginate<T>(c: Context, result: { data: T[], pagination: any }, message = 'Success') {
    return c.json({
      data: result.data,
      pagination: {
        total: result.pagination.total,
        total_pages: result.pagination.totalPages,
        current_page: result.pagination.page,
        limit: result.pagination.limit,
        has_next_page: result.pagination.page < result.pagination.totalPages,
        has_prev_page: result.pagination.page > 1
      },
      error: false,
      message
    }, 200)
  }

  protected handleError(error: any): never {
    console.error('Controller Error:', error)
    
    if (error instanceof HTTPException) {
      throw error
    }
    
    if (error instanceof ZodError) {
      throw new HTTPException(400, { 
        message: 'Validation error',
        cause: error.issues 
      })
    }
    
    if (error.name === 'PrismaClientKnownRequestError') {
      if (error.code === 'P2002') {
        throw new HTTPException(409, { 
          message: 'Resource already exists' 
        })
      }
      if (error.code === 'P2025') {
        throw new HTTPException(404, { 
          message: 'Resource not found' 
        })
      }
    }
    
    if (error.message) {
      const statusMap: Record<string, number> = {
        'not found': 404,
        'unauthorized': 401,
        'forbidden': 403,
        'already exists': 409,
        'invalid': 400,
        'not authorized': 403
      }
      
      const lowerMessage = error.message.toLowerCase()
      for (const [key, status] of Object.entries(statusMap)) {
        if (lowerMessage.includes(key)) {
          throw new HTTPException(status as any, { message: error.message })
        }
      }
    }
    
    throw new HTTPException(500, { 
      message: 'Internal server error' 
    })
  }
  
  protected getPaginationParams(c: Context) {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '10')
    
    if (page < 1 || limit < 1 || limit > 100) {
      throw new HTTPException(400, { 
        message: 'Invalid pagination parameters' 
      })
    }
    
    return { page, limit }
  }
  
  protected async parseBody<T>(c: Context, schema: z.ZodType<T>): Promise<T> {
    try {
      const body = await c.req.json()
      return schema.parse(body) as T
    } catch (error) {
      if (error instanceof ZodError) {
        throw new HTTPException(400, { 
          message: 'Validation error',
          cause: error.issues 
        })
      }
      throw new HTTPException(400, { 
        message: 'Invalid request body' 
      })
    }
  }
}