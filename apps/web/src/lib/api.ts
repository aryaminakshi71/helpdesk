/**
 * oRPC Client Setup
 *
 * Creates a type-safe client for calling the API.
 * Uses the AppRouter type from the API package for full type inference.
 */

import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { RouterClient } from "@orpc/server";
import type { AppRouter } from "@helpdesk/api/router";

/**
 * Create the oRPC fetch link
 * This handles the actual HTTP requests to the API
 */
const link = new RPCLink({
  url: "/api/rpc",
  // Include credentials for session auth
  fetch: (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, {
      ...init,
      credentials: "include",
    }),
  // Add organization header and demo mode header if available
  headers: () => {
    const headers: Record<string, string> = {};
    
    // Get org slug from localStorage or context
    const orgSlug =
      typeof window !== "undefined"
        ? localStorage.getItem("currentOrgSlug")
        : null;
    if (orgSlug) {
      headers["x-organization-slug"] = orgSlug;
    }

    // Add demo mode header
    const isDemo = typeof window !== "undefined" && localStorage.getItem("demo_mode") === "true";
    headers["x-demo-mode"] = isDemo ? "true" : "false";

    return headers;
  },
});

/**
 * Type-safe oRPC client
 *
 * Usage:
 * ```ts
 * // Direct call
 * const user = await api.user.me();
 *
 * // With input
 * const notes = await api.notes.list({ status: 'published', limit: 10 });
 *
 * // Create
 * const note = await api.notes.create({ title: 'My Note', content: '...' });
 * ```
 */
export const api: RouterClient<AppRouter> = createORPCClient(link);

/**
 * TanStack Query integration for oRPC
 * Provides queryOptions/mutationOptions utilities
 * 
 * Usage:
 * ```tsx
 * import { useQuery, useMutation } from "@tanstack/react-query";
 * 
 * const { data, isLoading } = useQuery(orpc.dashboard.metrics.queryOptions());
 * const createTicket = useMutation(orpc.tickets.create.mutationOptions());
 * ```
 */
export const orpc = createTanstackQueryUtils(api);

/**
 * Helper to set the current organization
 * Call this when the user switches organizations
 */
export function setCurrentOrganization(slug: string | null) {
  if (typeof window !== "undefined") {
    if (slug) {
      localStorage.setItem("currentOrgSlug", slug);
    } else {
      localStorage.removeItem("currentOrgSlug");
    }
  }
}

/**
 * Get the current organization slug
 */
export function getCurrentOrganization(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("currentOrgSlug");
  }
  return null;
}
