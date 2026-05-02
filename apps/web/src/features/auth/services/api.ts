import { post, get } from '@/lib/api-client';
import { API_ROUTES } from '@/lib/routes/api-routes';
import type { LoginPayload, LoginApiResponse, AuthUser, RegisterPayload } from '../types';

export const authApi = {
  login: (data: LoginPayload) => post<LoginApiResponse>(API_ROUTES.auth.login, data),
  register: (data: RegisterPayload) => post<LoginApiResponse>(API_ROUTES.auth.register, data),
  profile: () => get<AuthUser>(API_ROUTES.auth.profile),
  logout: () => post(API_ROUTES.auth.logout),
};
