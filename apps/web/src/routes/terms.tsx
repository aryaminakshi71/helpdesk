/**
 * Terms of Service Page
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingHeader, MarketingFooter } from "@/components/marketing";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen">
      <MarketingHeader isAuthenticated={false} />
      <main className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Terms of Service</h1>
        <div className="prose prose-neutral dark:prose-invert">
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using this service, you accept and agree to be bound
            by the terms and provisions of this agreement.
          </p>

          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily use this service for personal,
            non-commercial transitory viewing only.
          </p>

          <h2>3. Disclaimer</h2>
          <p>
            The materials on this service are provided on an 'as is' basis. We
            make no warranties, expressed or implied, and hereby disclaim all
            other warranties.
          </p>

          <h2>4. Limitations</h2>
          <p>
            In no event shall we or our suppliers be liable for any damages
            arising out of the use or inability to use our service.
          </p>

          <h2>5. Revisions</h2>
          <p>
            We may revise these terms of service at any time without notice. By
            using this service, you agree to be bound by the current version.
          </p>

          <h2>6. Contact</h2>
          <p>
            Questions about the Terms of Service should be sent to{" "}
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
