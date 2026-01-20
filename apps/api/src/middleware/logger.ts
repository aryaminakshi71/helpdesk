/**
 * Logger Middleware
 *
 * Request-scoped logging middleware for Hono.
 * Skips logging for health checks and static assets.
 */

import type { Context, Next } from "hono";
import { createRequestLoggerFromRequest, type Logger } from "@helpdesk/logger";

const SKIP_PATHS = ["/api/health", "/health", "/favicon.ico", "/robots.txt"];

declare module "hono" {
  interface ContextVariableMap {
    logger: Logger;
  }
}

export async function loggerMiddleware(c: Context, next: Next) {
  const requestId = c.get("requestId") || crypto.randomUUID();
  c.header("X-Request-Id", requestId);

  const logger = createRequestLoggerFromRequest(c.req.raw, { requestId });
  c.set("logger", logger);

  const start = Date.now();
  await next();

  // Skip logging for noisy paths
  if (!SKIP_PATHS.some((p) => c.req.path.startsWith(p))) {
    logger.info(
      { status: c.res.status, duration: Date.now() - start },
      "Request completed",
    );
  }
}
