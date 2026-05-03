import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '@/services/inventory.service';

export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: () => inventoryService.getLocations(),
  });
};

export const useInventoryLevels = (variantId: string) => {
  return useQuery({
    queryKey: ['inventory-levels', variantId],
    queryFn: () => inventoryService.getLevels(variantId),
    enabled: !!variantId,
  });
};
