import { StoreStatus, UserRole } from '@prisma/client'
import { prisma } from '../utils/prisma'

export interface CreateStoreData {
  name: string
  description?: string
  slug: string
  logo?: string
  planId?: string
  customDomain?: string
}

export interface UpdateStoreData {
  name?: string
  description?: string
  slug?: string
  logo?: string
  status?: StoreStatus
  customDomain?: string | null
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
    const where: Record<string, unknown> = {}
    
    if (filters.status) {
      where.status = filters.status
    }
    if (filters.ownerId) {
      where.ownerId = filters.ownerId
    }
    
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
          },
          subscriptions: {
            include: {
              plan: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  priceMonthly: true,
                  priceYearly: true,
                }
              }
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
        },
        subscriptions: {
          include: {
            plan: true,
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
    
    if (store.status !== StoreStatus.APPROVED) {
      throw new Error('Store is not approved')
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
          },
          subscriptions: {
            include: {
              plan: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  priceMonthly: true,
                  priceYearly: true,
                }
              }
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

    if (data.customDomain) {
      const existingDomain = await prisma.store.findUnique({
        where: { customDomain: data.customDomain }
      })
      if (existingDomain) {
        throw new Error('Custom domain already in use')
      }
    }
    
    const store = await prisma.$transaction(async (tx) => {
      const newStore = await tx.store.create({
        data: {
          name: data.name,
          description: data.description,
          slug: data.slug,
          logo: data.logo,
          ownerId,
          status: StoreStatus.PENDING,
          customDomain: data.customDomain || null,
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

      if (data.planId) {
        const plan = await tx.plan.findUnique({
          where: { id: data.planId },
        })
        if (plan) {
          const now = new Date()
          let currentPeriodEnd = new Date(now)
          let status = 'TRIAL'

          if (plan.trialDays > 0) {
            currentPeriodEnd = new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000)
          } else {
            currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)
            status = 'ACTIVE'
          }

          await tx.subscription.create({
            data: {
              storeId: newStore.id,
              planId: plan.id,
              billingCycle: 'MONTHLY',
              status: status as any,
              currentPeriodStart: now,
              currentPeriodEnd,
            },
          })
        }
      }

      return newStore
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

    if (data.customDomain) {
      const existingDomain = await prisma.store.findFirst({
        where: {
          customDomain: data.customDomain,
          id: { not: id }
        }
      })
      if (existingDomain) {
        throw new Error('Custom domain already in use')
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

  // Admin: Approve a store
  async approveStore(id: string, _adminId: string) {
    const store = await prisma.store.findUnique({
      where: { id }
    })
    
    if (!store) {
      throw new Error('Store not found')
    }

    if (store.status === StoreStatus.APPROVED) {
      throw new Error('Store is already approved')
    }
    
    const approvedStore = await prisma.store.update({
      where: { id },
      data: { status: StoreStatus.APPROVED },
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
    
    return approvedStore
  }

  // Admin: Reject a store
  async rejectStore(id: string, _adminId: string) {
    const store = await prisma.store.findUnique({
      where: { id }
    })
    
    if (!store) {
      throw new Error('Store not found')
    }
    
    const rejectedStore = await prisma.store.update({
      where: { id },
      data: { status: StoreStatus.REJECTED },
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
    
    return rejectedStore
  }

  // Admin: Suspend a store
  async suspendStore(id: string, _adminId: string) {
    const store = await prisma.store.findUnique({
      where: { id }
    })
    
    if (!store) {
      throw new Error('Store not found')
    }
    
    const suspendedStore = await prisma.store.update({
      where: { id },
      data: { status: StoreStatus.SUSPENDED },
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
    
    return suspendedStore
  }
}

export const storeService = new StoreService()
