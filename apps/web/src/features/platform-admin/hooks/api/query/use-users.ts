'use client';

import { useQuery } from '@tanstack/react-query';
import { platformAdminService } from '../../../services/service';

export const usePlatformUsers = (params?: { role?: string; page?: number; limit?: number }) =>
  useQuery({
    queryKey: ['platform-admin', 'users', params],
    queryFn: () => platformAdminService.getUsers(params),
  });

export const usePlatformUserDetails = (id: string) =>
  useQuery({
    queryKey: ['platform-admin', 'users', id],
    queryFn: () => platformAdminService.getUserDetails(id),
    enabled: !!id,
  });
