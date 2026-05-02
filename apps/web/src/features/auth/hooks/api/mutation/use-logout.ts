'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '../../../services/service';

export const useLogout = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: (response) => {
      if (response.error) {
        toast.error(response.message);
        return;
      }
      toast.success(response.message || 'Logged out successfully');
      router.push('/login');
    },
    onError: () => toast.error('Something went wrong. Please try again.'),
  });
};
