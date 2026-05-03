import restApiClient from '@/lib/api-client';
import { API_ROUTES } from '@/lib/routes/api-routes';
import { BaseService } from './base.service';
import { ServiceResponse } from '@/types';

export class CategoryService extends BaseService {
  async getAllCategories(): Promise<ServiceResponse<any[]>> {
    const response = await restApiClient.get<any[]>(API_ROUTES.categories.base);
    return this.formatResponse(response);
  }

  async getCategoryBySlug(slug: string): Promise<ServiceResponse<any>> {
    const response = await restApiClient.get(API_ROUTES.categories.bySlug(slug));
    return this.formatResponse(response);
  }
}

export const categoryService = new CategoryService();
