/**
 * Landing Page
 *
 * Marketing landing page with hero, features, pricing, and CTA sections.
 */

import { createFileRoute } from "@tanstack/react-router";
import {
  MarketingHeader,
  MarketingFooter,
  LandingHero,
  FeaturesSection,
  PricingSection,
  CtaSection,
} from "@/components/marketing";
// import { authClient } from "@helpdesk/auth/client"; // Uncomment if needed for auth state checking

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const isAuthenticated = false;

  return (
    <div className="min-h-screen">
      <MarketingHeader isAuthenticated={isAuthenticated} />
      <main>
        <LandingHero />
        <FeaturesSection />
        <PricingSection />
        <CtaSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
