import restApiClient from '@/lib/api-client';
import { API_ROUTES } from '@/lib/routes/api-routes';
import { ServiceResponse } from '@/types';
import { BaseService } from './base.service';

export interface Location {
  id: string;
  name: string;
  address: string | null;
  isDefault: boolean;
  isActive: boolean;
  storeId: string;
}

export interface InventoryLevel {
  variantId: string;
  locationId: string;
  available: number;
  reserved: number;
  onHand: number;
}

export interface AdjustInventoryInput {
  variantId: string;
  locationId: string;
  delta: number;
  reason: string;
}

export class InventoryService extends BaseService {
  async getLocations(): Promise<ServiceResponse<Location[]>> {
    const response = await restApiClient.get<Location[]>(API_ROUTES.inventory.locations);
    return this.formatResponse(response);
  }

  async createLocation(data: Partial<Location>): Promise<ServiceResponse<Location>> {
    const response = await restApiClient.post<Location>(API_ROUTES.inventory.locations, data);
    return this.formatResponse(response);
  }

  async getLevels(variantId: string): Promise<ServiceResponse<any>> {
    const response = await restApiClient.get<any>(API_ROUTES.inventory.levels, { variantId });
    return this.formatResponse(response);
  }

  async adjust(data: AdjustInventoryInput): Promise<ServiceResponse<any>> {
    const response = await restApiClient.post<any>(API_ROUTES.inventory.adjust, data);
    return this.formatResponse(response);
  }
}

export const inventoryService = new InventoryService();
