import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { domainService } from '@/services/domain.service';
import { toast } from 'sonner';

export const useDomainCheck = (domain: string) => {
  return useQuery({
    queryKey: ['domain-check', domain],
    queryFn: () => domainService.checkDomain(domain),
    enabled: !!domain,
  });
};

export const useDomainMutations = () => {
  const queryClient = useQueryClient();

  const requestVerification = useMutation({
    mutationFn: ({ storeId, hostname }: { storeId: string; hostname: string }) =>
      domainService.requestVerification(storeId, hostname),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['store', variables.storeId] });
      toast.success('Verification request submitted');
    },
  });

  return {
    requestVerification,
  };
};
