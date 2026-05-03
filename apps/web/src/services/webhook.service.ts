import restApiClient from '@/lib/api-client';
import { API_ROUTES } from '@/lib/routes/api-routes';
import { ServiceResponse } from '@/types';
import { BaseService } from './base.service';

export interface Webhook {
  id: string;
  storeId: string;
  topic: string;
  url: string;
  secret: string;
  isActive: boolean;
  createdAt: string;
}

export class WebhookService extends BaseService {
  async getWebhooks(): Promise<ServiceResponse<Webhook[]>> {
    const response = await restApiClient.get<Webhook[]>(API_ROUTES.webhooks.base);
    return this.formatResponse(response);
  }

  async createWebhook(data: { topic: string; url: string }): Promise<ServiceResponse<Webhook>> {
    const response = await restApiClient.post<Webhook>(API_ROUTES.webhooks.base, data);
    return this.formatResponse(response);
  }

  async deleteWebhook(id: string): Promise<ServiceResponse<null>> {
    const response = await restApiClient.delete<null>(API_ROUTES.webhooks.details(id));
    return this.formatResponse(response);
  }
}

export const webhookService = new WebhookService();
