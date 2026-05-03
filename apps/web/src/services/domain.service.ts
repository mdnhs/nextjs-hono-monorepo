import restApiClient from '@/lib/api-client';
import { API_ROUTES } from '@/lib/routes/api-routes';
import { BaseService } from './base.service';
import { ServiceResponse } from '@/types';

export class DomainService extends BaseService {
  async checkDomain(domain: string): Promise<ServiceResponse<any>> {
    const response = await restApiClient.get(API_ROUTES.domains.check, { domain });
    return this.formatResponse(response);
  }

  async requestVerification(storeId: string, hostname: string): Promise<ServiceResponse<any>> {
    const response = await restApiClient.post(API_ROUTES.domains.request(storeId), { hostname });
    return this.formatResponse(response);
  }
}

export const domainService = new DomainService();
