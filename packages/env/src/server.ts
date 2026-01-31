/**
 * Server environment variables
 *
 * Includes all environment variables (client + server-only).
 * Never exposed to browser - import from "@helpdesk/env/server" explicitly.
 *
 * Uses Cloudflare Workers runtime to access environment variables.
 */

import { z } from "zod";
// @ts-ignore
import { clientSchema } from "./client.ts";

// Fallback for non-Cloudflare environments
const getEnv = () => {
  const env: Record<string, any> = {};

  if (typeof process !== "undefined" && process.env) {
    Object.assign(env, process.env);
  }

  // @ts-ignore
  if (typeof import.meta !== "undefined" && import.meta.env) {
    // @ts-ignore
    Object.assign(env, import.meta.env);
  }

  return env;
};

const cfEnv = getEnv();

const serverSchema = clientSchema.extend({
  // ============================================================================
  // OPERATIONAL CONFIG
  // ============================================================================

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // ============================================================================
  // AUTH (Better Auth)
  // ============================================================================

  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters")
    .optional()
    .or(z.string().length(0))
    .default("placeholder-secret-at-least-32-chars-long"),

  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // ============================================================================
  // REDIS (Upstash)
  // Uses REST API naming convention expected by @upstash/redis fromEnv()
  // ============================================================================

  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // ============================================================================
  // STRIPE BILLING
  // ============================================================================

  STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),

  // ============================================================================
  // MONITORING (Sentry)
  // ============================================================================

  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
  SENTRY_DEBUG: z.string().optional(),

  // ============================================================================
  // APM (Datadog)
  // ============================================================================

  DATADOG_API_KEY: z.string().optional(),
  DATADOG_SERVICE_NAME: z.string().optional(),
  DATADOG_ENV: z.string().optional(),
  DATADOG_VERSION: z.string().optional(),

  // ============================================================================
  // LOG AGGREGATION
  // ============================================================================

  LOG_AGGREGATION_ENDPOINT: z.string().url().optional(),
  LOG_AGGREGATION_API_KEY: z.string().optional(),
  LOG_AGGREGATION_SERVICE: z.enum(["datadog", "logtail", "cloudwatch", "custom"]).optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

/**
 * Validated server environment variables
 *
 * Includes all environment variables (client + server-only).
 * Validation happens once at module load time.
 *
 * Note: Cloudflare bindings (KV, R2, Hyperdrive) are accessed separately
 * via Hono context (c.env.*), not through this module.
 */
export const env: ServerEnv = serverSchema.parse(cfEnv);
