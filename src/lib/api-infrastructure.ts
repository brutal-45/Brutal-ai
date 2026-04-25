/**
 * Brutal.ai - High-Capacity Scalable API Infrastructure
 * Handles massive traffic with caching, queuing, and connection pooling
 * Optimized for maximum throughput and unlimited requests
 */

// ==========================================
// 1. HIGH-CAPACITY IN-MEMORY CACHE 
// ==========================================
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 500000; // Increased from 100k to 500k for massive scale
  private cleanupInterval = 60000; // 1 minute cleanup

  constructor() {
    // Auto cleanup
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    entry.hits++;
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number = 3600000): void {
    // LRU eviction with batch removal for efficiency
    if (this.cache.size >= this.maxSize) {
      // Remove 20% of oldest entries for faster cleanup
      const keysToRemove = Array.from(this.cache.keys()).slice(0, Math.floor(this.maxSize * 0.2));
      keysToRemove.forEach(key => this.cache.delete(key));
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
      hits: 0,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  getStats() {
    let totalHits = 0;
    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
    }
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalHits,
    };
  }
}

export const cache = new MemoryCache();

// ==========================================
// 2. HIGH-CAPACITY RATE LIMITER (Token Bucket)
// ==========================================
interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
  requestCount: number;
}

class RateLimiter {
  private buckets = new Map<string, RateLimitBucket>();
  private maxTokens = 5000; // Increased from 1000 to 5000 for unlimited feel
  private refillRate = 500; // 500 tokens per second (increased from 100)
  private refillInterval = 100; // ms
  private cleanupInterval = 300000; // 5 minutes

  constructor() {
    // Cleanup old buckets periodically
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > 600000) { // 10 minutes inactive
        this.buckets.delete(key);
      }
    }
  }

  canProceed(identifier: string): boolean {
    const now = Date.now();
    let bucket = this.buckets.get(identifier);
    
    if (!bucket) {
      bucket = { tokens: this.maxTokens - 1, lastRefill: now, requestCount: 1 };
      this.buckets.set(identifier, bucket);
      return true;
    }
    
    // Refill tokens based on elapsed time
    const elapsed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor(elapsed / this.refillInterval) * this.refillRate / 10;
    bucket.tokens = Math.min(this.maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
    
    if (bucket.tokens >= 1) {
      bucket.tokens--;
      bucket.requestCount++;
      return true;
    }
    
    return false;
  }

  getWaitTime(identifier: string): number {
    const bucket = this.buckets.get(identifier);
    if (!bucket || bucket.tokens >= 1) return 0;
    return Math.ceil((1 - bucket.tokens) * (1000 / this.refillRate));
  }

  getStats() {
    return {
      activeBuckets: this.buckets.size,
      maxTokens: this.maxTokens,
      refillRate: this.refillRate,
    };
  }
}

export const rateLimiter = new RateLimiter();

// ==========================================
// 3. HIGH-THROUGHPUT REQUEST QUEUE
// ==========================================
interface QueueItem<T> {
  id: string;
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  priority: number;
  retries: number;
  maxRetries: number;
  timestamp: number;
  attemptCount: number;
}

class RequestQueue {
  private queue: QueueItem<any>[] = [];
  private processing = 0;
  private maxConcurrent = 500; // Increased from 200 to 500 for massive throughput
  private isProcessing = false;
  private completedCount = 0;
  private errorCount = 0;
  private avgProcessingTime = 0;

  async add<T>(
    id: string,
    execute: () => Promise<T>,
    priority: number = 0,
    maxRetries: number = 10 // Increased from 5 to 10 for more resilience
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const item: QueueItem<T> = {
        id,
        execute,
        resolve,
        reject,
        priority,
        retries: maxRetries,
        maxRetries,
        timestamp: Date.now(),
        attemptCount: 0,
      };
      
      // Insert by priority (higher priority first)
      const insertIndex = this.queue.findIndex(q => q.priority < priority);
      if (insertIndex === -1) {
        this.queue.push(item);
      } else {
        this.queue.splice(insertIndex, 0, item);
      }
      
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.isProcessing && this.processing >= this.maxConcurrent) return;
    this.isProcessing = true;

    while (this.queue.length > 0 && this.processing < this.maxConcurrent) {
      const item = this.queue.shift();
      if (!item) break;

      this.processing++;
      const startTime = Date.now();
      
      (async () => {
        try {
          const result = await this.executeWithRetry(item);
          item.resolve(result);
          this.completedCount++;
          
          // Track average processing time
          const elapsed = Date.now() - startTime;
          this.avgProcessingTime = (this.avgProcessingTime * 0.9) + (elapsed * 0.1);
        } catch (error) {
          item.reject(error as Error);
          this.errorCount++;
        } finally {
          this.processing--;
          this.process();
        }
      })();
    }

    this.isProcessing = false;
  }

  private async executeWithRetry<T>(item: QueueItem<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= item.maxRetries; attempt++) {
      try {
        item.attemptCount++;
        return await item.execute();
      } catch (error) {
        lastError = error as Error;
        if (attempt < item.maxRetries) {
          // Exponential backoff with jitter
          const backoff = Math.min(500 * Math.pow(2, attempt), 10000);
          const jitter = Math.random() * 100;
          await this.sleep(backoff + jitter);
        }
      }
    }
    
    throw lastError || new Error('Max retries exceeded');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      maxConcurrent: this.maxConcurrent,
      completedCount: this.completedCount,
      errorCount: this.errorCount,
      avgProcessingTime: Math.round(this.avgProcessingTime),
    };
  }
}

export const requestQueue = new RequestQueue();

// ==========================================
// 4. HIGH-CAPACITY CONNECTION POOL
// ==========================================
class ConnectionPool {
  private pool: any[] = [];
  private inUse = new Set<any>();
  private maxSize = 500; // Increased from 100 to 500 for massive scale
  private createFn: (() => Promise<any>) | null = null;
  private waitQueue: Array<(conn: any) => void> = [];

  async initialize(createFn: () => Promise<any>): Promise<void> {
    this.createFn = createFn;
    // Pre-warm more connections for high traffic
    const prewarmCount = Math.min(50, this.maxSize);
    const promises = [];
    
    for (let i = 0; i < prewarmCount; i++) {
      promises.push(
        this.createFn().then(conn => {
          this.pool.push(conn);
        }).catch(() => {})
      );
    }
    
    await Promise.allSettled(promises);
  }

  async acquire(): Promise<any> {
    // Return from pool if available
    if (this.pool.length > 0) {
      const conn = this.pool.pop()!;
      this.inUse.add(conn);
      return conn;
    }
    
    // Create new if under limit
    if (this.inUse.size < this.maxSize && this.createFn) {
      const conn = await this.createFn();
      this.inUse.add(conn);
      return conn;
    }
    
    // Wait for connection to be released
    return new Promise((resolve) => {
      this.waitQueue.push(resolve);
    });
  }

  release(conn: any): void {
    this.inUse.delete(conn);
    
    // Serve waiting requests first
    if (this.waitQueue.length > 0) {
      const next = this.waitQueue.shift()!;
      this.inUse.add(conn);
      next(conn);
      return;
    }
    
    // Return to pool
    if (this.pool.length < this.maxSize) {
      this.pool.push(conn);
    }
  }

  clear(): void {
    this.pool = [];
    this.inUse.clear();
    this.waitQueue = [];
  }

  stats() {
    return {
      available: this.pool.length,
      inUse: this.inUse.size,
      maxSize: this.maxSize,
      waiting: this.waitQueue.length,
    };
  }
}

export const connectionPool = new ConnectionPool();

// ==========================================
// 5. RESILIENT CIRCUIT BREAKER
// ==========================================
type CircuitState = 'closed' | 'open' | 'half-open';

class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failures = 0;
  private successes = 0;
  private lastFailureTime = 0;
  private threshold = 50; // Increased from 20 to 50 before opening
  private resetTimeout = 5000; // Reduced from 10s to 5s
  private halfOpenMaxRequests = 10;

  canExecute(): boolean {
    if (this.state === 'closed') return true;
    
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'half-open';
        this.successes = 0;
        return true;
      }
      return false;
    }
    
    // half-open: allow limited requests
    return this.successes < this.halfOpenMaxRequests;
  }

  recordSuccess(): void {
    this.successes++;
    
    if (this.state === 'half-open' && this.successes >= this.halfOpenMaxRequests) {
      this.failures = 0;
      this.state = 'closed';
    } else if (this.state === 'closed') {
      this.failures = Math.max(0, this.failures - 1); // Gradually recover
    }
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getStats() {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      threshold: this.threshold,
    };
  }
}

export const circuitBreaker = new CircuitBreaker();

// ==========================================
// 6. REQUEST DEDUPLICATION & COALESCING
// ==========================================
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();
  private stats = { deduped: 0, total: 0 };

  async dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
    this.stats.total++;
    
    const existing = this.pendingRequests.get(key);
    if (existing) {
      this.stats.deduped++;
      return existing as Promise<T>;
    }

    const promise = fn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  clear(): void {
    this.pendingRequests.clear();
  }

  getStats() {
    return {
      ...this.stats,
      pending: this.pendingRequests.size,
    };
  }
}

export const requestDeduplicator = new RequestDeduplicator();

// ==========================================
// 7. BATCH PROCESSOR FOR IMAGES
// ==========================================
interface BatchItem<T, R> {
  input: T;
  resolve: (value: R) => void;
  reject: (error: Error) => void;
}

class BatchProcessor<T, R> {
  private batch: BatchItem<T, R>[] = [];
  private processing = false;
  private batchSize = 10;
  private batchTimeout = 50; // ms
  private processor: (items: T[]) => Promise<R[]>;

  constructor(processor: (items: T[]) => Promise<R[]>) {
    this.processor = processor;
  }

  async add(input: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.batch.push({ input, resolve, reject });
      
      if (this.batch.length >= this.batchSize) {
        this.processBatch();
      } else {
        // Schedule batch processing
        setTimeout(() => this.processBatch(), this.batchTimeout);
      }
    });
  }

  private async processBatch(): Promise<void> {
    if (this.processing || this.batch.length === 0) return;
    
    this.processing = true;
    const currentBatch = this.batch.splice(0, this.batchSize);
    
    try {
      const inputs = currentBatch.map(item => item.input);
      const results = await this.processor(inputs);
      
      currentBatch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      currentBatch.forEach(item => {
        item.reject(error as Error);
      });
    }
    
    this.processing = false;
    
    // Process remaining items
    if (this.batch.length > 0) {
      setTimeout(() => this.processBatch(), 0);
    }
  }
}

export function createBatchProcessor<T, R>(
  processor: (items: T[]) => Promise<R[]>
): BatchProcessor<T, R> {
  return new BatchProcessor(processor);
}

// ==========================================
// 8. PARALLEL EXECUTION HELPER
// ==========================================
export async function parallelExecute<T, R>(
  items: T[],
  executor: (item: T) => Promise<R>,
  concurrency: number = 10
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];
  
  for (const item of items) {
    const promise = executor(item).then(result => {
      results.push(result);
    });
    
    executing.push(promise);
    
    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }
  
  await Promise.all(executing);
  return results;
}

// ==========================================
// 9. UTILITY FUNCTIONS
// ==========================================
export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function getCacheKey(prefix: string, ...parts: string[]): string {
  return `${prefix}:${parts.map(p => hashString(p)).join(':')}`;
}

// ==========================================
// 10. SYSTEM STATS AGGREGATOR
// ==========================================
export function getSystemStats() {
  return {
    timestamp: Date.now(),
    cache: cache.getStats(),
    rateLimiter: rateLimiter.getStats(),
    queue: requestQueue.getStats(),
    connectionPool: connectionPool.stats(),
    circuitBreaker: circuitBreaker.getStats(),
    deduplicator: requestDeduplicator.getStats(),
  };
}
