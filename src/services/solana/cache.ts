/**
 * Onfolio — Blockchain Data Layer Cache
 *
 * In-memory TTL-based cache designed to prevent redundant network and RPC requests,
 * reduce rate-limiting pressure on public Solana clusters, and provide fast UI responses.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

export class OnchainDataCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private maxEntries: number;

  constructor(maxEntries = 500) {
    this.maxEntries = maxEntries;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T, ttlMs = 30_000): void {
    if (this.cache.size >= this.maxEntries) {
      // Evict oldest 20% of entries when approaching cap
      const keysToEvict = Array.from(this.cache.keys()).slice(0, Math.floor(this.maxEntries * 0.2));
      for (const k of keysToEvict) {
        this.cache.delete(k);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs,
    });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(prefix?: string): void {
    if (!prefix) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs = 30_000
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await fetcher();
    this.set<T>(key, fresh, ttlMs);
    return fresh;
  }

  size(): number {
    return this.cache.size;
  }
}

/** Global shared cache singleton for onchain data */
export const onchainCache = new OnchainDataCache();
