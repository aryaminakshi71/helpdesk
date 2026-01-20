/**
 * Blog Layout
 *
 * Layout wrapper for blog pages with marketing header and footer.
 */

import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MarketingHeader, MarketingFooter } from "@/components/marketing";

export const Route = createFileRoute("/blog")({
  component: BlogLayout,
});

function BlogLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader isAuthenticated={false} />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  );
}
