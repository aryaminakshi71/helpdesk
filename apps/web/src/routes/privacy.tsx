/**
 * Privacy Policy Page
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingHeader, MarketingFooter } from "@/components/marketing";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <MarketingHeader isAuthenticated={false} />
      <main className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <div className="prose prose-neutral dark:prose-invert">
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you
            create an account, make a purchase, or contact us for support.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve
            our services, process transactions, and communicate with you.
          </p>

          <h2>3. Information Sharing</h2>
          <p>
            We do not share your personal information with third parties except
            as described in this policy or with your consent.
          </p>

          <h2>4. Data Security</h2>
          <p>
            We take reasonable measures to help protect your personal information
            from loss, theft, misuse, and unauthorized access.
          </p>

          <h2>5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us
            at{" "}
            <a href={"mailto:hello@helpdesk.app"} className="text-primary">
              {"hello@helpdesk.app"}
            </a>
            .
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
