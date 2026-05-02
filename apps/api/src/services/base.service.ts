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
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  protected handleError(error: any, customMessages?: Record<string, string>): never {
    const msg = error?.message || ''

    if (msg.includes('duplicate key') || msg.includes('unique constraint')) {
      throw new Error(customMessages?.unique || 'Record already exists')
    }

    if (msg.includes('not found') || error?.code === '23503') {
      throw new Error(customMessages?.notFound || 'Record not found')
    }

    throw error
  }
}
