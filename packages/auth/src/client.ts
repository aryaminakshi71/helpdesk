/**
 * Better Auth Client Configuration
 *
 * Client-side hooks and utilities for authentication.
 */

import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

/**
 * Create auth client - call this in your app with the correct base URL
 */
export function createClient(baseURL: string) {
  return createAuthClient({
    baseURL,
    basePath: "/api/auth",
    plugins: [organizationClient()],
  });
}

// Default client for convenience (uses window.location.origin in browser)
export const authClient = createAuthClient({
  basePath: "/api/auth",
  plugins: [organizationClient()],
});

// Export hooks from default client
export const { useSession, signIn, signUp, signOut } = authClient;

// Type exports
export type Session = typeof authClient.$Infer.Session;
export type User = Session["user"];
