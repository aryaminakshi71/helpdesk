import handler from "@tanstack/react-start/server-entry";
import { api } from "@helpdesk/api/app";
import type { getRouter } from "./router";
import type { startInstance } from "./start";

/**
 * Cloudflare context passed through TanStack Start's request context
 */
export interface CloudflareRequestContext {
  cloudflare: {
    env: Env;
    ctx: ExecutionContext;
  };
}

// Augment TanStack Start's Register interface for type safety
declare module "@tanstack/react-start" {
  interface Register {
    ssr: true;
    router: ReturnType<typeof getRouter>;
    config: Awaited<ReturnType<typeof startInstance.getOptions>>;
    server: {
      requestContext: CloudflareRequestContext;
    };
  }
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api")) {
      return api.fetch(request, env as any, ctx);
    }

    // Type assertion needed because module augmentation isn't fully applied
    // until vite dev/build generates the complete route tree
    return handler.fetch(request, {
      context: {
        cloudflare: { env, ctx },
      },
    } as Parameters<typeof handler.fetch>[1]);
  },
};
