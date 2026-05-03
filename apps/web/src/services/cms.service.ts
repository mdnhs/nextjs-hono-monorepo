import { BaseService } from './base.service';
import restApiClient from '@/lib/api-client';

export class CMSService extends BaseService {
  async getTheme(storeId: string) {
    const response = await restApiClient.get(`/api/v1/cms/${storeId}/theme`);
    return this.formatResponse(response);
  }

  async updateTheme(storeId: string, data: any) {
    const response = await restApiClient.patch(`/api/v1/cms/${storeId}/theme`, data);
    return this.formatResponse(response);
  }

  async getPages(storeId: string) {
    const response = await restApiClient.get(`/api/v1/cms/${storeId}/pages`);
    return this.formatResponse(response);
  }

  async createPage(storeId: string, data: any) {
    const response = await restApiClient.post(`/api/v1/cms/${storeId}/pages`, data);
    return this.formatResponse(response);
  }

  async getNavigation(storeId: string) {
    const response = await restApiClient.get(`/api/v1/cms/${storeId}/navigation`);
    return this.formatResponse(response);
  }
}

export const cmsService = new CMSService();
