/**
 * Lightweight in-memory cache for API responses.
 * Prevents redundant network calls when navigating between screens.
 *
 * Usage:
 *   const data = await cachedFetch("profile", () => fetch(...).then(r => r.json()), 30_000);
 *   invalidateCache("profile"); // call after mutations
 */

interface CacheEntry {
  data: any;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * Fetch with cache.
 * @param key      Unique cache key
 * @param fetcher  Async function that returns the data
 * @param ttl      Time-to-live in ms (default 30s)
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 30_000
): Promise<T> {
  const now = Date.now();
  const entry = cache.get(key);

  if (entry && entry.expiresAt > now) {
    return entry.data as T;
  }

  const data = await fetcher();
  cache.set(key, { data, expiresAt: now + ttl });
  return data;
}

/** Remove a specific cache entry (call after mutations) */
export function invalidateCache(key: string) {
  cache.delete(key);
}

/** Remove all entries matching a prefix */
export function invalidateCachePrefix(prefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

/** Clear everything */
export function clearCache() {
  cache.clear();
}
