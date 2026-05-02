import { describe, it, expect, beforeEach, vi } from "vitest";
import { ReviewService } from "../review.service";
import { db } from '../../db';
import { faker } from "@faker-js/faker";

vi.mock('../../db');

// TODO: These tests were written for Prisma and need rewriting for Drizzle
const prisma = db as any

describe("ReviewService", () => {
  let reviewService: ReviewService;

  const mockUserId = faker.string.uuid();
  const mockProductId = faker.string.uuid();
  const mockReviewId = faker.string.uuid();
  const mockOrderId = faker.string.uuid();

  const mockUser = {
    id: mockUserId,
    name: faker.person.fullName(),
  };

  const mockReview = {
    id: mockReviewId,
    productId: mockProductId,
    userId: mockUserId,
    rating: 4,
    title: faker.lorem.sentence(),
    comment: faker.lorem.paragraph(),
    images: [faker.image.url()],
    verifiedPurchase: true,
    orderId: mockOrderId,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
    helpfulVotes: [],
  };

  const mockOrder = {
    id: mockOrderId,
    userId: mockUserId,
    status: 'DELIVERED',
    orderNumber: faker.string.alphanumeric(10),
    items: [
      {
        productId: mockProductId,
        quantity: 1,
      },
    ],
  };

  beforeEach(() => {
    reviewService = new ReviewService();
    vi.clearAllMocks();
  });

  describe("createReview", () => {
    const createReviewData = {
      rating: 5,
      title: faker.lorem.sentence(),
      comment: faker.lorem.paragraph(),
      images: [faker.image.url()],
      orderId: mockOrderId,
    };

    it("should create a review with verified purchase", async () => {
      (prisma.review.findFirst as any).mockResolvedValue(null);
      (prisma.order.findFirst as any).mockResolvedValue(mockOrder);
      (prisma.review.create as any).mockResolvedValue({
        ...mockReview,
        ...createReviewData,
        verifiedPurchase: true,
      });

      const result = await reviewService.createReview(
        mockProductId,
        mockUserId,
        createReviewData
      );

      expect(prisma.review.findFirst).toHaveBeenCalledWith({
        where: {
          productId: mockProductId,
          userId: mockUserId,
          orderId: mockOrderId,
        },
      });

      expect(prisma.order.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockOrderId,
          userId: mockUserId,
          status: 'DELIVERED',
          items: {
            some: {
              productId: mockProductId,
            },
          },
        },
      });

      expect(prisma.review.create).toHaveBeenCalledWith({
        data: {
          productId: mockProductId,
          userId: mockUserId,
          rating: createReviewData.rating,
          title: createReviewData.title,
          comment: createReviewData.comment,
          images: createReviewData.images,
          orderId: mockOrderId,
          verifiedPurchase: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          helpfulVotes: true,
        },
      });

      expect(result!.verifiedPurchase).toBe(true);
    });

    it("should create a review without order but check for verified purchase", async () => {
      const dataWithoutOrder = { ...createReviewData, orderId: undefined };

      (prisma.review.findFirst as any).mockResolvedValue(null);
      (prisma.order.findFirst as any).mockResolvedValue(mockOrder);
      (prisma.review.create as any).mockResolvedValue({
        ...mockReview,
        orderId: null,
        verifiedPurchase: true,
      });

      await reviewService.createReview(
        mockProductId,
        mockUserId,
        dataWithoutOrder
      );

      // Should check for any delivered order with this product
      expect(prisma.order.findFirst).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          status: 'DELIVERED',
          items: {
            some: {
              productId: mockProductId,
            },
          },
        },
      });

      expect(prisma.review.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            verifiedPurchase: true,
            orderId: undefined,
          }),
        })
      );
    });

    it("should throw error when rating is out of range", async () => {
      const invalidRatingData = { ...createReviewData, rating: 6 };

      await expect(
        reviewService.createReview(mockProductId, mockUserId, invalidRatingData)
      ).rejects.toThrow("Rating must be between 1 and 5");

      const lowRatingData = { ...createReviewData, rating: 0 };

      await expect(
        reviewService.createReview(mockProductId, mockUserId, lowRatingData)
      ).rejects.toThrow("Rating must be between 1 and 5");
    });

    it("should throw error when user already reviewed the product", async () => {
      (prisma.review.findFirst as any).mockResolvedValue(mockReview);

      await expect(
        reviewService.createReview(mockProductId, mockUserId, createReviewData)
      ).rejects.toThrow("You have already reviewed this product");

      expect(prisma.review.create).not.toHaveBeenCalled();
    });

    it("should throw error when order is invalid for review", async () => {
      (prisma.review.findFirst as any).mockResolvedValue(null);
      (prisma.order.findFirst as any).mockResolvedValue(null);

      await expect(
        reviewService.createReview(mockProductId, mockUserId, createReviewData)
      ).rejects.toThrow("Invalid order or product not in this order");
    });

    it("should create unverified review when no purchase found", async () => {
      const dataWithoutOrder = { ...createReviewData, orderId: undefined };

      (prisma.review.findFirst as any).mockResolvedValue(null);
      (prisma.order.findFirst as any).mockResolvedValue(null); // No purchase found
      (prisma.review.create as any).mockResolvedValue({
        ...mockReview,
        orderId: null,
        verifiedPurchase: false,
      });

      const result = await reviewService.createReview(
        mockProductId,
        mockUserId,
        dataWithoutOrder
      );

      expect(prisma.review.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            verifiedPurchase: false,
          }),
        })
      );

      expect(result!.verifiedPurchase).toBe(false);
    });
  });

  describe("updateReview", () => {
    const updateData = {
      rating: 3,
      comment: "Updated comment",
    };

    it("should update review when user is owner", async () => {
      (prisma.review.findUnique as any).mockResolvedValue(mockReview);
      (prisma.review.update as any).mockResolvedValue({
        ...mockReview,
        ...updateData,
      });

      const result = await reviewService.updateReview(
        mockReviewId,
        mockUserId,
        updateData
      );

      expect(prisma.review.update).toHaveBeenCalledWith({
        where: { id: mockReviewId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          helpfulVotes: true,
        },
      });

      expect(result!.rating).toBe(updateData.rating);
      expect(result!.comment).toBe(updateData.comment);
    });

    it("should throw error when review not found", async () => {
      (prisma.review.findUnique as any).mockResolvedValue(null);

      await expect(
        reviewService.updateReview(mockReviewId, mockUserId, updateData)
      ).rejects.toThrow("Review not found");
    });

    it("should throw error when user not authorized", async () => {
      const differentUserId = faker.string.uuid();
      (prisma.review.findUnique as any).mockResolvedValue(mockReview);

      await expect(
        reviewService.updateReview(mockReviewId, differentUserId, updateData)
      ).rejects.toThrow("Not authorized to update this review");
    });

    it("should throw error when rating is invalid", async () => {
      (prisma.review.findUnique as any).mockResolvedValue(mockReview);

      await expect(
        reviewService.updateReview(mockReviewId, mockUserId, { rating: 6 })
      ).rejects.toThrow("Rating must be between 1 and 5");
    });
  });

  describe("deleteReview", () => {
    it("should delete review when user is owner", async () => {
      (prisma.review.findUnique as any).mockResolvedValue(mockReview);
      (prisma.review.delete as any).mockResolvedValue(mockReview);

      const result = await reviewService.deleteReview(mockReviewId, mockUserId);

      expect(prisma.review.delete).toHaveBeenCalledWith({
        where: { id: mockReviewId },
      });

      expect(result).toEqual({ message: "Review deleted successfully" });
    });

    it("should throw error when review not found", async () => {
      (prisma.review.findUnique as any).mockResolvedValue(null);

      await expect(
        reviewService.deleteReview(mockReviewId, mockUserId)
      ).rejects.toThrow("Review not found");
    });

    it("should throw error when user not authorized", async () => {
      const differentUserId = faker.string.uuid();
      (prisma.review.findUnique as any).mockResolvedValue(mockReview);

      await expect(
        reviewService.deleteReview(mockReviewId, differentUserId)
      ).rejects.toThrow("Not authorized to delete this review");
    });
  });

  describe("getProductReviews", () => {
    it("should return paginated reviews with helpful stats", async () => {
      const mockReviews = [
        {
          ...mockReview,
          helpfulVotes: [
            { helpful: true, userId: "user1" },
            { helpful: true, userId: "user2" },
            { helpful: false, userId: "user3" },
          ],
        },
      ];

      (prisma.review.findMany as any).mockResolvedValue(mockReviews);
      (prisma.review.count as any).mockResolvedValue(1);

      const result = await reviewService.getProductReviews(
        mockProductId,
        {},
        { page: 1, limit: 10 }
      );

      expect(prisma.review.findMany).toHaveBeenCalledWith({
        where: { productId: mockProductId },
        skip: 0,
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          helpfulVotes: {
            select: {
              helpful: true,
              userId: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      expect(result.data[0].helpfulStats).toEqual({
        helpful: 2,
        notHelpful: 1,
        total: 3,
      });
    });

    it("should filter reviews by rating", async () => {
      (prisma.review.findMany as any).mockResolvedValue([]);
      (prisma.review.count as any).mockResolvedValue(0);

      await reviewService.getProductReviews(
        mockProductId,
        { rating: 5 },
        { page: 1, limit: 10 }
      );

      expect(prisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            productId: mockProductId,
            rating: 5,
          },
        })
      );
    });

    it("should filter by verified purchase", async () => {
      (prisma.review.findMany as any).mockResolvedValue([]);
      (prisma.review.count as any).mockResolvedValue(0);

      await reviewService.getProductReviews(
        mockProductId,
        { verifiedPurchase: true },
        { page: 1, limit: 10 }
      );

      expect(prisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            productId: mockProductId,
            verifiedPurchase: true,
          },
        })
      );
    });
  });

  describe("getProductRatingStats", () => {
    it("should calculate rating statistics", async () => {
      const mockReviews = [
        { rating: 5 },
        { rating: 5 },
        { rating: 4 },
        { rating: 3 },
        { rating: 2 },
      ];

      (prisma.review.findMany as any).mockResolvedValue(mockReviews);

      const result = await reviewService.getProductRatingStats(mockProductId);

      expect(result.averageRating).toBe(3.8);
      expect(result.totalReviews).toBe(5);
      expect(result.distribution).toEqual({
        1: 0,
        2: 1,
        3: 1,
        4: 1,
        5: 2,
      });
      expect(result.percentages).toEqual({
        1: 0,
        2: 20,
        3: 20,
        4: 20,
        5: 40,
      });
    });

    it("should handle no reviews", async () => {
      (prisma.review.findMany as any).mockResolvedValue([]);

      const result = await reviewService.getProductRatingStats(mockProductId);

      expect(result).toEqual({
        averageRating: 0,
        totalReviews: 0,
        distribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      });
    });
  });

  describe("getUserReviews", () => {
    it("should return user reviews with product info", async () => {
      const mockUserReviews = [
        {
          ...mockReview,
          product: {
            id: mockProductId,
            name: faker.commerce.productName(),
            images: [faker.image.url()],
          },
          helpfulVotes: [{ helpful: true }, { helpful: false }],
        },
      ];

      (prisma.review.findMany as any).mockResolvedValue(mockUserReviews);
      (prisma.review.count as any).mockResolvedValue(1);

      const result = await reviewService.getUserReviews(mockUserId, {
        page: 1,
        limit: 10,
      });

      expect(prisma.review.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        skip: 0,
        take: 10,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
          helpfulVotes: {
            select: {
              helpful: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      expect(result.data[0].product).toBeDefined();
      expect(result.data[0].product.name).toBeDefined();
    });
  });

  describe("markReviewHelpful", () => {
    const helpfulVoteId = faker.string.uuid();

    it("should create helpful vote", async () => {
      (prisma.review.findUnique as any).mockResolvedValue({
        ...mockReview,
        userId: faker.string.uuid(), // Different user
      });
      (prisma.reviewHelpful.findUnique as any).mockResolvedValue(null);
      (prisma.reviewHelpful.create as any).mockResolvedValue({
        id: helpfulVoteId,
        userId: mockUserId,
        reviewId: mockReviewId,
        helpful: true,
      });

      const result = await reviewService.markReviewHelpful(
        mockReviewId,
        mockUserId,
        true
      );

      expect(prisma.reviewHelpful.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          reviewId: mockReviewId,
          helpful: true,
        },
      });

      expect(result.message).toBe("Marked as helpful");
    });

    it("should update existing vote when different", async () => {
      const existingVote = {
        id: helpfulVoteId,
        userId: mockUserId,
        reviewId: mockReviewId,
        helpful: false,
      };

      (prisma.review.findUnique as any).mockResolvedValue({
        ...mockReview,
        userId: faker.string.uuid(),
      });
      (prisma.reviewHelpful.findUnique as any).mockResolvedValue(existingVote);
      (prisma.reviewHelpful.update as any).mockResolvedValue({
        ...existingVote,
        helpful: true,
      });

      const result = await reviewService.markReviewHelpful(
        mockReviewId,
        mockUserId,
        true
      );

      expect(prisma.reviewHelpful.update).toHaveBeenCalledWith({
        where: { id: helpfulVoteId },
        data: { helpful: true },
      });

      expect(result.message).toBe("Vote updated");
    });

    it("should remove vote when same value clicked", async () => {
      const existingVote = {
        id: helpfulVoteId,
        userId: mockUserId,
        reviewId: mockReviewId,
        helpful: true,
      };

      (prisma.review.findUnique as any).mockResolvedValue({
        ...mockReview,
        userId: faker.string.uuid(),
      });
      (prisma.reviewHelpful.findUnique as any).mockResolvedValue(existingVote);
      (prisma.reviewHelpful.delete as any).mockResolvedValue(existingVote);

      const result = await reviewService.markReviewHelpful(
        mockReviewId,
        mockUserId,
        true
      );

      expect(prisma.reviewHelpful.delete).toHaveBeenCalledWith({
        where: { id: helpfulVoteId },
      });

      expect(result.message).toBe("Vote removed");
    });

    it("should throw error when review not found", async () => {
      (prisma.review.findUnique as any).mockResolvedValue(null);

      await expect(
        reviewService.markReviewHelpful(mockReviewId, mockUserId, true)
      ).rejects.toThrow("Review not found");
    });

    it("should throw error when voting on own review", async () => {
      (prisma.review.findUnique as any).mockResolvedValue(mockReview);

      await expect(
        reviewService.markReviewHelpful(mockReviewId, mockUserId, true)
      ).rejects.toThrow("Cannot vote on your own review");
    });
  });

  describe("canUserReviewProduct", () => {
    it("should allow review with verified purchase", async () => {
      (prisma.review.findFirst as any).mockResolvedValue(null);
      (prisma.order.findFirst as any).mockResolvedValue(mockOrder);

      const result = await reviewService.canUserReviewProduct(
        mockUserId,
        mockProductId
      );

      expect(result).toEqual({
        canReview: true,
        verifiedPurchase: true,
        orderId: mockOrderId,
      });
    });

    it("should allow review without verified purchase", async () => {
      (prisma.review.findFirst as any).mockResolvedValue(null);
      (prisma.order.findFirst as any).mockResolvedValue(null);

      const result = await reviewService.canUserReviewProduct(
        mockUserId,
        mockProductId
      );

      expect(result).toEqual({
        canReview: true,
        verifiedPurchase: false,
        orderId: undefined,
      });
    });

    it("should not allow review when already reviewed", async () => {
      (prisma.review.findFirst as any).mockResolvedValue(mockReview);

      const result = await reviewService.canUserReviewProduct(
        mockUserId,
        mockProductId
      );

      expect(result).toEqual({
        canReview: false,
        reason: "Already reviewed this product",
        existingReviewId: mockReviewId,
      });
    });
  });
});
