import restApiClient from '@/lib/api-client';
import { API_ROUTES } from '@/lib/routes/api-routes';
import { ServiceResponse, Store } from '@/types';
import { BaseService } from './base.service';

export class StoreService extends BaseService {
  async getAllStores(filters: any = {}): Promise<ServiceResponse<Store[]>> {
    const response = await restApiClient.get<Store[]>(API_ROUTES.stores.base, filters);
    return this.formatResponse(response);
  }

  async getStoreById(id: string): Promise<ServiceResponse<Store>> {
    const response = await restApiClient.get<Store>(API_ROUTES.stores.details(id));
    return this.formatResponse(response);
  }

  async getStoreBySlug(slug: string): Promise<ServiceResponse<Store>> {
    const response = await restApiClient.get<Store>(API_ROUTES.stores.bySlug(slug));
    return this.formatResponse(response);
  }

  async getMyStores(): Promise<ServiceResponse<Store[]>> {
    const response = await restApiClient.get<Store[]>(API_ROUTES.stores.my);
    return this.formatResponse(response);
  }

  async createStore(data: any): Promise<ServiceResponse<Store>> {
    const response = await restApiClient.post<Store>(API_ROUTES.stores.base, data);
    return this.formatResponse(response);
  }

  async updateStore(id: string, data: any): Promise<ServiceResponse<Store>> {
    const response = await restApiClient.patch<Store>(API_ROUTES.stores.details(id), data);
    return this.formatResponse(response);
  }

  async deleteStore(id: string): Promise<ServiceResponse<null>> {
    const response = await restApiClient.delete<null>(API_ROUTES.stores.details(id));
    return this.formatResponse(response);
  }

  async getSubscription(id: string): Promise<ServiceResponse<any>> {
    const response = await restApiClient.get<any>(API_ROUTES.stores.subscription(id));
    return this.formatResponse(response);
  }

  async upgradeSubscription(id: string, planId: string): Promise<ServiceResponse<any>> {
    const response = await restApiClient.post<any>(API_ROUTES.stores.upgradeSubscription(id), { planId });
    return this.formatResponse(response);
  }

  async cancelSubscription(id: string): Promise<ServiceResponse<any>> {
    const response = await restApiClient.post<any>(API_ROUTES.stores.cancelSubscription(id));
    return this.formatResponse(response);
  }

  async limits(id: string): Promise<ServiceResponse<any>> {

    const response = await restApiClient.get<any>(API_ROUTES.stores.limits(id));
    return this.formatResponse(response);
  }
}

export const storeService = new StoreService();
