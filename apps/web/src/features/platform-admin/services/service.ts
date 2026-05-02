import type { ServiceResponse } from '@/types';
import { platformAdminApi } from './api';
import type { 
  PlatformDashboardApiResponse,
  PlatformStoresApiResponse,
  PlatformUsersApiResponse,
  PlatformSubscriptionsApiResponse,
  PlatformPlansApiResponse,
  StoreApprovalData,
  SubscriptionUpdateData,
  PlanCreateData,
  PlanUpdateData
} from '../types';

export const platformAdminService = {
  async getDashboard(): Promise<ServiceResponse<PlatformDashboardApiResponse>> {
    const response = await platformAdminApi.getDashboard();
    if (response.error?.message || response.data?.error) {
      return { error: true, message: response.data?.message ?? response.error?.message ?? 'Failed to fetch dashboard', data: null };
    }
    return { error: false, message: 'Success', data: response.data!.data };
  },

  async getStores(params?: { status?: string; page?: number; limit?: number }): Promise<ServiceResponse<PlatformStoresApiResponse>> {
    const response = await platformAdminApi.getStores(params);
    if (response.error?.message || response.data?.error) {
      return { error: true, message: response.data?.message ?? response.error?.message ?? 'Failed to fetch stores', data: null };
    }
    return { error: false, message: 'Success', data: response.data!.data };
  },

  async getPendingStores(params?: { page?: number; limit?: number }): Promise<ServiceResponse<PlatformStoresApiResponse>> {
    const response = await platformAdminApi.getPendingStores(params);
    if (response.error?.message || response.data?.error) {
      return { error: true, message: response.data?.message ?? response.error?.message ?? 'Failed to fetch pending stores', data: null };
    }
    return { error: false, message: 'Success', data: response.data!.data };
  },

  async approveStore(id: string, data?: StoreApprovalData): Promise<ServiceResponse<any>> {
    const response = await platformAdminApi.approveStore(id, data);
    if (response.error?.message || response.data?.error) {
      return { error: true, message: response.data?.message ?? response.error?.message ?? 'Failed to approve store', data: null };
    }
    return { error: false, message: 'Store approved successfully', data: response.data!.data };
  },

  async rejectStore(id: string): Promise<ServiceResponse<any>> {
    const response = await platformAdminApi.rejectStore(id);
    if (response.error?.message || response.data?.error) {
      return { error: true, message: response.data?.message ?? response.error?.message ?? 'Failed to reject store', data: null };
    }
    return { error: false, message: 'Store rejected successfully', data: response.data!.data };
  },

  async suspendStore(id: string): Promise<ServiceResponse<any>> {
    const response = await platformAdminApi.suspendStore(id);
    if (response.error?.message || response.data?.error) {
      return { error: true, message: response.data?.message ?? response.error?.message ?? 'Failed to suspend store', data: null };
    }
    return { error: false, message: 'Store suspended successfully', data: response.data!.data };
  },

  async getUsers(params?: { role?: string; page?: number; limit?: number }): Promise<ServiceResponse<PlatformUsersApiResponse>> {
    const response = await platformAdminApi.getUsers(params);
    if (response.error?.message || response.data?.error) {
      return { error: true, message: response.data?.message ?? response.error?.message ?? 'Failed to fetch users', data: null };
    }
    return { error: false, message: 'Success', data: response.data!.data };
  },

  async getUserDetails(id: string): Promise<ServiceResponse<any>> {
    const response = await platformAdminApi.getUserDetails(id);
    if (response.error?.message || response.data?.error) {
      return { error: true, message: response.data?.message ?? response.error?.message ?? 'Failed to fetch user details', data: null };
    }
    return { error: false, message: 'Success', data: response.data!.data };
  },

  async getSubscriptions(params?: { status?: string; page?: number; limit?: number }): Promise<ServiceResponse<PlatformSubscriptionsApiResponse>> {
    const response = await platformAdminApi.getSubscriptions(params);
    if (response.error?.message || response.data?.error) {
      return { error: true, message: response.data?.message ?? response.error?.message ?? 'Failed to fetch subscriptions', data: null };
    }
    return { error: false, message: 'Success', data: response.data!.data };
  },

  async cancelSubscription(id: string): Promise<ServiceResponse<any>> {
    const response = await platformAdminApi.cancelSubscription(id);
    if (response.error?.message || response.data?.error) {
      return { error: true, message: response.data?.message ?? response.error?.message ?? 'Failed to cancel subscription', data: null };
    }
    return { error: false, message: 'Subscription cancelled successfully', data: response.data!.data };
  },

  async updateSubscription(id: string, data: SubscriptionUpdateData): Promise<ServiceResponse<any>> {
    const response = await platformAdminApi.updateSubscription(id, data);
    if (response.error?.message || response.data?.error) {
      return { error: true, message: response.data?.message ?? response.error?.message ?? 'Failed to update subscription', data: null };
    }
    return { error: false, message: 'Subscription updated successfully', data: response.data!.data };
  },

  async getOrders(params?: { status?: string; page?: number; limit?: number }): Promise<ServiceResponse<any[]>> {
    const response = await platformAdminApi.getOrders(params);
    if (response.error?.message || response.data?.error) {
      return { error: true, message: response.data?.message ?? response.error?.message ?? 'Failed to fetch orders', data: null };
    }
    return { error: false, message: 'Success', data: response.data!.data };
  },

  async getPlans(): Promise<ServiceResponse<PlatformPlansApiResponse>> {
    const response = await platformAdminApi.getPlans();
    if (response.error?.message || response.data?.error) {
      return { error: true, message: response.data?.message ?? response.error?.message ?? 'Failed to fetch plans', data: null };
    }
    return { error: false, message: 'Success', data: response.data!.data };
  },

  async createPlan(data: PlanCreateData): Promise<ServiceResponse<any>> {
    const response = await platformAdminApi.createPlan(data);
    if (response.error?.message || response.data?.error) {
      return { error: true, message: response.data?.message ?? response.error?.message ?? 'Failed to create plan', data: null };
    }
    return { error: false, message: 'Plan created successfully', data: response.data!.data };
  },

  async updatePlan(id: string, data: PlanUpdateData): Promise<ServiceResponse<any>> {
    const response = await platformAdminApi.updatePlan(id, data);
    if (response.error?.message || response.data?.error) {
      return { error: true, message: response.data?.message ?? response.error?.message ?? 'Failed to update plan', data: null };
    }
    return { error: false, message: 'Plan updated successfully', data: response.data!.data };
  },

  async deletePlan(id: string): Promise<ServiceResponse<any>> {
    const response = await platformAdminApi.deletePlan(id);
    if (response.error?.message || response.data?.error) {
      return { error: true, message: response.data?.message ?? response.error?.message ?? 'Failed to delete plan', data: null };
    }
    return { error: false, message: 'Plan deleted successfully', data: response.data!.data };
  },
};
