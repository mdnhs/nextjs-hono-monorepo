'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platformAdminService } from '../../../services/service';
import type { SubscriptionUpdateData } from '../../../types';

export const usePlatformSubscriptions = (params?: { status?: string; page?: number; limit?: number }) =>
  useQuery({
    queryKey: ['platform-admin', 'subscriptions', params],
    queryFn: () => platformAdminService.getSubscriptions(params),
  });

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => platformAdminService.cancelSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-admin', 'subscriptions'] });
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubscriptionUpdateData }) =>
      platformAdminService.updateSubscription(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-admin', 'subscriptions'] });
    },
  });
};
