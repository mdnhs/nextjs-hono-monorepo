import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { storefrontAuthService } from '../../../services/storefront-service';
import type { LoginPayload } from '../../../types';

export const useStorefrontLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginPayload) => storefrontAuthService.login(data),
    onSuccess: (response) => {
      if (response.error || !response.data) {
        toast.error(response.message);
        return;
      }
      toast.success(response.message);
      // For storefront, we usually redirect to the home page or wherever they were
      router.push('/');
    },
    onError: () => toast.error('Something went wrong. Please try again.'),
  });
};
