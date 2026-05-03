import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetService } from '@/services/asset.service';
import { toast } from 'sonner';

export const useAssetList = (storeId: string) => {
  return useQuery({
    queryKey: ['assets', storeId],
    queryFn: () => assetService.listAssets(storeId),
    enabled: !!storeId,
  });
};

export const useAssetMutations = () => {
  const queryClient = useQueryClient();

  const uploadAsset = useMutation({
    mutationFn: ({ storeId, file }: { storeId: string; file: File }) =>
      assetService.uploadAsset(storeId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets', variables.storeId] });
      toast.success('Asset uploaded successfully');
    },
  });

  return {
    uploadAsset,
  };
};
