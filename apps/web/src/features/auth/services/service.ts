import { APP_ROUTES } from '@/lib/routes/app-routes';
import { authApi } from './api';
import type { LoginPayload, LoginApiResponse, AuthUser, RegisterPayload, UserRole } from '../types';

export interface AuthServiceResponse<T> {
  error: boolean;
  message: string;
  data: T | null;
}

const ROLE_REDIRECT: Record<UserRole, string> = {
  PLATFORM_ADMIN: APP_ROUTES.admin.index,
  SELLER: APP_ROUTES.seller.index,
  STORE_ADMIN: APP_ROUTES.dashboard.index,
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

    const raw = response.data?.data as LoginApiResponse;
    return { error: false, message: response.data?.message ?? 'Login successful', data: raw };
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

    const raw = response.data?.data as LoginApiResponse;
    return { error: false, message: response.data?.message ?? 'Registered successfully', data: raw };
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

    const raw = response.data?.data as AuthUser;
    return { error: false, message: 'OK', data: raw };
  },

  getRedirectPath(role: UserRole): string {
    return ROLE_REDIRECT[role] ?? APP_ROUTES.dashboard.index;
  },

  async logout(): Promise<AuthServiceResponse<null>> {
    const response = await authApi.logout();
    if (response.error || response.status >= 400) {
      return {
        error: true,
        message: response.data?.message ?? 'Logout failed',
        data: null,
      };
    }
    return { error: false, message: response.data?.message ?? 'Logged out', data: null };
  },
};
