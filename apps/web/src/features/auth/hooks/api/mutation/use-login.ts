import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '../../../services/service';
import type { LoginPayload } from '../../../types';

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginPayload) => authService.login(data),
    onSuccess: (response) => {
      if (response.error || !response.data) {
        toast.error(response.message);
        return;
      }
      toast.success(response.message);
      router.push(authService.getRedirectPath(response.data.user.role));
    },
    onError: () => toast.error('Something went wrong. Please try again.'),
  });
};
