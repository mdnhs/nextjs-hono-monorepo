import { useQuery } from '@tanstack/react-query';
import { storeService } from '@/services/store.service';

export const useStores = (filters: any = {}) => {
  return useQuery({
    queryKey: ['stores', filters],
    queryFn: () => storeService.getAllStores(filters),
  });
};

export const useStore = (idOrSlug: string, isSlug = false) => {
  return useQuery({
    queryKey: ['store', idOrSlug],
    queryFn: () => isSlug ? storeService.getStoreBySlug(idOrSlug) : storeService.getStoreById(idOrSlug),
    enabled: !!idOrSlug,
  });
};

export const useMyStores = () => {
  return useQuery({
    queryKey: ['my-stores'],
    queryFn: () => storeService.getMyStores(),
  });
};
