import { OrderStatus, Prisma } from '@prisma/client'
import { prisma } from '../utils/prisma'
import { BaseService } from './base.service'

export interface CreateReviewData {
  rating: number
  title?: string
  comment: string
  images?: string[]
  orderId?: string
}

export interface UpdateReviewData {
  rating?: number
  title?: string
  comment?: string
  images?: string[]
}

export interface ReviewFilters {
  productId?: string
  userId?: string
  rating?: number
  verifiedPurchase?: boolean
}

export class ReviewService extends BaseService {
  async createReview(productId: string, userId: string, data: CreateReviewData) {
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5')
    }
    
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId,
        orderId: data.orderId || null
      }
    })
    
    if (existingReview) {
      throw new Error('You have already reviewed this product')
    }
    
    let verifiedPurchase = false
    
    if (data.orderId) {
      const order = await prisma.order.findFirst({
        where: {
          id: data.orderId,
          userId,
          status: OrderStatus.DELIVERED,
          items: {
            some: {
              productId
            }
          }
        }
      })
      
      if (!order) {
        throw new Error('Invalid order or product not in this order')
      }
      
      verifiedPurchase = true
    } else {
      const hasOrderedProduct = await prisma.order.findFirst({
        where: {
          userId,
          status: OrderStatus.DELIVERED,
          items: {
            some: {
              productId
            }
          }
        }
      })
      
      verifiedPurchase = !!hasOrderedProduct
    }
    
    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        images: data.images || [],
        orderId: data.orderId,
        verifiedPurchase
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        helpfulVotes: true
      }
    })
    
    return review
  }
  
  async updateReview(reviewId: string, userId: string, data: UpdateReviewData) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })
    
    if (!review) {
      throw new Error('Review not found')
    }
    
    if (review.userId !== userId) {
      throw new Error('Not authorized to update this review')
    }
    
    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new Error('Rating must be between 1 and 5')
    }
    
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        images: data.images
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        helpfulVotes: true
      }
    })
    
    return updatedReview
  }
  
  async deleteReview(reviewId: string, userId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })
    
    if (!review) {
      throw new Error('Review not found')
    }
    
    if (review.userId !== userId) {
      throw new Error('Not authorized to delete this review')
    }
    
    await prisma.review.delete({
      where: { id: reviewId }
    })
    
    return { message: 'Review deleted successfully' }
  }
  
  async getProductReviews(productId: string, filters: ReviewFilters, pagination: { page: number; limit: number }) {
    const { page, limit, skip } = this.getPaginationParams(pagination)
    
    const where: Prisma.ReviewWhereInput = {
      productId,
      ...(filters.rating && { rating: filters.rating }),
      ...(filters.verifiedPurchase !== undefined && { verifiedPurchase: filters.verifiedPurchase })
    }
    
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          },
          helpfulVotes: {
            select: {
              helpful: true,
              userId: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.review.count({ where })
    ])
    
    const reviewsWithStats = reviews.map(review => {
      const helpfulCount = review.helpfulVotes.filter(v => v.helpful).length
      const notHelpfulCount = review.helpfulVotes.filter(v => !v.helpful).length
      
      return {
        ...review,
        helpfulStats: {
          helpful: helpfulCount,
          notHelpful: notHelpfulCount,
          total: review.helpfulVotes.length
        }
      }
    })
    
    return this.formatPaginatedResult(reviewsWithStats, total, page, limit)
  }
  
  async getProductRatingStats(productId: string) {
    const reviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true }
    })
    
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        distribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        }
      }
    }
    
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let totalRating = 0
    
    for (const review of reviews) {
      distribution[review.rating as keyof typeof distribution]++
      totalRating += review.rating
    }
    
    return {
      averageRating: Number((totalRating / reviews.length).toFixed(1)),
      totalReviews: reviews.length,
      distribution,
      percentages: {
        1: Number(((distribution[1] / reviews.length) * 100).toFixed(1)),
        2: Number(((distribution[2] / reviews.length) * 100).toFixed(1)),
        3: Number(((distribution[3] / reviews.length) * 100).toFixed(1)),
        4: Number(((distribution[4] / reviews.length) * 100).toFixed(1)),
        5: Number(((distribution[5] / reviews.length) * 100).toFixed(1))
      }
    }
  }
  
  async getUserReviews(userId: string, pagination: { page: number; limit: number }) {
    const { page, limit, skip } = this.getPaginationParams(pagination)
    
    const where = { userId }
    
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true
            }
          },
          helpfulVotes: {
            select: {
              helpful: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.review.count({ where })
    ])
    
    return this.formatPaginatedResult(reviews, total, page, limit)
  }
  
  async markReviewHelpful(reviewId: string, userId: string, helpful: boolean) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })
    
    if (!review) {
      throw new Error('Review not found')
    }
    
    if (review.userId === userId) {
      throw new Error('Cannot vote on your own review')
    }
    
    const existingVote = await prisma.reviewHelpful.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId
        }
      }
    })
    
    if (existingVote) {
      if (existingVote.helpful === helpful) {
        await prisma.reviewHelpful.delete({
          where: { id: existingVote.id }
        })
        
        return { message: 'Vote removed' }
      } else {
        await prisma.reviewHelpful.update({
          where: { id: existingVote.id },
          data: { helpful }
        })
        
        return { message: 'Vote updated' }
      }
    } else {
      await prisma.reviewHelpful.create({
        data: {
          userId,
          reviewId,
          helpful
        }
      })
      
      return { message: `Marked as ${helpful ? 'helpful' : 'not helpful'}` }
    }
  }
  
  async canUserReviewProduct(userId: string, productId: string) {
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        productId
      }
    })
    
    if (existingReview) {
      return {
        canReview: false,
        reason: 'Already reviewed this product',
        existingReviewId: existingReview.id
      }
    }
    
    const deliveredOrder = await prisma.order.findFirst({
      where: {
        userId,
        status: OrderStatus.DELIVERED,
        items: {
          some: {
            productId
          }
        }
      },
      select: {
        id: true,
        orderNumber: true
      }
    })
    
    return {
      canReview: true,
      verifiedPurchase: !!deliveredOrder,
      orderId: deliveredOrder?.id
    }
  }
}

export const reviewService = new ReviewService()