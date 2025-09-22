import { Request, Response, NextFunction } from 'express';
import { logger } from '../index';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key?: (req: Request) => string;
  condition?: (req: Request, res: Response) => boolean;
}

class MemoryCache {
  private cache = new Map<string, { data: any; expiry: number }>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  set(key: string, value: any, ttl: number): void {
    const expiry = Date.now() + (ttl * 1000);
    this.cache.set(key, { data: value, expiry });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

export const memoryCache = new MemoryCache();

export function createCacheMiddleware(options: CacheOptions = {}) {
  const {
    ttl = 300, // 5 minutes default
    key = (req: Request) => `${req.method}:${req.originalUrl}`,
    condition = (req: Request) => req.method === 'GET'
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip caching if condition is not met
    if (!condition(req, res)) {
      return next();
    }

    const cacheKey = key(req);
    const cachedData = memoryCache.get(cacheKey);

    if (cachedData) {
      logger.info(`Cache hit for key: ${cacheKey}`);
      res.set('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    // Store original res.json
    const originalJson = res.json;

    // Override res.json to cache the response
    res.json = function(data: any) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        memoryCache.set(cacheKey, data, ttl);
        logger.info(`Cached data for key: ${cacheKey}, TTL: ${ttl}s`);
      }

      res.set('X-Cache', 'MISS');
      return originalJson.call(this, data);
    };

    next();
  };
}

// Cache invalidation helpers
export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    memoryCache.clear();
    logger.info('All cache cleared');
    return;
  }

  const stats = memoryCache.getStats();
  const keysToDelete = stats.keys.filter(key => key.includes(pattern));

  keysToDelete.forEach(key => {
    memoryCache.delete(key);
  });

  logger.info(`Invalidated ${keysToDelete.length} cache entries matching pattern: ${pattern}`);
}

export function invalidateCacheByUserId(userId: string): void {
  invalidateCache(`userId:${userId}`);
}

// Specific cache middleware for different routes
export const userCacheMiddleware = createCacheMiddleware({
  ttl: 600, // 10 minutes
  key: (req) => `user:${req.params.id || req.user?.id}:${req.originalUrl}`,
  condition: (req) => req.method === 'GET'
});

export const fileSystemCacheMiddleware = createCacheMiddleware({
  ttl: 300, // 5 minutes
  key: (req) => `fs:${req.user?.id}:${req.originalUrl}`,
  condition: (req) => req.method === 'GET' && !req.query.nocache
});

export const systemCacheMiddleware = createCacheMiddleware({
  ttl: 3600, // 1 hour for system data
  key: (req) => `system:${req.originalUrl}`,
  condition: (req) => req.method === 'GET'
});

// Cache warming utilities
export async function warmupCache(routes: Array<{ method: string; url: string; data: any }>) {
  routes.forEach(route => {
    const cacheKey = `${route.method}:${route.url}`;
    memoryCache.set(cacheKey, route.data, 3600); // 1 hour default
  });

  logger.info(`Warmed up cache with ${routes.length} entries`);
}

// Export for cleanup on server shutdown
process.on('SIGTERM', () => {
  memoryCache.destroy();
});

process.on('SIGINT', () => {
  memoryCache.destroy();
});