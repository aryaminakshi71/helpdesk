/**
 * Database Access Module
 *
 * Provides database access for procedures without exposing
 * full Drizzle types in the oRPC context (which causes TS7056 errors).
 *
 * In Cloudflare Workers, we create a new client per-request since
 * environment bindings are request-scoped.
 */

import { createDb as createDbClient, schema } from "@helpdesk/storage";
import type { InitialContext } from "../context";

export { schema };

/**
 * Create a database client from the request context
 * Use this in procedures instead of accessing db from context
 */
export function getDb(context: Pick<InitialContext, "env">) {
  const connectionString = context.env.DATABASE?.connectionString || context.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Database configuration error: Missing connection string");
  }
  return createDbClient({ connectionString });
}

/**
 * Database client type - use sparingly to avoid type inference bloat
 */
export type Db = ReturnType<typeof getDb>;
