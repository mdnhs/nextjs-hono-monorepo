import { useQuery } from '@tanstack/react-query';
import { platformAdminService } from '../../../services/service';

export const usePlatformDashboard = () =>
  useQuery({
    queryKey: ['platform-admin', 'dashboard'],
    queryFn: () => platformAdminService.getDashboard(),
  });
