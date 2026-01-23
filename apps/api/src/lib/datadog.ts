/**
 * Datadog APM Integration
 * 
 * Provides application performance monitoring with Datadog.
 * Gracefully degrades if DATADOG_API_KEY is not configured.
 */

import * as tracer from "dd-trace";

const isConfigured = !!process.env.DATADOG_API_KEY;

if (!isConfigured) {
  console.warn("DATADOG_API_KEY not set - APM disabled");
}

/**
 * Initialize Datadog APM
 * Call this early in your application startup
 */
export function initDatadog() {
  if (!isConfigured) return;

  tracer.init({
    service: process.env.DATADOG_SERVICE_NAME || "helpdesk-api",
    env: process.env.DATADOG_ENV || process.env.NODE_ENV || "development",
    version: process.env.DATADOG_VERSION || "1.0.0",
    logInjection: true,
    runtimeMetrics: true,
    profiling: true,
    appsec: true,
    plugins: {
      http: {
        enabled: true,
        blocklist: ["/health", "/metrics"],
      },
      fetch: {
        enabled: true,
      },
    },
  });
}

/**
 * Create a span for tracing
 */
export function createSpan<T>(
  name: string,
  operation: string,
  callback: () => T | Promise<T>
): T | Promise<T> {
  if (!isConfigured) {
    return callback();
  }

  return tracer.trace(name, { type: operation }, callback);
}

/**
 * Add tags to current span
 */
export function addTags(tags: Record<string, string | number | boolean>): void {
  if (!isConfigured) return;
  tracer.use("http").addTags(tags);
}

/**
 * Set error on current span
 */
export function setError(error: Error): void {
  if (!isConfigured) return;
  tracer.use("http").setError(error);
}

export { tracer };
