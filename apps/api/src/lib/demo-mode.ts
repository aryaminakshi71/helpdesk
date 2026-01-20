/**
 * Demo Mode Utilities
 *
 * Helper functions for handling demo mode in API procedures.
 */

import { ORPCError } from "@orpc/server";
import type { InitialContext } from "../context";

/**
 * Demo organization ID
 */
export const DEMO_ORG_ID = "demo-org";

/**
 * Demo user ID
 */
export const DEMO_USER_ID = "demo-user-001";

/**
 * Check if request is in demo mode
 */
export function isDemoMode(context: Pick<InitialContext, "headers">): boolean {
  const demoModeHeader = context.headers.get("x-demo-mode");
  return demoModeHeader === "true";
}

/**
 * Get organization ID from context
 * Returns demo org ID if in demo mode, otherwise requires authentication
 */
export function getOrganizationId(context: Pick<InitialContext, "headers">): string {
  if (isDemoMode(context)) {
    return DEMO_ORG_ID;
  }
  throw new ORPCError("UNAUTHORIZED", {
    message: "Authentication required for organization access",
  });
}

/**
 * Get user ID from context
 * Returns demo user ID if in demo mode, otherwise requires authentication
 */
export function getUserId(context: Pick<InitialContext, "headers">): string {
  if (isDemoMode(context)) {
    return DEMO_USER_ID;
  }
  throw new ORPCError("UNAUTHORIZED", {
    message: "Authentication required for user access",
  });
}
