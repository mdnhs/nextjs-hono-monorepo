import { describe, it, expect, beforeEach, vi } from 'vitest'
import { StoreService } from '../store.service'
import { prisma } from '../../utils/prisma'
import { UserRole, StoreStatus } from '@prisma/client'
import { faker } from '@faker-js/faker'

// Mock the prisma client
vi.mock('../../utils/prisma')

describe('StoreService', () => {
  let storeService: StoreService
  
  const mockUserId = faker.string.uuid()
  const mockStoreId = faker.string.uuid()
  const mockOwnerId = faker.string.uuid()
  
  const mockOwner = {
    id: mockOwnerId,
    name: faker.person.fullName(),
    email: faker.internet.email()
  }
  
  const mockStore = {
    id: mockStoreId,
    name: faker.company.name(),
    description: faker.company.catchPhrase(),
    slug: faker.internet.domainWord(),
    logo: faker.image.url(),
    status: StoreStatus.PUBLISHED,
    ownerId: mockOwnerId,
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: mockOwner,
    _count: {
      products: 10,
      orders: 5
    }
  }
  
  beforeEach(() => {
    storeService = new StoreService()
    vi.clearAllMocks()
  })
  
  describe('getAllStores', () => {
    it('should return paginated published stores by default', async () => {
      const mockStores = [mockStore]
      const mockTotal = 1
      
      ;(prisma.store.findMany as any).mockResolvedValue(mockStores)
      ;(prisma.store.count as any).mockResolvedValue(mockTotal)
      
      const result = await storeService.getAllStores({}, { page: 1, limit: 10 })
      
      expect(prisma.store.findMany).toHaveBeenCalledWith({
        where: { status: StoreStatus.PUBLISHED },
        skip: 0,
        take: 10,
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
      })
      
      expect(result).toEqual({
        data: mockStores,
        pagination: {
          page: 1,
          limit: 10,
          total: mockTotal,
          totalPages: 1
        }
      })
    })
    
    it('should filter stores by status when provided', async () => {
      const mockStores = [{ ...mockStore, status: StoreStatus.DRAFT }]
      const mockTotal = 1
      
      ;(prisma.store.findMany as any).mockResolvedValue(mockStores)
      ;(prisma.store.count as any).mockResolvedValue(mockTotal)
      
      await storeService.getAllStores(
        { status: StoreStatus.DRAFT }, 
        { page: 1, limit: 10 }
      )
      
      expect(prisma.store.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: StoreStatus.DRAFT }
        })
      )
    })
    
    it('should handle pagination correctly', async () => {
      ;(prisma.store.findMany as any).mockResolvedValue([])
      ;(prisma.store.count as any).mockResolvedValue(25)
      
      const result = await storeService.getAllStores({}, { page: 3, limit: 10 })
      
      expect(prisma.store.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10
        })
      )
      
      expect(result.pagination).toEqual({
        page: 3,
        limit: 10,
        total: 25,
        totalPages: 3
      })
    })
  })
  
  describe('getStoreById', () => {
    it('should return store with products and counts', async () => {
      const mockProducts = Array(3).fill(null).map(() => ({
        id: faker.string.uuid(),
        name: faker.commerce.productName(),
        price: faker.commerce.price(),
        isActive: true,
        createdAt: new Date()
      }))
      
      const storeWithProducts = {
        ...mockStore,
        products: mockProducts
      }
      
      ;(prisma.store.findUnique as any).mockResolvedValue(storeWithProducts)
      
      const result = await storeService.getStoreById(mockStoreId)
      
      expect(prisma.store.findUnique).toHaveBeenCalledWith({
        where: { id: mockStoreId },
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
      
      expect(result).toEqual(storeWithProducts)
    })
    
    it('should throw error when store not found', async () => {
      ;(prisma.store.findUnique as any).mockResolvedValue(null)
      
      await expect(storeService.getStoreById('invalid-id'))
        .rejects.toThrow('Store not found')
    })
  })
  
  describe('getStoreBySlug', () => {
    it('should return published store by slug', async () => {
      ;(prisma.store.findUnique as any).mockResolvedValue(mockStore)
      
      const result = await storeService.getStoreBySlug(mockStore.slug)
      
      expect(prisma.store.findUnique).toHaveBeenCalledWith({
        where: { slug: mockStore.slug },
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
      
      expect(result).toEqual(mockStore)
    })
    
    it('should throw error when store is not published', async () => {
      const draftStore = { ...mockStore, status: StoreStatus.DRAFT }
      ;(prisma.store.findUnique as any).mockResolvedValue(draftStore)
      
      await expect(storeService.getStoreBySlug(mockStore.slug))
        .rejects.toThrow('Store is not published')
    })
    
    it('should throw error when store not found by slug', async () => {
      ;(prisma.store.findUnique as any).mockResolvedValue(null)
      
      await expect(storeService.getStoreBySlug('invalid-slug'))
        .rejects.toThrow('Store not found')
    })
  })
  
  describe('getUserStores', () => {
    it('should return stores owned by user', async () => {
      const userStores = [mockStore, { ...mockStore, id: faker.string.uuid() }]
      const mockTotal = 2
      
      ;(prisma.store.findMany as any).mockResolvedValue(userStores)
      ;(prisma.store.count as any).mockResolvedValue(mockTotal)
      
      const result = await storeService.getUserStores(mockOwnerId, { page: 1, limit: 10 })
      
      expect(prisma.store.findMany).toHaveBeenCalledWith({
        where: { ownerId: mockOwnerId },
        skip: 0,
        take: 10,
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
      })
      
      expect(result.data).toHaveLength(2)
      expect(result.pagination.total).toBe(2)
    })
  })
  
  describe('createStore', () => {
    const createStoreData = {
      name: faker.company.name(),
      description: faker.company.catchPhrase(),
      slug: faker.internet.domainWord(),
      logo: faker.image.url()
    }
    
    it('should create a new store successfully', async () => {
      ;(prisma.store.findUnique as any).mockResolvedValue(null)
      ;(prisma.store.create as any).mockResolvedValue({
        ...createStoreData,
        id: mockStoreId,
        ownerId: mockOwnerId,
        status: StoreStatus.DRAFT,
        owner: mockOwner
      })
      
      const result = await storeService.createStore(createStoreData, mockOwnerId)
      
      expect(prisma.store.findUnique).toHaveBeenCalledWith({
        where: { slug: createStoreData.slug }
      })
      
      expect(prisma.store.create).toHaveBeenCalledWith({
        data: {
          ...createStoreData,
          ownerId: mockOwnerId
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
      
      expect(result.name).toBe(createStoreData.name)
      expect(result.slug).toBe(createStoreData.slug)
    })
    
    it('should throw error when slug already exists', async () => {
      ;(prisma.store.findUnique as any).mockResolvedValue(mockStore)
      
      await expect(storeService.createStore(createStoreData, mockOwnerId))
        .rejects.toThrow('Slug already exists')
      
      expect(prisma.store.create).not.toHaveBeenCalled()
    })
  })
  
  describe('updateStore', () => {
    const updateData = {
      name: faker.company.name(),
      description: faker.company.catchPhrase(),
      status: StoreStatus.PUBLISHED
    }
    
    it('should update store when user is owner', async () => {
      ;(prisma.store.findUnique as any).mockResolvedValue({
        ...mockStore,
        ownerId: mockUserId
      })
      ;(prisma.store.update as any).mockResolvedValue({
        ...mockStore,
        ...updateData,
        ownerId: mockUserId
      })
      
      const result = await storeService.updateStore(
        mockStoreId,
        updateData,
        mockUserId,
        UserRole.SELLER
      )
      
      expect(prisma.store.update).toHaveBeenCalledWith({
        where: { id: mockStoreId },
        data: updateData,
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
      
      expect(result.name).toBe(updateData.name)
      expect(result.status).toBe(updateData.status)
    })
    
    it('should update store when user is admin', async () => {
      ;(prisma.store.findUnique as any).mockResolvedValue(mockStore)
      ;(prisma.store.update as any).mockResolvedValue({
        ...mockStore,
        ...updateData
      })
      
      await storeService.updateStore(
        mockStoreId,
        updateData,
        'different-user-id',
        UserRole.ADMIN
      )
      
      expect(prisma.store.update).toHaveBeenCalled()
    })
    
    it('should throw error when updating to existing slug', async () => {
      const updateWithSlug = { ...updateData, slug: 'new-slug' }
      
      ;(prisma.store.findUnique as any).mockResolvedValue({
        ...mockStore,
        ownerId: mockUserId
      })
      ;(prisma.store.findFirst as any).mockResolvedValue({ id: 'other-store' })
      
      await expect(
        storeService.updateStore(mockStoreId, updateWithSlug, mockUserId, UserRole.SELLER)
      ).rejects.toThrow('Slug already exists')
      
      expect(prisma.store.update).not.toHaveBeenCalled()
    })
    
    it('should throw error when store not found', async () => {
      ;(prisma.store.findUnique as any).mockResolvedValue(null)
      
      await expect(
        storeService.updateStore(mockStoreId, updateData, mockUserId, UserRole.SELLER)
      ).rejects.toThrow('Store not found')
    })
    
    it('should throw error when not authorized', async () => {
      ;(prisma.store.findUnique as any).mockResolvedValue(mockStore)
      
      await expect(
        storeService.updateStore(mockStoreId, updateData, 'different-user', UserRole.SELLER)
      ).rejects.toThrow('Not authorized to update this store')
    })
  })
  
  describe('deleteStore', () => {
    it('should delete store when user is owner', async () => {
      ;(prisma.store.findUnique as any).mockResolvedValue({
        ...mockStore,
        ownerId: mockUserId
      })
      ;(prisma.store.delete as any).mockResolvedValue(mockStore)
      
      const result = await storeService.deleteStore(mockStoreId, mockUserId, UserRole.SELLER)
      
      expect(prisma.store.delete).toHaveBeenCalledWith({
        where: { id: mockStoreId }
      })
      
      expect(result).toEqual({ message: 'Store deleted successfully' })
    })
    
    it('should delete store when user is admin', async () => {
      ;(prisma.store.findUnique as any).mockResolvedValue(mockStore)
      ;(prisma.store.delete as any).mockResolvedValue(mockStore)
      
      await storeService.deleteStore(mockStoreId, 'admin-user', UserRole.ADMIN)
      
      expect(prisma.store.delete).toHaveBeenCalled()
    })
    
    it('should throw error when store not found', async () => {
      ;(prisma.store.findUnique as any).mockResolvedValue(null)
      
      await expect(
        storeService.deleteStore(mockStoreId, mockUserId, UserRole.SELLER)
      ).rejects.toThrow('Store not found')
    })
    
    it('should throw error when not authorized', async () => {
      ;(prisma.store.findUnique as any).mockResolvedValue(mockStore)
      
      await expect(
        storeService.deleteStore(mockStoreId, 'different-user', UserRole.BUYER)
      ).rejects.toThrow('Not authorized to delete this store')
    })
  })
  
  describe('publishStore', () => {
    it('should publish store when user is owner', async () => {
      const draftStore = { ...mockStore, status: StoreStatus.DRAFT, ownerId: mockUserId }
      ;(prisma.store.findUnique as any).mockResolvedValue(draftStore)
      ;(prisma.store.update as any).mockResolvedValue({
        ...draftStore,
        status: StoreStatus.PUBLISHED
      })
      
      const result = await storeService.publishStore(mockStoreId, mockUserId, UserRole.SELLER)
      
      expect(prisma.store.update).toHaveBeenCalledWith({
        where: { id: mockStoreId },
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
      
      expect(result.status).toBe(StoreStatus.PUBLISHED)
    })
    
    it('should throw error when not authorized to publish', async () => {
      ;(prisma.store.findUnique as any).mockResolvedValue(mockStore)
      
      await expect(
        storeService.publishStore(mockStoreId, 'different-user', UserRole.BUYER)
      ).rejects.toThrow('Not authorized to publish this store')
    })
  })
  
  describe('unpublishStore', () => {
    it('should unpublish store when user is owner', async () => {
      const publishedStore = { ...mockStore, ownerId: mockUserId }
      ;(prisma.store.findUnique as any).mockResolvedValue(publishedStore)
      ;(prisma.store.update as any).mockResolvedValue({
        ...publishedStore,
        status: StoreStatus.DRAFT
      })
      
      const result = await storeService.unpublishStore(mockStoreId, mockUserId, UserRole.SELLER)
      
      expect(prisma.store.update).toHaveBeenCalledWith({
        where: { id: mockStoreId },
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
      
      expect(result.status).toBe(StoreStatus.DRAFT)
    })
    
    it('should unpublish store when user is admin', async () => {
      ;(prisma.store.findUnique as any).mockResolvedValue(mockStore)
      ;(prisma.store.update as any).mockResolvedValue({
        ...mockStore,
        status: StoreStatus.DRAFT
      })
      
      await storeService.unpublishStore(mockStoreId, 'admin-user', UserRole.ADMIN)
      
      expect(prisma.store.update).toHaveBeenCalled()
    })
    
    it('should throw error when store not found', async () => {
      ;(prisma.store.findUnique as any).mockResolvedValue(null)
      
      await expect(
        storeService.unpublishStore(mockStoreId, mockUserId, UserRole.SELLER)
      ).rejects.toThrow('Store not found')
    })
  })
})