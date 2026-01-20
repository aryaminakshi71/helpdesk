/**
 * Social Providers Configuration
 *
 * OAuth provider setup for Google and GitHub.
 */

import type { BetterAuthOptions } from "better-auth";

export interface SocialProvidersConfig {
  google?: {
    clientId: string;
    clientSecret: string;
  };
  github?: {
    clientId: string;
    clientSecret: string;
  };
}

/**
 * Create social providers configuration
 */
export function socialProvidersConfig(
  config: SocialProvidersConfig,
): BetterAuthOptions["socialProviders"] {
  const providers: BetterAuthOptions["socialProviders"] = {};

  if (config.google) {
    providers.google = {
      clientId: config.google.clientId,
      clientSecret: config.google.clientSecret,
    };
  }

  if (config.github) {
    providers.github = {
      clientId: config.github.clientId,
      clientSecret: config.github.clientSecret,
    };
  }

  return providers;
}
