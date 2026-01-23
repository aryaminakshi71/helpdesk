/**
 * Sentry Error Tracking
 * 
 * Provides error tracking and performance monitoring.
 * Gracefully degrades if SENTRY_DSN is not configured.
 */

import * as Sentry from "@sentry/node";

const isConfigured = !!process.env.SENTRY_DSN;

if (!isConfigured) {
  console.warn("SENTRY_DSN not set - Error tracking disabled");
}

export function initSentry() {
  if (!isConfigured) return;

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    integrations: [
      Sentry.httpIntegration(),
      Sentry.nativeNodeFetchIntegration(),
    ],
    beforeSend(event) {
      if (process.env.NODE_ENV === "development" && !process.env.SENTRY_DEBUG) {
        console.log("[Sentry] Would send event:", event.message || event.exception);
        return null;
      }
      return event;
    },
  });
}

export function captureException(
  error: Error | unknown,
  context?: {
    user?: { id: string; email?: string };
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  },
) {
  if (!isConfigured) {
    console.error("[Error]", error);
    return;
  }

  Sentry.withScope((scope) => {
    if (context?.user) scope.setUser(context.user);
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => scope.setTag(key, value));
    }
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => scope.setExtra(key, value));
    }
    Sentry.captureException(error);
  });
}

export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: {
    user?: { id: string; email?: string };
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  },
) {
  if (!isConfigured) {
    console.log(`[${level.toUpperCase()}]`, message);
    return;
  }

  Sentry.withScope((scope) => {
    scope.setLevel(level);
    if (context?.user) scope.setUser(context.user);
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => scope.setTag(key, value));
    }
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => scope.setExtra(key, value));
    }
    Sentry.captureMessage(message);
  });
}

export function setUser(user: { id: string; email?: string; name?: string } | null) {
  if (!isConfigured) return;
  Sentry.setUser(user);
}

export async function flush(timeout = 2000) {
  if (!isConfigured) return;
  await Sentry.flush(timeout);
}

export { Sentry };
