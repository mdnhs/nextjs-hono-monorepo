import { CheckoutForm } from '@/features/checkout/components/checkout-form';

export default function CheckoutPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 font-heading">Secure Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
