import type { Request, Response, NextFunction } from 'express';
import { getRedisClient, isRedisConnected } from '../redis';

/**
 * Cache middleware for GET requests
 * Caches responses in Redis with configurable TTL
 */
export function cacheMiddleware(ttlSeconds: number, keyPrefix: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const redisClient = await getRedisClient();

    // Skip caching if Redis is not available
    if (!redisClient || !isRedisConnected()) {
      res.set('X-Cache', 'BYPASS');
      return next();
    }

    const cacheKey = `${keyPrefix}:${req.originalUrl}`;

    try {
      // Try to get cached response
      const cached = await redisClient.get(cacheKey);

      if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);
        return res.json(JSON.parse(cached));
      }
    } catch (err) {
      console.error('[Cache] Read error:', err);
    }

    // Cache miss - intercept response to cache it
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redisClient.setEx(cacheKey, ttlSeconds, JSON.stringify(body))
          .catch((err: Error) => console.error('[Cache] Write error:', err));
      }

      res.set('X-Cache', 'MISS');
      res.set('X-Cache-Key', cacheKey);
      return originalJson(body);
    };

    next();
  };
}

/**
 * Invalidate cache entries matching a pattern
 * @param pattern - Redis key pattern (e.g., "menu:*", "restaurants:*")
 */
export async function invalidateCache(pattern: string): Promise<number> {
  const redisClient = await getRedisClient();

  if (!redisClient || !isRedisConnected()) {
    return 0;
  }

  try {
    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`[Cache] Invalidated ${keys.length} keys matching "${pattern}"`);
      return keys.length;
    }

    return 0;
  } catch (err) {
    console.error('[Cache] Invalidation error:', err);
    return 0;
  }
}

/**
 * Invalidate specific cache key
 */
export async function invalidateCacheKey(key: string): Promise<boolean> {
  const redisClient = await getRedisClient();

  if (!redisClient || !isRedisConnected()) {
    return false;
  }

  try {
    const result = await redisClient.del(key);
    return result > 0;
  } catch (err) {
    console.error('[Cache] Key invalidation error:', err);
    return false;
  }
}

/**
 * Cache key patterns for the application
 */
export const CACHE_KEYS = {
  publicMenu: (slug: string) => `cache:menu:/api/public/menu/${encodeURIComponent(slug)}`,
  publicMenuPattern: 'cache:menu:*',
  restaurants: 'cache:restaurants:*',
} as const;
