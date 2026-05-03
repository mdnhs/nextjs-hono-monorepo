'use client';

import { useProductReviews, useProductStats, useReviewEligibility, useReviewMutations } from '@/hooks/api/query/use-reviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { data: reviewsResponse, isLoading: isLoadingReviews } = useProductReviews(productId);
  const { data: statsResponse } = useProductStats(productId);
  const { data: eligibilityResponse } = useReviewEligibility(productId);
  const { markHelpful } = useReviewMutations();

  const reviews = reviewsResponse?.data || [];
  const stats = statsResponse?.data;
  const canReview = eligibilityResponse?.data?.canReview;

  if (isLoadingReviews) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Stats Summary */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">{stats?.averageRating?.toFixed(1) || '0.0'}</div>
              <div className="flex flex-col">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("h-5 w-5 fill-current", i >= Math.round(stats?.averageRating || 0) && "text-gray-300")} />
                  ))}
                </div>
                <span className="text-muted-foreground text-sm">{stats?.totalReviews || 0} reviews</span>
              </div>
            </div>
            
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats?.ratingCounts?.[rating] || 0;
                const percentage = stats?.totalReviews ? (count / stats.totalReviews) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-2 text-sm">
                    <span className="w-3">{rating}</span>
                    <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-yellow-400" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="w-8 text-right text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Card */}
        <Card className="w-full md:w-[300px]">
          <CardHeader>
            <CardTitle className="text-lg">Review this product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-muted-foreground">Share your thoughts with other customers</p>
            <Button className="w-full" variant="outline" disabled={!canReview}>
              Write a Review
            </Button>
            {!canReview && (
              <p className="text-xs text-muted-foreground italic text-center">
                You must purchase this product to leave a review.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Reviews</h3>
        {reviews.length === 0 ? (
          <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="grid gap-6">
            {reviews.map((review: any) => (
              <div key={review.id} className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={review.user?.image} />
                    <AvatarFallback>{review.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{review.user?.name || 'Anonymous'}</h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("h-3 w-3 fill-current", i >= review.rating && "text-gray-300")} />
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="font-semibold">{review.title}</h5>
                  <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <button 
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => markHelpful.mutate(review.id)}
                  >
                    <ThumbsUp className="h-3 w-3" />
                    Helpful ({review.helpfulCount || 0})
                  </button>
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <MessageSquare className="h-3 w-3" />
                    Comment
                  </button>
                </div>
                <Separator />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
