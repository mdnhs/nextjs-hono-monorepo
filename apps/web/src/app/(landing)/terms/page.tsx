import type { Metadata } from 'next';
import { PageHeader, LegalSection } from '@/features/landing/components';

export const metadata: Metadata = {
  title: 'Terms of Service — Shoply',
  description:
    'The agreement that governs your use of the Shoply marketplace platform.',
};

const BLOCKS = [
  {
    id: 'acceptance',
    heading: '1. Acceptance of terms',
    paragraphs: [
      'By creating a Shoply account or using the service, you agree to these terms on behalf of yourself and any organization you represent.',
      'If you do not agree, do not use the service.',
    ],
  },
  {
    id: 'accounts',
    heading: '2. Accounts',
    paragraphs: [
      'You are responsible for the accuracy of the information you provide and for safeguarding your credentials. You must notify us promptly of any unauthorized access.',
    ],
  },
  {
    id: 'acceptable-use',
    heading: '3. Acceptable use',
    paragraphs: [
      'You may not use the service to host content that is illegal, infringing, or that puts the platform at material risk. The list below is non-exhaustive.',
    ],
    list: [
      'No products or content that violate applicable law in the jurisdictions you operate in.',
      'No attempts to bypass tenant isolation, security controls, or rate limits.',
      'No reverse engineering of the platform except where law prevents us from restricting it.',
      'No use of the service to send unsolicited bulk communication.',
    ],
  },
  {
    id: 'fees',
    heading: '4. Fees and billing',
    paragraphs: [
      'Paid plans are billed in advance on a recurring basis. Fees are non-refundable except where required by law. Plan changes are prorated automatically.',
      'Failure to pay may result in suspension after written notice and a reasonable cure period.',
    ],
  },
  {
    id: 'content',
    heading: '5. Your content',
    paragraphs: [
      'You retain all rights to the content you upload. You grant Shoply a limited license to host, transmit, and display that content as needed to operate the service.',
    ],
  },
  {
    id: 'availability',
    heading: '6. Service availability',
    paragraphs: [
      'We target 99.9% uptime on Growth and 99.99% on Enterprise. Specific commitments and credits are described in the Service Level Agreement attached to your plan.',
    ],
  },
  {
    id: 'termination',
    heading: '7. Termination',
    paragraphs: [
      'You can cancel your account at any time from your settings. We may suspend or terminate accounts that violate these terms, with notice where reasonably possible.',
      'On termination, you can export your data for 30 days. After that, we delete it in line with the Privacy Policy.',
    ],
  },
  {
    id: 'liability',
    heading: '8. Limitation of liability',
    paragraphs: [
      'To the maximum extent permitted by law, Shoply\'s aggregate liability for any claim arising out of or relating to the service is limited to the fees you paid in the 12 months preceding the claim.',
    ],
  },
  {
    id: 'governing-law',
    heading: '9. Governing law',
    paragraphs: [
      'These terms are governed by the laws of the State of Delaware, without regard to conflict-of-laws rules. Disputes will be resolved exclusively in the state or federal courts of Delaware.',
    ],
  },
  {
    id: 'changes',
    heading: '10. Changes',
    paragraphs: [
      'We may update these terms from time to time. Material changes are announced at least 14 days in advance. Continued use after the effective date constitutes acceptance.',
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow='Legal'
        title='Terms of Service'
        description='The contract between you and Shoply. We try to keep it short and direct.'
      />
      <LegalSection
        effectiveDate='May 1, 2026'
        intro='These terms ("Terms") govern your use of the Shoply platform, dashboards, APIs, and related services (the "Service") provided by Shoply, Inc. ("Shoply").'
        blocks={BLOCKS}
        contactEmail='legal@shoply.com'
      />
    </>
  );
}
