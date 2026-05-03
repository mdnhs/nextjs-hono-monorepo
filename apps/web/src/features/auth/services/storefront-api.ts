import { post, get } from '@/lib/api-client';
import { API_ROUTES } from '@/lib/routes/api-routes';
import type { LoginPayload, LoginApiResponse, AuthUser, RegisterPayload } from '../types';

export const storefrontAuthApi = {
  login: (data: LoginPayload) => post<LoginApiResponse>(API_ROUTES.storefrontAuth.login, data),
  register: (data: RegisterPayload) => post<LoginApiResponse>(API_ROUTES.storefrontAuth.register, data),
  profile: () => get<AuthUser>(API_ROUTES.storefrontAuth.profile),
  logout: () => post(API_ROUTES.storefrontAuth.logout),
};
