import type { ServiceResponse } from '@/types';
import { platformAdminApi } from './api';
import type { PlatformDashboard, PlatformDashboardApiResponse } from '../types';

export const platformAdminService = {
  async getDashboard(): Promise<ServiceResponse<PlatformDashboard>> {
    const response = await platformAdminApi.getDashboard();
    if (response.error?.message || response.data?.error) {
      return { error: true, message: response.data?.message ?? response.error?.message ?? 'Failed to fetch dashboard', data: null };
    }
    return { error: false, message: 'Success', data: response.data!.data as PlatformDashboardApiResponse };
  },
};
