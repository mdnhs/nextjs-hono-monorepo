import restApiClient from '@/lib/api-client';
import { API_ROUTES } from '@/lib/routes/api-routes';
import { BaseService } from './base.service';
import { ServiceResponse } from '@/types';

export class ReviewService extends BaseService {
  async createReview(productId: string, data: any): Promise<ServiceResponse<any>> {
    const response = await restApiClient.post(API_ROUTES.reviews.base(productId), data);
    return this.formatResponse(response);
  }

  async updateReview(id: string, data: any): Promise<ServiceResponse<any>> {
    const response = await restApiClient.patch(API_ROUTES.reviews.details(id), data);
    return this.formatResponse(response);
  }

  async deleteReview(id: string): Promise<ServiceResponse<any>> {
    const response = await restApiClient.delete(API_ROUTES.reviews.details(id));
    return this.formatResponse(response);
  }

  async getProductReviews(productId: string, params?: any): Promise<ServiceResponse<any[]>> {
    const response = await restApiClient.get<any[]>(API_ROUTES.reviews.product(productId), params);
    return this.formatResponse(response);
  }

  async getProductStats(productId: string): Promise<ServiceResponse<any>> {
    const response = await restApiClient.get(API_ROUTES.reviews.stats(productId));
    return this.formatResponse(response);
  }

  async getMyReviews(): Promise<ServiceResponse<any[]>> {
    const response = await restApiClient.get<any[]>(API_ROUTES.reviews.my);
    return this.formatResponse(response);
  }

  async markHelpful(id: string): Promise<ServiceResponse<any>> {
    const response = await restApiClient.patch(API_ROUTES.reviews.helpful(id));
    return this.formatResponse(response);
  }

  async checkCanReview(productId: string): Promise<ServiceResponse<any>> {
    const response = await restApiClient.get(API_ROUTES.reviews.canReview(productId));
    return this.formatResponse(response);
  }
}

export const reviewService = new ReviewService();
