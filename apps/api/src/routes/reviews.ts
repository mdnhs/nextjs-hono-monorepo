import { Hono } from 'hono'
import { reviewController } from '../controllers/review.controller'
import { authenticate } from '../middlewares/auth'

const reviewsRouter = new Hono()

// Public endpoints
reviewsRouter.get('/product/:productId', (c) => reviewController.getProductReviews(c))
reviewsRouter.get('/product/:productId/stats', (c) => reviewController.getProductRatingStats(c))

// Protected endpoints
reviewsRouter.get('/my', authenticate, (c) => reviewController.getUserReviews(c))
reviewsRouter.get('/product/:productId/can-review', authenticate, (c) => reviewController.canReviewProduct(c))
reviewsRouter.post('/product/:productId', authenticate, (c) => reviewController.createReview(c))
reviewsRouter.patch('/:id', authenticate, (c) => reviewController.updateReview(c))
reviewsRouter.delete('/:id', authenticate, (c) => reviewController.deleteReview(c))
reviewsRouter.post('/:id/helpful', authenticate, (c) => reviewController.markReviewHelpful(c))

export default reviewsRouter