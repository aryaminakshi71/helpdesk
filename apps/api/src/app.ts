/**
 * API Application
 *
 * Hono app with oRPC integration for Cloudflare Workers.
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { RPCHandler } from "@orpc/server/fetch";
import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod";
import { onError } from "@orpc/server";
import { appRouter } from "./routers";
import { createDb } from "@helpdesk/storage";
import { createAuthFromEnv } from "./lib/create-auth-from-env";
import { loggerMiddleware } from "./middleware/logger";
import { initSentry } from "./lib/sentry";
import { initDatadog } from "./lib/datadog";
import { rateLimitRedis } from "./middleware/rate-limit-redis";
import { APIError, formatErrorResponse } from "./lib/errors";
import { captureException as sentryCaptureException } from "./lib/sentry";
import { setSecurityHeaders } from "./lib/security";
import type { AppEnv, InitialContext } from "./context";

/**
 * Create Hono app with all routes
 */
export function createApp() {
  const app = new Hono<{ Bindings: AppEnv }>();

  // Initialize monitoring
  initSentry();
  initDatadog();

  // Global middleware (matching CRM/Queue/Invoicing pattern)
  app.use("*", cors({ origin: (origin: string | null) => origin, credentials: true }));
  app.use("*", requestId());
  app.use("*", loggerMiddleware);

  // Populate env from process.env if missing (e.g. running in local Vite/Bun without Cloudflare plugin)
  app.use("*", async (c, next) => {
    // @ts-ignore
    c.env = {
      ...process.env,
      ...(c.env || {}),
    };
    await next();
  });
  
  // Security headers middleware
  app.use("*", async (c, next) => {
    await next();
    setSecurityHeaders(c.res.headers);
  });

  // Health check (non-RPC) - defined BEFORE rate limiting to avoid delays
  app.get("/api/health", (c: any) => {
    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  });

  // Rate limiting middleware (matching CRM/Queue/Invoicing pattern)
  app.use("/api/*", rateLimitRedis({ limiterType: "api" }));
  app.use("/api/auth/*", rateLimitRedis({ limiterType: "auth" }));

  // Better Auth handler (includes Stripe webhook at /api/auth/stripe/webhook)
  app.on(["GET", "POST"], "/api/auth/*", async (c: any) => {
    // Handle both Hyperdrive binding and direct connection string
    const connectionString = c.env.DATABASE?.connectionString || (c.env as any).DATABASE_URL || process.env.DATABASE_URL;

    console.log(`[Auth Handler] Path: ${c.req.path}, Method: ${c.req.method}`);
    console.log(`[Auth Handler] Connection String length: ${connectionString?.length || 0}`);
    if (!connectionString) {
      console.error("[Auth Handler] Missing DATABASE binding or DATABASE_URL");
      return c.json({ error: "Database configuration error" }, 500);
    }

    try {
      const db = createDb({ connectionString });
      const auth = createAuthFromEnv(db, c.env);
      const res = await auth.handler(c.req.raw);
      console.log(`[Auth Handler] Responding with status: ${res.status}`);
      return res;
    } catch (err) {
      console.error("[Auth Handler] Error:", err);
      return c.json({ error: "Internal server error during auth" }, 500);
    }
  });

  // oRPC handler
  const rpcHandler = new RPCHandler(appRouter, {
    interceptors: [
      onError((error: unknown) => {
        console.error("[RPC Error]", error);
        
        // Capture in Sentry
        if (error instanceof Error) {
          sentryCaptureException(error);
        }
        
        // Handle APIError
        if (error instanceof APIError) {
          // APIError will be handled by oRPC's error handling
          return;
        }
      }),
    ],
  });

  app.use("/api/rpc/*", async (c: any, next: any) => {
    // Skip RPC handler for health check
    const url = new URL(c.req.url);
    if (url.pathname === "/api/health") {
      return next();
    }
    
    const initialContext: InitialContext = {
      env: c.env,
      headers: c.req.raw.headers,
      requestId: c.get("requestId") || crypto.randomUUID(),
      logger: c.get("logger"),
    };

    const { matched, response } = await rpcHandler.handle(c.req.raw, {
      prefix: "/api/rpc",
      context: initialContext,
    });

    if (matched && response) {
      return c.newResponse(response.body, response);
    }

    await next();
  });

  // OpenAPI spec
  app.get("/api/openapi.json", async (c: any) => {
    const generator = new OpenAPIGenerator({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    });

    const spec = await generator.generate(appRouter, {
      info: {
        title: "Helpdesk API",
        version: "1.0.0",
        description: "Helpdesk SaaS API",
      },
      servers: [{ url: c.env.VITE_PUBLIC_SITE_URL, description: "Current" }],
      security: [{ bearerAuth: [] }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "JWT token from Better Auth",
          },
        },
      },
      tags: [
        { name: "Tickets", description: "Ticket management operations" },
        { name: "System", description: "System endpoints" },
      ],
    });

    return c.json(spec);
  });

  // Scalar API Documentation UI
  app.get("/api/docs", async (c: any) => {
    const { Scalar } = await import("@scalar/hono-api-reference");
    return Scalar({
      spec: {
        url: "/api/openapi.json",
      },
      theme: "purple",
    })(c);
  });

  return app;
}

// Default app instance
export const api = createApp();
