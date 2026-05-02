'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platformAdminService } from '../../../services/service';
import type { PlanCreateData, PlanUpdateData } from '../../../types';

export const usePlatformPlans = () =>
  useQuery({
    queryKey: ['platform-admin', 'plans'],
    queryFn: () => platformAdminService.getPlans(),
  });

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PlanCreateData) => platformAdminService.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-admin', 'plans'] });
    },
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PlanUpdateData }) =>
      platformAdminService.updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-admin', 'plans'] });
    },
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => platformAdminService.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-admin', 'plans'] });
    },
  });
};
