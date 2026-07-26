// High-Performance Caching System
// In-memory cache with TTL, LRU eviction, and stats

interface CacheEntry<T> {
  value: T;
  expiry: number;
  lastAccessed: number;
  hits: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  hitRate: number;
}

// LRU Cache implementation
export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private stats = { hits: 0, misses: 0 };

  constructor(maxSize: number = 10000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    // Check expiry
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // Update access stats
    entry.lastAccessed = Date.now();
    entry.hits++;
    this.stats.hits++;
    
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    return entry.value;
  }

  set(key: string, value: T, ttlMs: number = 3600000): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlMs,
      lastAccessed: Date.now(),
      hits: 0,
    });
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  }

  private evictOldest(): void {
    const entriesToDelete = Math.ceil(this.maxSize * 0.1);
    let deleted = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (deleted >= entriesToDelete) break;
      
      if (Date.now() > entry.expiry || entry.hits < 2) {
        this.cache.delete(key);
        deleted++;
      }
    }
    
    if (this.cache.size >= this.maxSize) {
      const entries = [...this.cache.entries()]
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      
      for (let i = 0; i < entriesToDelete && i < entries.length; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }
}

// Global cache instances
export const responseCache = new LRUCache<Response>(5000);
export const aiResponseCache = new LRUCache<string>(2000);
export const imageCache = new LRUCache<string>(1000);

// Cache key generator
export function generateCacheKey(
  prefix: string,
  data: Record<string, unknown>
): string {
  const sorted = Object.keys(data)
    .sort()
    .map(key => `${key}=${JSON.stringify(data[key])}`)
    .join('&');
  return `${prefix}:${sorted}`;
}

// Hash function for cache keys
export function hashKey(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Cached fetch wrapper
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 60000
): Promise<T> {
  const cached = aiResponseCache.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const result = await fetcher();
  aiResponseCache.set(key, JSON.stringify(result), ttlMs);
  return result;
}

// Deduplication
const pendingRequests = new Map<string, Promise<unknown>>();

export async function dedupeRequest<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 60000
): Promise<T> {
  const cached = aiResponseCache.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const pending = pendingRequests.get(key) as Promise<T> | undefined;
  if (pending) {
    return pending;
  }
  
  const promise = fetcher().then(result => {
    aiResponseCache.set(key, JSON.stringify(result), ttlMs);
    pendingRequests.delete(key);
    return result;
  });
  
  pendingRequests.set(key, promise);
  return promise;
}

// Get all cache stats
export function getAllCacheStats(): Record<string, CacheStats> {
  return {
    response: responseCache.getStats(),
    ai: aiResponseCache.getStats(),
    image: imageCache.getStats(),
  };
}
