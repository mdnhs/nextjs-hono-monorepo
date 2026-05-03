import restApiClient from '@/lib/api-client';
import { API_ROUTES } from '@/lib/routes/api-routes';
import { Product, ServiceResponse } from '@/types';
import { BaseService } from './base.service';

export interface ProductFilters {
  storeId?: string;
  categoryId?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export class ProductService extends BaseService {
  async getAllProducts(filters: ProductFilters = {}): Promise<ServiceResponse<Product[]>> {
    const params: Record<string, any> = { ...filters };
    const response = await restApiClient.get<Product[]>(API_ROUTES.products.base, params);
    return this.formatResponse(response);
  }

  async getProductById(id: string): Promise<ServiceResponse<Product>> {
    const response = await restApiClient.get<Product>(API_ROUTES.products.details(id));
    return this.formatResponse(response);
  }

  async getProductBySku(sku: string): Promise<ServiceResponse<Product>> {
    const response = await restApiClient.get<Product>(API_ROUTES.products.bySku(sku));
    return this.formatResponse(response);
  }

  async getSellerProducts(): Promise<ServiceResponse<Product[]>> {
    const response = await restApiClient.get<Product[]>(API_ROUTES.products.my);
    return this.formatResponse(response);
  }

  async createProduct(data: any): Promise<ServiceResponse<Product>> {
    const response = await restApiClient.post<Product>(API_ROUTES.products.base, data);
    return this.formatResponse(response);
  }

  async updateProduct(id: string, data: any): Promise<ServiceResponse<Product>> {
    const response = await restApiClient.patch<Product>(API_ROUTES.products.details(id), data);
    return this.formatResponse(response);
  }

  async deleteProduct(id: string): Promise<ServiceResponse<null>> {
    const response = await restApiClient.delete<null>(API_ROUTES.products.details(id));
    return this.formatResponse(response);
  }

  async updateInventory(id: string, quantity: number): Promise<ServiceResponse<Product>> {
    const response = await restApiClient.patch<Product>(API_ROUTES.products.inventory(id), { quantity });
    return this.formatResponse(response);
  }

  async toggleStatus(id: string): Promise<ServiceResponse<Product>> {
    const response = await restApiClient.patch<Product>(API_ROUTES.products.toggleStatus(id));
    return this.formatResponse(response);
  }

  async getStoreProducts(storeId: string, filters: any = {}): Promise<ServiceResponse<Product[]>> {
    const response = await restApiClient.get<Product[]>(API_ROUTES.stores.products(storeId), filters);
    return this.formatResponse(response);
  }
}

export const productService = new ProductService();
