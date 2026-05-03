import type { Metadata } from 'next';
import { PageHeader, LegalSection } from '@/features/landing/components';

export const metadata: Metadata = {
  title: 'Privacy Policy — Shoply',
  description:
    'How Shoply collects, uses, stores, and protects your data across the platform.',
};

const BLOCKS = [
  {
    id: 'overview',
    heading: '1. Overview',
    paragraphs: [
      'This policy explains what data Shoply collects when you use our platform, why we collect it, how long we keep it, and the choices you have.',
      'It applies to platform owners, store operators, and end shoppers who interact with stores hosted on Shoply.',
    ],
  },
  {
    id: 'data-we-collect',
    heading: '2. Data we collect',
    paragraphs: [
      'We collect only the data needed to run the platform and meet our legal obligations. The categories below are illustrative, not exhaustive.',
    ],
    list: [
      'Account data: name, email, hashed password, organization, role.',
      'Store data: products, orders, customers, payouts, configuration.',
      'Billing data: plan, payment method token, invoice history (handled by our processor).',
      'Telemetry: IP, user agent, page paths, error traces — used for security and reliability.',
    ],
  },
  {
    id: 'how-we-use-it',
    heading: '3. How we use your data',
    paragraphs: [
      'We use your data to operate the service, secure accounts, comply with law, and improve the product. We never sell personal data and we do not run third-party advertising on the platform.',
    ],
    list: [
      'Provide and maintain the service you signed up for.',
      'Detect, prevent, and respond to abuse, fraud, and security incidents.',
      'Send transactional and service-critical communications.',
      'Generate aggregated, non-identifying usage analytics.',
    ],
  },
  {
    id: 'subprocessors',
    heading: '4. Subprocessors',
    paragraphs: [
      'We rely on a small set of vetted infrastructure providers (compute, database, email, payments, error tracking). The current list is published in our Trust Center and updated whenever it changes.',
    ],
  },
  {
    id: 'retention',
    heading: '5. Data retention',
    paragraphs: [
      'Active account data is kept for the lifetime of your account. After deletion, we purge personal data within 30 days, except where law requires longer retention (e.g. tax records, audit logs).',
    ],
  },
  {
    id: 'your-rights',
    heading: '6. Your rights',
    paragraphs: [
      'Depending on your jurisdiction, you may have the right to access, correct, export, or delete your personal data, and to object to certain processing.',
      'Submit requests through your account settings or by emailing the address below. We respond within 30 days.',
    ],
  },
  {
    id: 'security',
    heading: '7. Security',
    paragraphs: [
      'We encrypt data in transit (TLS 1.2+) and at rest. Access to production is gated by SSO + hardware keys and is logged. We run regular third-party security reviews and publish the results in our Trust Center.',
    ],
  },
  {
    id: 'changes',
    heading: '8. Changes to this policy',
    paragraphs: [
      'We will post material changes on this page and notify account owners by email at least 14 days before they take effect.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow='Legal'
        title='Privacy Policy'
        description='How we handle your data — written in plain language, without burying the important parts.'
      />
      <LegalSection
        effectiveDate='May 1, 2026'
        intro='Shoply ("we", "us") provides a multi-tenant commerce platform. This policy describes the personal data we process and the choices you have.'
        blocks={BLOCKS}
        contactEmail='privacy@shoply.com'
      />
    </>
  );
}
