import type { Metadata } from 'next';
import { PageHeader, DocsSection } from '@/features/landing/components';

export const metadata: Metadata = {
  title: 'Docs — Shoply',
  description:
    'Guides, API reference, and integration recipes for the Shoply marketplace platform.',
};

export default function DocsPage() {
  return (
    <>
      <PageHeader
        eyebrow='Documentation'
        title='Ship faster.'
        titleAccent='Read less.'
        description='Concept docs, copy-paste recipes, and a complete API reference. Everything is searchable, every example actually runs.'
      />
      <DocsSection />
    </>
  );
}
