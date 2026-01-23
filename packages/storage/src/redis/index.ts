/**
 * Redis Cache Client (Upstash)
 * 
 * Provides caching layer for frequently accessed data.
 * Uses Upstash Redis REST API (works with Cloudflare Workers).
 */

import { env } from "@helpdesk/env/server";
import { Redis } from "@upstash/redis";

export interface RedisConfig {
  url?: string;
  token?: string;
}

/**
 * Create Redis client using Upstash
 * Falls back to env variables if config not provided
 */
export function createRedisClient(config?: RedisConfig) {
  const url = config?.url ?? env.UPSTASH_REDIS_REST_URL;
  const token = config?.token ?? env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Return no-op client if Redis not configured
    return createNoOpClient();
  }

  const redis = new Redis({ url, token });

  return {
    /**
     * Raw Redis client for advanced operations
     */
    client: redis,

    /**
     * Get a value
     */
    async get<T>(key: string): Promise<T | null> {
      return redis.get<T>(key);
    },

    /**
     * Set a value with optional TTL (in seconds)
     */
    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
      if (ttlSeconds) {
        await redis.set(key, value, { ex: ttlSeconds });
      } else {
        await redis.set(key, value);
      }
    },

    /**
     * Delete a key
     */
    async delete(key: string): Promise<void> {
      await redis.del(key);
    },

    /**
     * Delete multiple keys
     */
    async deleteMany(keys: string[]): Promise<void> {
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    },

    /**
     * Check if a key exists
     */
    async exists(key: string): Promise<boolean> {
      const count = await redis.exists(key);
      return count > 0;
    },

    /**
     * Set TTL on an existing key (in seconds)
     */
    async expire(key: string, ttlSeconds: number): Promise<void> {
      await redis.expire(key, ttlSeconds);
    },

    /**
     * Get remaining TTL on a key (in seconds)
     */
    async ttl(key: string): Promise<number> {
      return redis.ttl(key);
    },
  };
}

/**
 * No-op client when Redis is not configured
 */
function createNoOpClient() {
  return {
    client: null,
    async get<T>(_key: string): Promise<T | null> {
      return null;
    },
    async set<T>(_key: string, _value: T, _ttlSeconds?: number): Promise<void> {
      // No-op
    },
    async delete(_key: string): Promise<void> {
      // No-op
    },
    async deleteMany(_keys: string[]): Promise<void> {
      // No-op
    },
    async exists(_key: string): Promise<boolean> {
      return false;
    },
    async expire(_key: string, _ttlSeconds: number): Promise<void> {
      // No-op
    },
    async ttl(_key: string): Promise<number> {
      return -1;
    },
  };
}

/**
 * Default Redis client instance
 * Uses environment variables from @helpdesk/env/server
 */
export const redis = createRedisClient();

export type RedisClient = ReturnType<typeof createRedisClient>;

/**
 * Cache helper: Get or fetch and cache
 */
export async function getOrCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 3600, // 1 hour default
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const value = await fetcher();
  await redis.set(key, value, ttlSeconds);
  return value;
}

/**
 * Cache helper: Invalidate cache
 */
export async function invalidateCache(key: string): Promise<void> {
  await redis.delete(key);
}
