/**
 * Changelog Page
 *
 * Product changelog and release notes.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingHeader, MarketingFooter } from "@/components/marketing";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/changelog")({
  component: ChangelogPage,
});

function ChangelogPage() {
  return (
    <div className="min-h-screen">
      <MarketingHeader isAuthenticated={false} />
      <main className="mx-auto max-w-3xl px-6 py-24">
        <div className="space-y-6">
          <div>
            <h1 className="mb-4 text-3xl font-bold tracking-tight">Changelog</h1>
            <p className="text-muted-foreground">
              Product updates and release notes.
            </p>
          </div>
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Changelog will be available soon. We're working on documenting all product updates.
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
