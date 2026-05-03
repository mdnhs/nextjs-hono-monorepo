import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService, AdjustInventoryInput, Location } from '@/services/inventory.service';

export const useCreateLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Location>) => inventoryService.createLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
};

export const useAdjustInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdjustInventoryInput) => inventoryService.adjust(data),
    onSuccess: (_, { variantId }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory-levels', variantId] });
    },
  });
};
