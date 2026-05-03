import restApiClient from '@/lib/api-client';
import { API_ROUTES } from '@/lib/routes/api-routes';
import { BaseService } from './base.service';
import { ServiceResponse } from '@/types';

export class StaffService extends BaseService {
  async listStaff(storeId: string): Promise<ServiceResponse<any[]>> {
    const response = await restApiClient.get<any[]>(API_ROUTES.staff.list(storeId));
    return this.formatResponse(response);
  }

  async inviteStaff(storeId: string, data: { userId: string; role: string }): Promise<ServiceResponse<any>> {
    const response = await restApiClient.post(API_ROUTES.staff.invite(storeId), data);
    return this.formatResponse(response);
  }
}

export const staffService = new StaffService();
