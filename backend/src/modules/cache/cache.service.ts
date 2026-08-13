import { logger } from '../../utils/logger.js';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class CacheService {
  private memoryCache = new Map<string, CacheEntry<unknown>>();

  /**
   * Retrieve cached item by key if not expired.
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set item in cache with TTL in seconds (default 1 hour).
   */
  async set<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.memoryCache.set(key, { value, expiresAt });
  }

  /**
   * Delete item from cache.
   */
  async del(key: string): Promise<void> {
    this.memoryCache.delete(key);
  }

  /**
   * Clear all items from cache.
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    logger.info('🧹 Cache cleared completely');
  }

  /**
   * Wrap an async operation with caching.
   */
  async wrap<T>(key: string, fetcher: () => Promise<T>, ttlSeconds: number = 3600): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      logger.debug({ key }, '⚡ Cache hit');
      return cached;
    }

    logger.debug({ key }, '🐢 Cache miss, fetching fresh data');
    const fresh = await fetcher();
    if (fresh !== undefined && fresh !== null) {
      await this.set(key, fresh, ttlSeconds);
    }
    return fresh;
  }
}

export const cacheService = new CacheService();
