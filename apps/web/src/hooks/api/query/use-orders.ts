import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';

export const useMyOrders = (filters: any = {}) => {
  return useQuery({
    queryKey: ['my-orders', filters],
    queryFn: () => orderService.getMyOrders(filters),
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id),
    enabled: !!id,
  });
};

export const useSellerOrders = (filters: any = {}) => {
  return useQuery({
    queryKey: ['seller-orders', filters],
    queryFn: () => orderService.getSellerOrders(filters),
  });
};
