import type { Metadata } from 'next';
import {
  PageHeader,
  FeaturesDetailedSection,
  StatsSection,
  CtaSection,
} from '@/features/landing/components';

export const metadata: Metadata = {
  title: 'Features — Shoply',
  description:
    'Everything you need to run a multi-tenant marketplace: stores, orders, billing, RBAC, and more.',
};

export default function FeaturesPage() {
  return (
    <>
      <PageHeader
        eyebrow='Features'
        title='Built to run'
        titleAccent='real marketplaces.'
        description='Nine product surfaces, one platform. Each piece is opinionated enough to ship today, flexible enough to grow with you.'
      />
      <StatsSection />
      <FeaturesDetailedSection />
      <CtaSection />
    </>
  );
}
