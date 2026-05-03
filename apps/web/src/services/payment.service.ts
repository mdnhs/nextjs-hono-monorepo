import restApiClient from '@/lib/api-client';
import { API_ROUTES } from '@/lib/routes/api-routes';
import { ServiceResponse } from '@/types';
import { BaseService } from './base.service';

export interface InitiatePaymentInput {
  orderId: string;
  provider: 'STRIPE' | 'SSLCOMMERZ' | 'MANUAL';
  successUrl: string;
  cancelUrl: string;
  customerEmail: string;
}

export interface RefundPaymentInput {
  paymentId: string;
  amountCents: number;
  reason: string;
}

export class PaymentService extends BaseService {
  async initiate(data: InitiatePaymentInput): Promise<ServiceResponse<any>> {
    const response = await restApiClient.post<any>(API_ROUTES.payments.initiate, data);
    return this.formatResponse(response);
  }

  async refund(data: RefundPaymentInput): Promise<ServiceResponse<any>> {
    const response = await restApiClient.post<any>(API_ROUTES.payments.refund, data);
    return this.formatResponse(response);
  }
}

export const paymentService = new PaymentService();
