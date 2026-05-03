import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { storefrontAuthService } from '../../../services/storefront-service';
import type { RegisterPayload } from '../../../types';

export const useStorefrontRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterPayload) => storefrontAuthService.register(data),
    onSuccess: (response) => {
      if (response.error || !response.data) {
        toast.error(response.message);
        return;
      }
      toast.success(response.message);
      router.push('/');
    },
    onError: () => toast.error('Something went wrong. Please try again.'),
  });
};
