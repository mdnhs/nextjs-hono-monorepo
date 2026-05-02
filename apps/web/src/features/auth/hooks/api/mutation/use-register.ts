import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '../../../services/service';
import type { RegisterPayload } from '../../../types';

export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterPayload) => authService.register(data),
    onSuccess: (response) => {
      if (response.error || !response.data) {
        toast.error(response.message);
        return;
      }
      toast.success('Account created! Redirecting…');
      router.push(authService.getRedirectPath(response.data.user.role));
    },
    onError: () => toast.error('Something went wrong. Please try again.'),
  });
};
