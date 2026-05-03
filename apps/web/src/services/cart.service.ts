import restApiClient from '@/lib/api-client';
import { API_ROUTES } from '@/lib/routes/api-routes';
import { BaseService } from './base.service';
import { ServiceResponse } from '@/types';

export class CartService extends BaseService {
  async getCart(): Promise<ServiceResponse<any>> {
    const response = await restApiClient.get(API_ROUTES.cart.base);
    return this.formatResponse(response);
  }

  async clearCart(): Promise<ServiceResponse<any>> {
    const response = await restApiClient.delete(API_ROUTES.cart.base);
    return this.formatResponse(response);
  }

  async addItem(data: { productId: string; variantId: string; quantity: number }): Promise<ServiceResponse<any>> {
    const response = await restApiClient.post(API_ROUTES.cart.items, data);
    return this.formatResponse(response);
  }

  async updateItem(itemId: string, quantity: number): Promise<ServiceResponse<any>> {
    const response = await restApiClient.patch(API_ROUTES.cart.item(itemId), { quantity });
    return this.formatResponse(response);
  }

  async removeItem(itemId: string): Promise<ServiceResponse<any>> {
    const response = await restApiClient.delete(API_ROUTES.cart.item(itemId));
    return this.formatResponse(response);
  }

  async checkout(data: { shippingAddress: any; discountCode: string }): Promise<ServiceResponse<any>> {
    const response = await restApiClient.post(API_ROUTES.cart.checkout, data);
    return this.formatResponse(response);
  }
}

export const cartService = new CartService();
