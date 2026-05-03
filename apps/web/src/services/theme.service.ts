import restApiClient from '@/lib/api-client';
import { API_ROUTES } from '@/lib/routes/api-routes';
import { BaseService } from './base.service';
import { ServiceResponse } from '@/types';

export class ThemeService extends BaseService {
  async getPublishedTheme(): Promise<ServiceResponse<any>> {
    const response = await restApiClient.get(API_ROUTES.themes.published);
    return this.formatResponse(response);
  }

  async getStoreThemes(storeId: string): Promise<ServiceResponse<any[]>> {
    const response = await restApiClient.get<any[]>(API_ROUTES.themes.store(storeId));
    return this.formatResponse(response);
  }

  async createTheme(storeId: string, data: { name: string; settings: any }): Promise<ServiceResponse<any>> {
    const response = await restApiClient.post(API_ROUTES.themes.store(storeId), data);
    return this.formatResponse(response);
  }

  async getThemeDetails(id: string): Promise<ServiceResponse<any>> {
    const response = await restApiClient.get(API_ROUTES.themes.details(id));
    return this.formatResponse(response);
  }

  async publishTheme(id: string): Promise<ServiceResponse<any>> {
    const response = await restApiClient.post(API_ROUTES.themes.publish(id));
    return this.formatResponse(response);
  }
}

export const themeService = new ThemeService();
