import restApiClient from '@/lib/api-client';
import { API_ROUTES } from '@/lib/routes/api-routes';
import { ServiceResponse, User } from '@/types';
import { BaseService } from './base.service';

export class AuthService extends BaseService {
  async login(data: any): Promise<ServiceResponse<User>> {
    const response = await restApiClient.post<User>(API_ROUTES.auth.login, data);
    return this.formatResponse(response);
  }

  async register(data: any): Promise<ServiceResponse<User>> {
    const response = await restApiClient.post<User>(API_ROUTES.auth.register, data);
    return this.formatResponse(response);
  }

  async logout(): Promise<ServiceResponse<null>> {
    const response = await restApiClient.post<null>(API_ROUTES.auth.logout);
    return this.formatResponse(response);
  }

  async getProfile(): Promise<ServiceResponse<User>> {
    const response = await restApiClient.get<User>(API_ROUTES.auth.profile);
    return this.formatResponse(response);
  }
}

export const authService = new AuthService();
