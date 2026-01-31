/**
 * Datadog APM Integration (Mock)
 * 
 * Provides application performance monitoring with Datadog.
 * Gracefully degrades if DATADOG_API_KEY is not configured.
 */

// import * as tracer from "dd-trace"; // Disabled to fix __dirname reference error in Vite environment

const isConfigured = !!process.env.DATADOG_API_KEY;

if (!isConfigured) {
  // console.warn("DATADOG_API_KEY not set - APM disabled");
}

/**
 * Initialize Datadog APM
 * Call this early in your application startup
 */
export function initDatadog() {
  // Mock implementation
  if (!isConfigured) return;
}

/**
 * Create a span for tracing
 */
export function createSpan<T>(
  name: string,
  operation: string,
  callback: () => T | Promise<T>
): T | Promise<T> {
  return callback();
}

/**
 * Add tags to current span
 */
export function addTags(tags: Record<string, string | number | boolean>): void {
  // Mock implementation
}

/**
 * Set error on current span
 */
export function setError(error: Error): void {
  // Mock implementation
}

export const tracer = {
  trace: (name: string, options: any, callback: any) => callback(),
  scope: () => ({ active: () => null }),
  init: () => { },
} as any;

