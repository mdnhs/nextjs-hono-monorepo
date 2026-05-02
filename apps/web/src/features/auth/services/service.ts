import { APP_ROUTES } from '@/lib/routes/app-routes';
import { authApi } from './api';
import type { LoginPayload, LoginApiResponse, AuthUser, RegisterPayload, UserRole } from '../types';

export interface AuthServiceResponse<T> {
  error: boolean;
  message: string;
  data: T | null;
}

const ROLE_REDIRECT: Record<UserRole, string> = {
  ADMIN: APP_ROUTES.admin.index,
  SELLER: APP_ROUTES.seller.index,
  BUYER: APP_ROUTES.dashboard.index,
};

export const authService = {
  async login(payload: LoginPayload): Promise<AuthServiceResponse<LoginApiResponse>> {
    const response = await authApi.login(payload);

    if (response.error || response.status >= 400) {
      return {
        error: true,
        message: response.data?.message ?? response.error?.message ?? 'Login failed',
        data: null,
      };
    }

    // Backend returns { message, user, token } directly (not wrapped in data)
    const raw = response.data as unknown as LoginApiResponse;
    return { error: false, message: raw.message, data: raw };
  },

  async register(payload: RegisterPayload): Promise<AuthServiceResponse<LoginApiResponse>> {
    const response = await authApi.register(payload);

    if (response.error || response.status >= 400) {
      return {
        error: true,
        message: response.data?.message ?? response.error?.message ?? 'Registration failed',
        data: null,
      };
    }

    const raw = response.data as unknown as LoginApiResponse;
    return { error: false, message: raw.message, data: raw };
  },

  async getProfile(): Promise<AuthServiceResponse<AuthUser>> {
    const response = await authApi.profile();

    if (response.error || response.status >= 400) {
      return {
        error: true,
        message: response.data?.message ?? 'Failed to fetch profile',
        data: null,
      };
    }

    const raw = response.data as unknown as AuthUser;
    return { error: false, message: 'OK', data: raw };
  },

  getRedirectPath(role: UserRole): string {
    return ROLE_REDIRECT[role] ?? APP_ROUTES.dashboard.index;
  },
};
