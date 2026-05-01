import { Context } from 'hono'
import { BaseController } from './base.controller'
import { reviewService, CreateReviewData, UpdateReviewData } from '../services/review.service'
import { z } from 'zod'

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(10).max(1000),
  images: z.array(z.string().url()).optional(),
  orderId: z.string().optional()
})

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().optional(),
  comment: z.string().min(10).max(1000).optional(),
  images: z.array(z.string().url()).optional()
})

const markHelpfulSchema = z.object({
  helpful: z.boolean()
})

export class ReviewController extends BaseController {
  async createReview(c: Context) {
    try {
      const user = c.get('user')
      const productId = c.req.param('productId')!
      const validatedData = await this.parseBody<CreateReviewData>(c, createReviewSchema)
      
      const review = await reviewService.createReview(productId, user.userId, validatedData)
      
      return c.json({
        message: 'Review created successfully',
        review
      }, 201)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async updateReview(c: Context) {
    try {
      const user = c.get('user')
      const reviewId = c.req.param('id')!
      const validatedData = await this.parseBody<UpdateReviewData>(c, updateReviewSchema)
      
      const review = await reviewService.updateReview(reviewId, user.userId, validatedData)
      
      return c.json({
        message: 'Review updated successfully',
        review
      })
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async deleteReview(c: Context) {
    try {
      const user = c.get('user')
      const reviewId = c.req.param('id')!
      
      const result = await reviewService.deleteReview(reviewId, user.userId)
      
      return c.json(result)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async getProductReviews(c: Context) {
    try {
      const productId = c.req.param('productId')!
      const { page, limit } = this.getPaginationParams(c)
      const rating = c.req.query('rating') ? parseInt(c.req.query('rating')!) : undefined
      const verifiedPurchase = c.req.query('verified') === 'true'
      
      const filters = {
        productId,
        rating,
        verifiedPurchase: c.req.query('verified') !== undefined ? verifiedPurchase : undefined
      }
      
      const result = await reviewService.getProductReviews(productId, filters, { page, limit })
      
      return c.json(result)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async getProductRatingStats(c: Context) {
    try {
      const productId = c.req.param('productId')!
      
      const stats = await reviewService.getProductRatingStats(productId)
      
      return c.json(stats)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async getUserReviews(c: Context) {
    try {
      const user = c.get('user')
      const { page, limit } = this.getPaginationParams(c)
      
      const result = await reviewService.getUserReviews(user.userId, { page, limit })
      
      return c.json(result)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async markReviewHelpful(c: Context) {
    try {
      const user = c.get('user')
      const reviewId = c.req.param('id')!
      const { helpful } = await this.parseBody<{ helpful: boolean }>(c, markHelpfulSchema)
      
      const result = await reviewService.markReviewHelpful(reviewId, user.userId, helpful)
      
      return c.json(result)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
  
  async canReviewProduct(c: Context) {
    try {
      const user = c.get('user')
      const productId = c.req.param('productId')!
      
      const result = await reviewService.canUserReviewProduct(user.userId, productId)
      
      return c.json(result)
    } catch (error: any) {
      return this.handleError(error)
    }
  }
}

export const reviewController = new ReviewController()