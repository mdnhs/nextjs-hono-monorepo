import restApiClient from '@/lib/api-client';
import { API_ROUTES } from '@/lib/routes/api-routes';
import { Order, ServiceResponse, ShippingAddress } from '@/types';
import { BaseService } from './base.service';

export interface CreateOrderInput {
  shippingAddress: ShippingAddress;
  discountCode?: string;
  locationId?: string;
}

export class OrderService extends BaseService {
  async createOrder(data: CreateOrderInput): Promise<ServiceResponse<Order>> {
    const response = await restApiClient.post<Order>(API_ROUTES.orders.base, data);
    return this.formatResponse(response);
  }

  async getMyOrders(filters: any = {}): Promise<ServiceResponse<Order[]>> {
    const response = await restApiClient.get<Order[]>(API_ROUTES.orders.base, filters);
    return this.formatResponse(response);
  }

  async getOrderById(id: string): Promise<ServiceResponse<Order>> {
    const response = await restApiClient.get<Order>(API_ROUTES.orders.details(id));
    return this.formatResponse(response);
  }

  async updateStatus(id: string, status: string): Promise<ServiceResponse<Order>> {
    const response = await restApiClient.patch<Order>(API_ROUTES.orders.status(id), { status });
    return this.formatResponse(response);
  }

  async getSellerOrders(filters: any = {}): Promise<ServiceResponse<Order[]>> {
    const response = await restApiClient.get<Order[]>(API_ROUTES.orders.seller, filters);
    return this.formatResponse(response);
  }

  async getStoreOrders(storeId: string, filters: any = {}): Promise<ServiceResponse<Order[]>> {
    const response = await restApiClient.get<Order[]>(API_ROUTES.orders.store(storeId), filters);
    return this.formatResponse(response);
  }

  async getAllOrdersAdmin(filters: any = {}): Promise<ServiceResponse<Order[]>> {
    const response = await restApiClient.get<Order[]>(API_ROUTES.orders.all, filters);
    return this.formatResponse(response);
  }
}

export const orderService = new OrderService();
