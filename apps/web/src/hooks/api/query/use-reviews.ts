import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/services/review.service';
import { toast } from 'sonner';

export const useProductReviews = (productId: string, params?: any) => {
  return useQuery({
    queryKey: ['reviews', 'product', productId, params],
    queryFn: () => reviewService.getProductReviews(productId, params),
    enabled: !!productId,
  });
};

export const useProductStats = (productId: string) => {
  return useQuery({
    queryKey: ['reviews', 'stats', productId],
    queryFn: () => reviewService.getProductStats(productId),
    enabled: !!productId,
  });
};

export const useMyReviews = () => {
  return useQuery({
    queryKey: ['reviews', 'my'],
    queryFn: () => reviewService.getMyReviews(),
  });
};

export const useReviewEligibility = (productId: string) => {
  return useQuery({
    queryKey: ['reviews', 'can-review', productId],
    queryFn: () => reviewService.checkCanReview(productId),
    enabled: !!productId,
  });
};

export const useReviewMutations = () => {
  const queryClient = useQueryClient();

  const createReview = useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: any }) => reviewService.createReview(productId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'product', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'stats', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'can-review', variables.productId] });
      toast.success('Review submitted successfully');
    },
  });

  const updateReview = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => reviewService.updateReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Review updated successfully');
    },
  });

  const deleteReview = useMutation({
    mutationFn: (id: string) => reviewService.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Review deleted');
    },
  });

  const markHelpful = useMutation({
    mutationFn: (id: string) => reviewService.markHelpful(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });

  return {
    createReview,
    updateReview,
    deleteReview,
    markHelpful,
  };
};
