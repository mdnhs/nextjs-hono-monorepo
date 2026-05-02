'use client';

import { useQuery } from '@tanstack/react-query';
import { platformAdminService } from '../../../services/service';

export const usePlatformOrders = (params?: { status?: string; page?: number; limit?: number }) =>
  useQuery({
    queryKey: ['platform-admin', 'orders', params],
    queryFn: () => platformAdminService.getOrders(params),
  });
