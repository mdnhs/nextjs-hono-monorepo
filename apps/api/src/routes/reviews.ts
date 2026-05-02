import { Hono } from 'hono'
import { reviewController } from '../controllers/review.controller'
import { authenticate } from '../middlewares/auth'
import { requirePermission, PERMISSIONS, requireReviewOwnership } from '../middlewares/rbac'

const reviewsRouter = new Hono()

// Public endpoints
reviewsRouter.get('/product/:productId', (c) => reviewController.getProductReviews(c))
reviewsRouter.get('/product/:productId/stats', (c) => reviewController.getProductRatingStats(c))

// Protected endpoints
reviewsRouter.get('/my', authenticate, requirePermission(PERMISSIONS.BUYER_REVIEWS), (c) => reviewController.getUserReviews(c))
reviewsRouter.get('/product/:productId/can-review', authenticate, requirePermission(PERMISSIONS.BUYER_REVIEWS), (c) => reviewController.canReviewProduct(c))
reviewsRouter.post('/product/:productId', authenticate, requirePermission(PERMISSIONS.BUYER_REVIEWS), (c) => reviewController.createReview(c))
reviewsRouter.patch('/:id', authenticate, requirePermission(PERMISSIONS.BUYER_REVIEWS), requireReviewOwnership, (c) => reviewController.updateReview(c))
reviewsRouter.delete('/:id', authenticate, requirePermission(PERMISSIONS.BUYER_REVIEWS), requireReviewOwnership, (c) => reviewController.deleteReview(c))
reviewsRouter.post('/:id/helpful', authenticate, requirePermission(PERMISSIONS.BUYER_REVIEWS), (c) => reviewController.markReviewHelpful(c))

export default reviewsRouter