import { db } from '../db'
import { reviews, reviewHelpfuls, orders, orderItems } from '../db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
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

    const existingReview = await db.query.reviews.findFirst({
      where: and(
        eq(reviews.productId, productId),
        eq(reviews.userId, userId),
        data.orderId ? eq(reviews.orderId, data.orderId) : sql`${reviews.orderId} IS NULL`
      ),
    })

    if (existingReview) {
      throw new Error('You have already reviewed this product')
    }

    let verifiedPurchase = false

    if (data.orderId) {
      const order = await db.query.orders.findFirst({
        where: and(eq(orders.id, data.orderId), eq(orders.userId, userId), eq(orders.status, 'DELIVERED')),
        with: {
          items: { where: eq(orderItems.productId, productId) },
        },
      })

      if (!order || order.items.length === 0) {
        throw new Error('Invalid order or product not in this order')
      }

      verifiedPurchase = true
    } else {
      const deliveredOrder = await db.query.orders.findFirst({
        where: and(eq(orders.userId, userId), eq(orders.status, 'DELIVERED')),
        with: {
          items: { where: eq(orderItems.productId, productId) },
        },
      })

      verifiedPurchase = !!deliveredOrder && deliveredOrder.items.length > 0
    }

    const [review] = await db
      .insert(reviews)
      .values({
        productId,
        userId,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        images: data.images || [],
        orderId: data.orderId,
        verifiedPurchase,
      })
      .returning()

    return db.query.reviews.findFirst({
      where: eq(reviews.id, review.id),
      with: {
        user: { columns: { id: true, name: true } },
        helpfulVotes: true,
      },
    })
  }

  async updateReview(reviewId: string, userId: string, data: UpdateReviewData) {
    const review = await db.query.reviews.findFirst({ where: eq(reviews.id, reviewId) })

    if (!review) {
      throw new Error('Review not found')
    }

    if (review.userId !== userId) {
      throw new Error('Not authorized to update this review')
    }

    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new Error('Rating must be between 1 and 5')
    }

    const updateData: Record<string, unknown> = {}
    if (data.rating !== undefined) updateData.rating = data.rating
    if (data.title !== undefined) updateData.title = data.title
    if (data.comment !== undefined) updateData.comment = data.comment
    if (data.images !== undefined) updateData.images = data.images

    await db.update(reviews).set(updateData as any).where(eq(reviews.id, reviewId))

    return db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId),
      with: {
        user: { columns: { id: true, name: true } },
        helpfulVotes: true,
      },
    })
  }

  async deleteReview(reviewId: string, userId: string) {
    const review = await db.query.reviews.findFirst({ where: eq(reviews.id, reviewId) })

    if (!review) {
      throw new Error('Review not found')
    }

    if (review.userId !== userId) {
      throw new Error('Not authorized to delete this review')
    }

    await db.delete(reviews).where(eq(reviews.id, reviewId))

    return { message: 'Review deleted successfully' }
  }

  async getProductReviews(
    productId: string,
    filters: ReviewFilters,
    pagination: { page: number; limit: number }
  ) {
    const { page, limit, skip } = this.getPaginationParams(pagination)

    const conditions: any[] = [eq(reviews.productId, productId)]
    if (filters.rating) conditions.push(eq(reviews.rating, filters.rating))
    if (filters.verifiedPurchase !== undefined) {
      conditions.push(eq(reviews.verifiedPurchase, filters.verifiedPurchase))
    }

    const whereClause = and(...conditions)

    const [rows, [{ total }]] = await Promise.all([
      db.query.reviews.findMany({
        where: whereClause,
        limit,
        offset: skip,
        orderBy: [desc(reviews.createdAt)],
        with: {
          user: { columns: { id: true, name: true } },
          helpfulVotes: { columns: { helpful: true, userId: true } },
        },
      }),
      db.select({ total: sql<number>`count(*)::int` }).from(reviews).where(whereClause),
    ])

    const reviewsWithStats = rows.map((review) => {
      const helpfulCount = review.helpfulVotes.filter((v) => v.helpful).length
      const notHelpfulCount = review.helpfulVotes.filter((v) => !v.helpful).length

      return {
        ...review,
        helpfulStats: {
          helpful: helpfulCount,
          notHelpful: notHelpfulCount,
          total: review.helpfulVotes.length,
        },
      }
    })

    return this.formatPaginatedResult(reviewsWithStats, Number(total), page, limit)
  }

  async getProductRatingStats(productId: string) {
    const allReviews = await db.query.reviews.findMany({
      where: eq(reviews.productId, productId),
      columns: { rating: true },
    })

    if (allReviews.length === 0) {
      return { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let totalRating = 0

    for (const review of allReviews) {
      distribution[review.rating as keyof typeof distribution]++
      totalRating += review.rating
    }

    return {
      averageRating: Number((totalRating / allReviews.length).toFixed(1)),
      totalReviews: allReviews.length,
      distribution,
      percentages: {
        1: Number(((distribution[1] / allReviews.length) * 100).toFixed(1)),
        2: Number(((distribution[2] / allReviews.length) * 100).toFixed(1)),
        3: Number(((distribution[3] / allReviews.length) * 100).toFixed(1)),
        4: Number(((distribution[4] / allReviews.length) * 100).toFixed(1)),
        5: Number(((distribution[5] / allReviews.length) * 100).toFixed(1)),
      },
    }
  }

  async getUserReviews(userId: string, pagination: { page: number; limit: number }) {
    const { page, limit, skip } = this.getPaginationParams(pagination)

    const where = eq(reviews.userId, userId)

    const [rows, [{ total }]] = await Promise.all([
      db.query.reviews.findMany({
        where,
        limit,
        offset: skip,
        orderBy: [desc(reviews.createdAt)],
        with: {
          product: { columns: { id: true, name: true, images: true } },
          helpfulVotes: { columns: { helpful: true } },
        },
      }),
      db.select({ total: sql<number>`count(*)::int` }).from(reviews).where(where),
    ])

    return this.formatPaginatedResult(rows, Number(total), page, limit)
  }

  async markReviewHelpful(reviewId: string, userId: string, helpful: boolean) {
    const review = await db.query.reviews.findFirst({ where: eq(reviews.id, reviewId) })

    if (!review) {
      throw new Error('Review not found')
    }

    if (review.userId === userId) {
      throw new Error('Cannot vote on your own review')
    }

    const existingVote = await db.query.reviewHelpfuls.findFirst({
      where: and(eq(reviewHelpfuls.userId, userId), eq(reviewHelpfuls.reviewId, reviewId)),
    })

    if (existingVote) {
      if (existingVote.helpful === helpful) {
        await db.delete(reviewHelpfuls).where(eq(reviewHelpfuls.id, existingVote.id))
        return { message: 'Vote removed' }
      } else {
        await db.update(reviewHelpfuls).set({ helpful }).where(eq(reviewHelpfuls.id, existingVote.id))
        return { message: 'Vote updated' }
      }
    } else {
      await db.insert(reviewHelpfuls).values({ userId, reviewId, helpful })
      return { message: `Marked as ${helpful ? 'helpful' : 'not helpful'}` }
    }
  }

  async canUserReviewProduct(userId: string, productId: string) {
    const existingReview = await db.query.reviews.findFirst({
      where: and(eq(reviews.userId, userId), eq(reviews.productId, productId)),
    })

    if (existingReview) {
      return { canReview: false, reason: 'Already reviewed this product', existingReviewId: existingReview.id }
    }

    const deliveredOrder = await db.query.orders.findFirst({
      where: and(eq(orders.userId, userId), eq(orders.status, 'DELIVERED')),
      columns: { id: true, orderNumber: true },
      with: {
        items: { where: eq(orderItems.productId, productId), columns: { id: true } },
      },
    })

    const hasDeliveredOrder = deliveredOrder && deliveredOrder.items.length > 0

    return {
      canReview: true,
      verifiedPurchase: !!hasDeliveredOrder,
      orderId: hasDeliveredOrder ? deliveredOrder.id : undefined,
    }
  }
}

export const reviewService = new ReviewService()
