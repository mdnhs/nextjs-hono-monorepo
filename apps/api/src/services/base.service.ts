import { prisma } from '../utils/prisma'

export interface PaginationOptions {
  page?: number
  limit?: number
  orderBy?: Record<string, 'asc' | 'desc'>
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export abstract class BaseService {
  protected prisma = prisma
  
  protected getPaginationParams(options: PaginationOptions) {
    const page = options.page || 1
    const limit = options.limit || 10
    const skip = (page - 1) * limit
    
    return { page, limit, skip }
  }
  
  protected formatPaginatedResult<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
  ): PaginatedResult<T> {
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }
  
  protected handleError(error: any, customMessages?: Record<string, string>): never {
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0]
      throw new Error(customMessages?.unique || `${field} already exists`)
    }
    
    if (error.code === 'P2025') {
      throw new Error(customMessages?.notFound || 'Record not found')
    }
    
    throw error
  }
}