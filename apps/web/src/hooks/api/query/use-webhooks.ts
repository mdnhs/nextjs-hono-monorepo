import { useQuery } from '@tanstack/react-query';
import { webhookService } from '@/services/webhook.service';

export const useWebhooks = () => {
  return useQuery({
    queryKey: ['webhooks'],
    queryFn: () => webhookService.getWebhooks(),
  });
};
