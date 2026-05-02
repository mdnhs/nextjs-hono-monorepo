import { HeroSection, FeaturesSection, CtaSection } from '@/features/landing/components';

export default function LandingPage() {
  return (
    <>
      <HeroSection />

      {/* ── Divider ── */}
      <div className="max-w-[1280px] mx-auto px-6">
        <div style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.08)' }} />
      </div>

      <FeaturesSection />

      <CtaSection />
    </>
  );
}
