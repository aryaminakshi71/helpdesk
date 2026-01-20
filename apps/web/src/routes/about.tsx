/**
 * About Page
 *
 * Information about the company and product.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingHeader, MarketingFooter } from "@/components/marketing";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen">
      <MarketingHeader isAuthenticated={false} />
      <main className="mx-auto max-w-3xl px-6 py-24">
        <div className="space-y-6">
          <div>
            <h1 className="mb-4 text-3xl font-bold tracking-tight">About Helpdesk</h1>
            <p className="text-muted-foreground">
              Modern support platform for growing teams
            </p>
          </div>
          <div className="prose prose-neutral dark:prose-invert">
            <p>
              Helpdesk is a modern support platform designed to help teams
              organize, track, and resolve customer issues efficiently.
            </p>
            <h2>Our Mission</h2>
            <p>
              We're building tools that make it easy for support teams to deliver
              exceptional service with powerful features like automated triaging,
              smart queues, and seamless integrations.
            </p>
            <h2>Contact</h2>
            <p>
              Have questions? Reach out to us at{" "}
              <a href="mailto:hello@helpdesk.app" className="text-primary">
                hello@helpdesk.app
              </a>
              .
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
