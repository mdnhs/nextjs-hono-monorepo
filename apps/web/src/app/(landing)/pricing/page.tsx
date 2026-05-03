import type { Metadata } from 'next';
import {
  PageHeader,
  PricingSection,
  CtaSection,
} from '@/features/landing/components';

export const metadata: Metadata = {
  title: 'Pricing — Shoply',
  description:
    'Simple, predictable pricing. Start free, scale on Growth, talk to sales for Enterprise.',
};

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow='Pricing'
        title='Pay for the platform.'
        titleAccent='Keep your revenue.'
        description='No take rate. No transaction fees. Pick a plan that matches your scale and we handle the rest.'
      />
      <PricingSection />
      <CtaSection />
    </>
  );
}
