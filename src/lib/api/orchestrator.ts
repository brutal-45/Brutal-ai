// Request Orchestrator
// Load balancing, circuit breaker, and retry logic for infinite scalability

import { PRIORITY } from './config';
import { getConnectionPool } from './connection-pool';

// Circuit breaker states
type CircuitState = 'closed' | 'open' | 'half-open';

interface CircuitBreaker {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure: number;
  lastSuccess: number;
  nextAttempt: number;
}

interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

interface LoadBalancerStats {
  requests: {
    total: number;
    successful: number;
    failed: number;
    retried: number;
  };
  circuitBreakers: Map<string, CircuitBreaker>;
  avgLatency: number;
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
};

// Circuit breaker configuration
const CIRCUIT_BREAKER_CONFIG = {
  failureThreshold: 5,
  successThreshold: 3,
  resetTimeoutMs: 30000,
};

// Global state
const circuitBreakers = new Map<string, CircuitBreaker>();
const stats = {
  requests: { total: 0, successful: 0, failed: 0, retried: 0 },
  totalLatency: 0,
};

// Get or create circuit breaker
function getCircuitBreaker(service: string): CircuitBreaker {
  let cb = circuitBreakers.get(service);
  
  if (!cb) {
    cb = {
      state: 'closed',
      failures: 0,
      successes: 0,
      lastFailure: 0,
      lastSuccess: 0,
      nextAttempt: 0,
    };
    circuitBreakers.set(service, cb);
  }
  
  return cb;
}

// Check if circuit allows request
function canAttempt(cb: CircuitBreaker): boolean {
  const now = Date.now();
  
  switch (cb.state) {
    case 'closed':
      return true;
    case 'open':
      if (now >= cb.nextAttempt) {
        cb.state = 'half-open';
        return true;
      }
      return false;
    case 'half-open':
      return true;
  }
}

// Record result in circuit breaker
function recordResult(cb: CircuitBreaker, success: boolean): void {
  const now = Date.now();
  
  if (success) {
    cb.successes++;
    cb.lastSuccess = now;
    
    if (cb.state === 'half-open' && cb.successes >= CIRCUIT_BREAKER_CONFIG.successThreshold) {
      cb.state = 'closed';
      cb.failures = 0;
      cb.successes = 0;
    }
  } else {
    cb.failures++;
    cb.lastFailure = now;
    cb.successes = 0;
    
    if (cb.failures >= CIRCUIT_BREAKER_CONFIG.failureThreshold) {
      cb.state = 'open';
      cb.nextAttempt = now + CIRCUIT_BREAKER_CONFIG.resetTimeoutMs;
    }
  }
}

// Exponential backoff delay
function getRetryDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt);
  return Math.min(delay, config.maxDelayMs);
}

// Sleep utility
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Execute with circuit breaker and retry
export async function executeWithResilience<T>(
  service: string,
  fn: () => Promise<T>,
  options: {
    priority?: number;
    retry?: Partial<RetryConfig>;
    timeout?: number;
  } = {}
): Promise<T> {
  const { priority = PRIORITY.NORMAL, retry = {}, timeout = 30000 } = options;
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retry };
  
  const cb = getCircuitBreaker(service);
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    // Check circuit breaker
    if (!canAttempt(cb)) {
      throw new Error(`Service ${service} is currently unavailable (circuit open)`);
    }
    
    // Apply backoff delay for retries
    if (attempt > 0) {
      const delay = getRetryDelay(attempt - 1, retryConfig);
      await sleep(delay);
      stats.requests.retried++;
    }
    
    try {
      const startTime = Date.now();
      
      // Execute with timeout
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeout);
        }),
      ]);
      
      const latency = Date.now() - startTime;
      stats.totalLatency += latency;
      stats.requests.successful++;
      recordResult(cb, true);
      
      return result;
    } catch (error) {
      lastError = error as Error;
      recordResult(cb, false);
    }
  }
  
  stats.requests.failed++;
  throw lastError || new Error(`All retry attempts failed for ${service}`);
}

// Priority queue for request ordering
interface QueuedRequest<T> {
  id: string;
  execute: () => Promise<T>;
  priority: number;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

// Request scheduler with priority
export class RequestScheduler {
  private queue: QueuedRequest<unknown>[] = [];
  private processing = new Set<Promise<unknown>>();
  private maxConcurrent: number;
  private isProcessing = false;
  private requestCounter = 0;

  constructor(maxConcurrent: number = 100) {
    this.maxConcurrent = maxConcurrent;
  }

  schedule<T>(
    execute: () => Promise<T>,
    priority: number = PRIORITY.NORMAL
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        id: `req_${++this.requestCounter}`,
        execute: execute as () => Promise<unknown>,
        priority,
        resolve: resolve as (value: unknown) => void,
        reject,
        timestamp: Date.now(),
      });

      // Sort by priority (lower = higher priority)
      this.queue.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.timestamp - b.timestamp;
      });

      this.process();
    });
  }

  private process(): void {
    if (this.isProcessing) return;
    this.isProcessing = true;

    this.processNext();
  }

  private processNext(): void {
    while (this.queue.length > 0 && this.processing.size < this.maxConcurrent) {
      const request = this.queue.shift();
      if (!request) break;

      const promise = this.executeRequest(request);
      this.processing.add(promise);
    }

    this.isProcessing = this.processing.size > 0;
  }

  private async executeRequest<T>(request: QueuedRequest<T>): Promise<void> {
    try {
      stats.requests.total++;
      const result = await request.execute();
      request.resolve(result);
    } catch (error) {
      request.reject(error as Error);
    } finally {
      this.processing.delete(Promise.resolve());
      if (this.queue.length > 0) {
        this.processNext();
      }
    }
  }

  getStats(): { queued: number; processing: number } {
    return {
      queued: this.queue.length,
      processing: this.processing.size,
    };
  }
}

// Global scheduler instance
let globalScheduler: RequestScheduler | null = null;

export function getScheduler(): RequestScheduler {
  if (!globalScheduler) {
    globalScheduler = new RequestScheduler(100);
  }
  return globalScheduler;
}

// Batch request processor
interface BatchItem<T, R> {
  input: T;
  resolve: (result: R) => void;
  reject: (error: Error) => void;
}

export class BatchProcessor<T, R> {
  private batch: BatchItem<T, R>[] = [];
  private batchWindowMs: number;
  private maxBatchSize: number;
  private processor: (items: T[]) => Promise<R[]>;
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(
    processor: (items: T[]) => Promise<R[]>,
    options: { batchWindowMs?: number; maxBatchSize?: number } = {}
  ) {
    this.processor = processor;
    this.batchWindowMs = options.batchWindowMs || 100;
    this.maxBatchSize = options.maxBatchSize || 10;
  }

  add(input: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.batch.push({ input, resolve, reject });

      // Start batch timer if not already started
      if (!this.timer && !this.isProcessing) {
        this.timer = setTimeout(() => this.processBatch(), this.batchWindowMs);
      }

      // Process immediately if batch is full
      if (this.batch.length >= this.maxBatchSize) {
        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
        }
        this.processBatch();
      }
    });
  }

  private async processBatch(): Promise<void> {
    if (this.isProcessing || this.batch.length === 0) return;
    
    this.isProcessing = true;
    const items = this.batch.splice(0, this.maxBatchSize);
    
    try {
      const inputs = items.map(item => item.input);
      const results = await this.processor(inputs);
      
      items.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      items.forEach(item => {
        item.reject(error as Error);
      });
    } finally {
      this.isProcessing = false;
      
      // Process remaining items
      if (this.batch.length > 0) {
        this.timer = setTimeout(() => this.processBatch(), this.batchWindowMs);
      }
    }
  }
}

// AI request batch processor
export function createAIBatchProcessor(): BatchProcessor<
  Array<{ role: string; content: string }>,
  string
> {
  return new BatchProcessor(
    async (messagesBatch) => {
      const pool = getConnectionPool();
      
      // Process in parallel
      const results = await Promise.all(
        messagesBatch.map(async (messages) => {
          try {
            return await pool.execute(async (zai) => {
              const completion = await zai.chat.completions.create({
                messages: messages.map(m => ({
                  role: m.role as 'user' | 'assistant' | 'system',
                  content: m.content,
                })),
              });
              return completion.choices[0]?.message?.content || '';
            });
          } catch {
            return '';
          }
        })
      );
      
      return results;
    },
    { batchWindowMs: 50, maxBatchSize: 5 }
  );
}

// Get orchestrator stats
export function getOrchestratorStats(): LoadBalancerStats {
  return {
    requests: { ...stats.requests },
    circuitBreakers: new Map(circuitBreakers),
    avgLatency: stats.requests.successful > 0
      ? stats.totalLatency / stats.requests.successful
      : 0,
  };
}
