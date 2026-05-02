import { get } from '@/lib/api-client';
import type { PlatformDashboardApiResponse } from '../types';
import { API_ROUTES } from '@/lib/routes/api-routes';

export const platformAdminApi = {
  getDashboard: () => get<PlatformDashboardApiResponse>(API_ROUTES.admin.dashboard),
};
