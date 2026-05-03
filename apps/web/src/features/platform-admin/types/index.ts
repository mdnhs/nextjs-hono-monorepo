export interface PlatformDashboardApiResponse {
  stores: { total: number; pending: number; approved: number };
  users: { total: number; sellers: number };
  products: number;
  orders: number;
  revenue: number;
}

export interface PlatformStore {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  customDomain: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner?: { id: string; name: string; email: string };
  subscriptions?: PlatformSubscription[];
  _count?: { products: number };
}

export interface PlatformUser {
  id: string;
  email: string;
  name: string;
  role: 'PLATFORM_ADMIN' | 'SELLER' | 'STORE_ADMIN' | 'BUYER';
  createdAt: string;
  _count?: { stores: number };
  stores?: { id: string }[];
}

export interface PlatformSubscription {
  id: string;
  storeId: string;
  planId: string;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIAL' | 'PAST_DUE';
  billingCycle: 'MONTHLY' | 'YEARLY';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
  expiresAt: string | null;
  store: { id: string; name: string; slug: string };
  plan: { id: string; name: string; priceMonthly: string | number; priceYearly?: string | number };
}

export interface PlatformPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceMonthly: string | number;
  priceYearly: string | number;
  trialDays: number;
  maxStores: number | null;
  maxProducts: number | null;
  maxOrders: number | null;
  maxStorageMB: number | null;
  customDomain: boolean;
  analytics: boolean;
  prioritySupport: boolean;
  removeBranding: boolean;
  apiAccess: boolean;
  features: Record<string, unknown>;
  status: 'ACTIVE' | 'HIDDEN';
  createdAt: string;
  updatedAt: string;
}

export type PlatformStoresApiResponse = PlatformStore[];
export type PlatformUsersApiResponse = PlatformUser[];
export type PlatformSubscriptionsApiResponse = PlatformSubscription[];
export type PlatformPlansApiResponse = PlatformPlan[];

export interface StoreApprovalData {
  planId?: string;
}

export interface SubscriptionUpdateData {
  planId: string;
}

export interface PlanCreateData {
  name: string;
  slug: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  trialDays?: number;
  maxStores?: number | null;
  maxProducts?: number | null;
  maxOrders?: number | null;
  maxStorageMB?: number | null;
  customDomain?: boolean;
  analytics?: boolean;
  prioritySupport?: boolean;
  removeBranding?: boolean;
  apiAccess?: boolean;
}

export interface PlanUpdateData extends Partial<PlanCreateData> {
  status?: 'ACTIVE' | 'HIDDEN';
}
