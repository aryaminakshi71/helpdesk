import { drizzle } from "drizzle-orm/neon-serverless";
import { neonConfig } from "@neondatabase/serverless";
import * as schema from "./schema";

/**
 * Hyperdrive connection string type
 */
export interface HyperdriveConnection {
  connectionString: string;
}

/**
 * Create a database client optimized for Cloudflare Workers with Neon
 *
 * In Cloudflare Workers:
 * - Use env.DATABASE.connectionString (from Hyperdrive binding)
 * - Automatically uses Neon serverless driver optimized for edge runtime
 *
 * In local development:
 * - Use connectionString parameter or DATABASE_URL env var
 */
export function createDb(
  connectionString?: string | { connectionString: string },
) {
  let url: string;

  if (typeof connectionString === "string") {
    url = connectionString;
  } else if (connectionString && "connectionString" in connectionString) {
    url = connectionString.connectionString;
  } else {
    url = process.env.DATABASE_URL!;
  }

  // Optimize Neon for Cloudflare Workers
  neonConfig.fetchConnectionCache = true;
  
  // drizzle-orm/neon-serverless accepts connection string directly
  return drizzle(url, { schema });
}

/**
 * Database client type
 */
export type Database = ReturnType<typeof createDb>;

// Re-export schema for convenience
export { schema };
