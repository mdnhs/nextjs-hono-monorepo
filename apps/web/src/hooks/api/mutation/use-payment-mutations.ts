import { useMutation } from '@tanstack/react-query';
import { paymentService, InitiatePaymentInput, RefundPaymentInput } from '@/services/payment.service';

export const useInitiatePayment = () => {
  return useMutation({
    mutationFn: (data: InitiatePaymentInput) => paymentService.initiate(data),
  });
};

export const useRefundPayment = () => {
  return useMutation({
    mutationFn: (data: RefundPaymentInput) => paymentService.refund(data),
  });
};
