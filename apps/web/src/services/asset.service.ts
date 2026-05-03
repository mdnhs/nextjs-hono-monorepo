import restApiClient from '@/lib/api-client';
import { API_ROUTES } from '@/lib/routes/api-routes';
import { BaseService } from './base.service';
import { ServiceResponse } from '@/types';

export class AssetService extends BaseService {
  async listAssets(storeId: string): Promise<ServiceResponse<any[]>> {
    const response = await restApiClient.get<any[]>(API_ROUTES.assets.list(storeId));
    return this.formatResponse(response);
  }

  async uploadAsset(storeId: string, file: File): Promise<ServiceResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await restApiClient.post(API_ROUTES.assets.upload(storeId), formData);
    return this.formatResponse(response);
  }
}

export const assetService = new AssetService();
