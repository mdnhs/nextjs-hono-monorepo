import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services/cart.service';
import { toast } from 'sonner';

export const useCartMutations = () => {
  const queryClient = useQueryClient();

  const addItem = useMutation({
    mutationFn: (data: { productId: string; variantId: string; quantity: number }) => cartService.addItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item added to cart');
    },
  });

  const updateItem = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => cartService.updateItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => cartService.removeItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item removed from cart');
    },
  });

  const clearCart = useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const checkout = useMutation({
    mutationFn: (data: { shippingAddress: any; discountCode: string }) => cartService.checkout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      toast.success('Order placed successfully');
    },
  });

  return {
    addItem,
    updateItem,
    removeItem,
    clearCart,
    checkout,
  };
};
