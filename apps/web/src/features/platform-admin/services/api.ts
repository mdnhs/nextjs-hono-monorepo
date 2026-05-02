import { get, post, patch, del } from '@/lib/api-client';
import { API_ROUTES } from '@/lib/routes/api-routes';
import type {
  PlatformDashboardApiResponse,
  PlatformStoresApiResponse,
  PlatformUsersApiResponse,
  PlatformSubscriptionsApiResponse,
  PlatformPlansApiResponse,
  StoreApprovalData,
  SubscriptionUpdateData,
  PlanCreateData,
  PlanUpdateData,
} from '../types';

type Params = Record<string, string | string[]>;

const toParams = (p?: Record<string, string | number | undefined>): Params | undefined => {
  if (!p) return undefined;
  const out: Params = {};
  for (const [k, v] of Object.entries(p)) {
    if (v !== undefined) out[k] = String(v);
  }
  return Object.keys(out).length ? out : undefined;
};

export const platformAdminApi = {
  getDashboard: () => get<PlatformDashboardApiResponse>(API_ROUTES.admin.dashboard),

  getStores: (params?: { status?: string; page?: number; limit?: number }) =>
    get<PlatformStoresApiResponse>(API_ROUTES.admin.stores, toParams(params)),

  getPendingStores: (params?: { page?: number; limit?: number }) =>
    get<PlatformStoresApiResponse>(API_ROUTES.admin.pendingStores, toParams(params)),

  approveStore: (id: string, data?: StoreApprovalData) =>
    post(API_ROUTES.admin.approveStore(id), data),

  rejectStore: (id: string) =>
    post(API_ROUTES.admin.rejectStore(id)),

  suspendStore: (id: string) =>
    post(API_ROUTES.admin.suspendStore(id)),

  getUsers: (params?: { role?: string; page?: number; limit?: number }) =>
    get<PlatformUsersApiResponse>(API_ROUTES.admin.users, toParams(params)),

  getUserDetails: (id: string) =>
    get(API_ROUTES.admin.userDetails(id)),

  getSubscriptions: (params?: { status?: string; page?: number; limit?: number }) =>
    get<PlatformSubscriptionsApiResponse>(API_ROUTES.admin.subscriptions, toParams(params)),

  cancelSubscription: (id: string) =>
    post(API_ROUTES.admin.cancelSubscription(id)),

  updateSubscription: (id: string, data: SubscriptionUpdateData) =>
    patch(API_ROUTES.admin.updateSubscription(id), data),

  getOrders: (params?: { status?: string; page?: number; limit?: number }) =>
    get<any>(API_ROUTES.admin.orders, toParams(params)),

  getPlans: () =>
    get<PlatformPlansApiResponse>(API_ROUTES.admin.plans),

  createPlan: (data: PlanCreateData) =>
    post(API_ROUTES.admin.createPlan, data),

  updatePlan: (id: string, data: PlanUpdateData) =>
    patch(API_ROUTES.admin.updatePlan(id), data),

  deletePlan: (id: string) =>
    del(API_ROUTES.admin.deletePlan(id)),
};
