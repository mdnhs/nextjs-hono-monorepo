import { StoreStatus, UserRole } from '@prisma/client'
import { prisma } from '../utils/prisma'

export interface CreateStoreData {
  name: string
  description?: string
  slug: string
  logo?: string
}

export interface UpdateStoreData {
  name?: string
  description?: string
  slug?: string
  logo?: string
  status?: StoreStatus
}

export interface StoreFilters {
  status?: StoreStatus
  ownerId?: string
}

export interface PaginationParams {
  page: number
  limit: number
}

export class StoreService {
  async getAllStores(filters: StoreFilters, pagination: PaginationParams) {
    const skip = (pagination.page - 1) * pagination.limit
    const where = filters.status 
      ? { status: filters.status }
      : { status: StoreStatus.PUBLISHED }
    
    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        skip,
        take: pagination.limit,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              products: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.store.count({ where })
    ])
    
    return {
      data: stores,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      }
    }
  }
  
  async getStoreById(id: string) {
    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        products: {
          where: { isActive: true },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            products: true,
            orders: true
          }
        }
      }
    })
    
    if (!store) {
      throw new Error('Store not found')
    }
    
    return store
  }
  
  async getStoreBySlug(slug: string) {
    const store = await prisma.store.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        products: {
          where: { isActive: true },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            products: true,
            orders: true
          }
        }
      }
    })
    
    if (!store) {
      throw new Error('Store not found')
    }
    
    if (store.status !== StoreStatus.PUBLISHED) {
      throw new Error('Store is not published')
    }
    
    return store
  }
  
  async getUserStores(userId: string, pagination: PaginationParams) {
    const skip = (pagination.page - 1) * pagination.limit
    const where = { ownerId: userId }
    
    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        skip,
        take: pagination.limit,
        include: {
          _count: {
            select: {
              products: true,
              orders: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.store.count({ where })
    ])
    
    return {
      data: stores,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      }
    }
  }
  
  async createStore(data: CreateStoreData, ownerId: string) {
    const existingStore = await prisma.store.findUnique({
      where: { slug: data.slug }
    })
    
    if (existingStore) {
      throw new Error('Slug already exists')
    }
    
    const store = await prisma.store.create({
      data: {
        ...data,
        ownerId
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    return store
  }
  
  async updateStore(id: string, data: UpdateStoreData, userId: string, userRole: UserRole) {
    const store = await prisma.store.findUnique({
      where: { id }
    })
    
    if (!store) {
      throw new Error('Store not found')
    }
    
    if (store.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new Error('Not authorized to update this store')
    }
    
    if (data.slug) {
      const existingStore = await prisma.store.findFirst({
        where: {
          slug: data.slug,
          id: { not: id }
        }
      })
      
      if (existingStore) {
        throw new Error('Slug already exists')
      }
    }
    
    const updatedStore = await prisma.store.update({
      where: { id },
      data,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    return updatedStore
  }
  
  async deleteStore(id: string, userId: string, userRole: UserRole) {
    const store = await prisma.store.findUnique({
      where: { id }
    })
    
    if (!store) {
      throw new Error('Store not found')
    }
    
    if (store.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new Error('Not authorized to delete this store')
    }
    
    await prisma.store.delete({
      where: { id }
    })
    
    return { message: 'Store deleted successfully' }
  }
  
  async publishStore(id: string, userId: string, userRole: UserRole) {
    const store = await prisma.store.findUnique({
      where: { id }
    })
    
    if (!store) {
      throw new Error('Store not found')
    }
    
    if (store.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new Error('Not authorized to publish this store')
    }
    
    const publishedStore = await prisma.store.update({
      where: { id },
      data: { status: StoreStatus.PUBLISHED },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    return publishedStore
  }
  
  async unpublishStore(id: string, userId: string, userRole: UserRole) {
    const store = await prisma.store.findUnique({
      where: { id }
    })
    
    if (!store) {
      throw new Error('Store not found')
    }
    
    if (store.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new Error('Not authorized to unpublish this store')
    }
    
    const unpublishedStore = await prisma.store.update({
      where: { id },
      data: { status: StoreStatus.DRAFT },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    return unpublishedStore
  }
}

export const storeService = new StoreService()