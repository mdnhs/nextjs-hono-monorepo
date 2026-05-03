import { useQuery } from '@tanstack/react-query';
import { productService, ProductFilters } from '@/services/product.service';

export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getAllProducts(filters),
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
  });
};

export const useStoreProducts = (storeId: string, filters: any = {}) => {
  return useQuery({
    queryKey: ['store-products', storeId, filters],
    queryFn: () => productService.getStoreProducts(storeId, filters),
    enabled: !!storeId,
  });
};
