/**
 * Client environment variables
 *
 * These variables are safe to expose to the browser.
 * Only VITE_PUBLIC_* variables should be included here.
 *
 * This file is automatically used when importing from "@helpdesk/env"
 * in browser/client context via conditional exports.
 */

/// <reference types="vite/client" />

import { z } from "zod";

export const clientSchema = z.object({
  VITE_PUBLIC_SITE_URL: z
    .string()
    .url()
    .optional()
    .default("http://localhost:5173"),
  VITE_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_").optional(),
  // PostHog Analytics
  VITE_PUBLIC_POSTHOG_KEY: z.string().startsWith("phc_").optional(),
  VITE_PUBLIC_POSTHOG_HOST: z
    .string()
    .url()
    .optional()
    .default("https://us.i.posthog.com"),
  // CDN URL for optimized images (Cloudflare R2 or Images)
  VITE_PUBLIC_CDN_URL: z.string().url().optional(),
});

export type ClientEnv = z.infer<typeof clientSchema>;

/**
 * Validated client environment variables
 *
 * Safe to use in browser context.
 * Validation happens once at module load time.
 */
export const env: ClientEnv = (() => {
  try {
    return clientSchema.parse({
      VITE_PUBLIC_SITE_URL: import.meta.env?.VITE_PUBLIC_SITE_URL,
      VITE_PUBLIC_STRIPE_PUBLISHABLE_KEY:
        import.meta.env?.VITE_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      VITE_PUBLIC_POSTHOG_KEY: import.meta.env?.VITE_PUBLIC_POSTHOG_KEY,
      VITE_PUBLIC_POSTHOG_HOST: import.meta.env?.VITE_PUBLIC_POSTHOG_HOST,
      VITE_PUBLIC_CDN_URL: import.meta.env?.VITE_PUBLIC_CDN_URL,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Client environment validation failed:");
      console.error(JSON.stringify(error.issues, null, 2));
    } else {
      console.error("❌ Failed to parse client environment variables:", error);
    }

    // In browser, we can't exit process, so throw instead
    throw new Error("Client environment validation failed");
  }
})();
