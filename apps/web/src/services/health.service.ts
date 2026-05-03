import restApiClient from '@/lib/api-client';
import { API_ROUTES } from '@/lib/routes/api-routes';
import { BaseService } from './base.service';
import { ServiceResponse } from '@/types';

export class HealthService extends BaseService {
  async checkHealth(): Promise<ServiceResponse<any>> {
    const response = await restApiClient.get(API_ROUTES.health);
    return this.formatResponse(response);
  }
}

export const healthService = new HealthService();
