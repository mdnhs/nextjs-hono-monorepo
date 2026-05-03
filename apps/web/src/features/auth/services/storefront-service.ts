import { storefrontAuthApi } from './storefront-api';
import type { LoginPayload, LoginApiResponse, AuthUser, RegisterPayload } from '../types';

export interface AuthServiceResponse<T> {
  data: T | null;
  error: boolean;
  message: string;
}

export const storefrontAuthService = {
  async login(data: LoginPayload): Promise<AuthServiceResponse<LoginApiResponse>> {
    const response = await storefrontAuthApi.login(data);
    if (!response.data || response.statusCode >= 400) {
      return {
        error: true,
        message: response.data?.message ?? 'Login failed',
        data: null,
      };
    }
    return { error: false, message: response.data.message, data: response.data };
  },

  async register(data: RegisterPayload): Promise<AuthServiceResponse<LoginApiResponse>> {
    const response = await storefrontAuthApi.register(data);
    if (!response.data || response.statusCode >= 400) {
      return {
        error: true,
        message: response.data?.message ?? 'Registration failed',
        data: null,
      };
    }
    return { error: false, message: response.data.message, data: response.data };
  },

  async getProfile(): Promise<AuthServiceResponse<AuthUser>> {
    const response = await storefrontAuthApi.profile();
    if (!response.data || response.statusCode >= 400) {
      return {
        error: true,
        message: response.data?.message ?? 'Failed to fetch profile',
        data: null,
      };
    }
    return { error: false, message: 'Profile fetched', data: response.data };
  },

  async logout(): Promise<AuthServiceResponse<null>> {
    const response = await storefrontAuthApi.logout();
    if (response.statusCode >= 400) {
      return {
        error: true,
        message: response.data?.message ?? 'Logout failed',
        data: null,
      };
    }
    return { error: false, message: response.data?.message ?? 'Logged out', data: null };
  },
};
