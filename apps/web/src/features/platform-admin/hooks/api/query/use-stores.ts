'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platformAdminService } from '../../../services/service';
import type { StoreApprovalData } from '../../../types';

export const usePlatformStores = (params?: { status?: string; page?: number; limit?: number }) =>
  useQuery({
    queryKey: ['platform-admin', 'stores', params],
    queryFn: () => platformAdminService.getStores(params),
  });

export const useApproveStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: StoreApprovalData }) =>
      platformAdminService.approveStore(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-admin', 'stores'] });
      queryClient.invalidateQueries({ queryKey: ['platform-admin', 'dashboard'] });
    },
  });
};

export const useRejectStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => platformAdminService.rejectStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-admin', 'stores'] });
      queryClient.invalidateQueries({ queryKey: ['platform-admin', 'dashboard'] });
    },
  });
};

export const useSuspendStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => platformAdminService.suspendStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-admin', 'stores'] });
      queryClient.invalidateQueries({ queryKey: ['platform-admin', 'dashboard'] });
    },
  });
};
