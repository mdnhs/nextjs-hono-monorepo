import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffService } from '@/services/staff.service';
import { toast } from 'sonner';

export const useStaffList = (storeId: string) => {
  return useQuery({
    queryKey: ['staff', storeId],
    queryFn: () => staffService.listStaff(storeId),
    enabled: !!storeId,
  });
};

export const useStaffMutations = () => {
  const queryClient = useQueryClient();

  const inviteStaff = useMutation({
    mutationFn: ({ storeId, data }: { storeId: string; data: { userId: string; role: string } }) =>
      staffService.inviteStaff(storeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff', variables.storeId] });
      toast.success('Staff invitation sent');
    },
  });

  return {
    inviteStaff,
  };
};
