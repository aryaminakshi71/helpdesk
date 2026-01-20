/**
 * Advanced Auth Configuration
 *
 * Cookie settings, ID generation, and other advanced options.
 */

import type { BetterAuthOptions } from "better-auth";

export interface AdvancedConfig {
  /** Use secure cookies (HTTPS only) */
  useSecureCookies?: boolean;
  /** Cookie prefix for namespacing */
  cookiePrefix?: string;
  /** Custom ID generator */
  generateId?: () => string;
}

/**
 * Create advanced configuration
 */
export function advancedConfig(
  config: AdvancedConfig = {},
): BetterAuthOptions["advanced"] {
  const {
    useSecureCookies = true,
    cookiePrefix = "helpdesk",
    generateId = () => crypto.randomUUID(),
  } = config;

  return {
    useSecureCookies,
    cookiePrefix,
    database: {
      generateId,
    },
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: useSecureCookies,
    },
  };
}
