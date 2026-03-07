// AI SDK Connection Pool Manager
// Manages connections efficiently for high-traffic scenarios

import ZAI from 'z-ai-web-dev-sdk';

interface PooledConnection {
  id: string;
  zai: Awaited<ReturnType<typeof ZAI.create>>;
  createdAt: number;
  lastUsed: number;
  inUse: boolean;
  requestCount: number;
}

interface ConnectionPoolStats {
  total: number;
  active: number;
  idle: number;
  queuedRequests: number;
  avgRequestTime: number;
}

interface PoolConfig {
  maxConnections: number;
  minConnections: number;
  acquireTimeoutMs: number;
  idleTimeoutMs: number;
  maxQueuedRequests: number;
}

interface QueuedRequest {
  resolve: (conn: PooledConnection) => void;
  reject: (error: Error) => void;
  timestamp: number;
  priority: number;
}

// Connection Pool for AI SDK
export class AIConnectionPool {
  private connections: Map<string, PooledConnection> = new Map();
  private queue: QueuedRequest[] = [];
  private requestId = 0;
  private stats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalRequestTime: 0,
  };
  private cleanupInterval: NodeJS.Timeout | null = null;
  private config: PoolConfig;

  constructor(config: Partial<PoolConfig> = {}) {
    this.config = {
      maxConnections: config.maxConnections || 100,
      minConnections: config.minConnections || 10,
      acquireTimeoutMs: config.acquireTimeoutMs || 5000,
      idleTimeoutMs: config.idleTimeoutMs || 30000,
      maxQueuedRequests: config.maxQueuedRequests || 1000,
    };

    // Start cleanup interval
    this.startCleanup();
    
    // Initialize minimum connections
    this.initializeMinConnections();
  }

  private async initializeMinConnections(): Promise<void> {
    const promises: Promise<void>[] = [];
    for (let i = 0; i < this.config.minConnections; i++) {
      promises.push(this.createConnection());
    }
    await Promise.all(promises);
  }

  private async createConnection(): Promise<void> {
    try {
      const zai = await ZAI.create();
      const id = `conn_${Date.now()}_${++this.requestId}`;
      
      this.connections.set(id, {
        id,
        zai,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        inUse: false,
        requestCount: 0,
      });
    } catch (error) {
      console.error('Failed to create connection:', error);
    }
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleConnections();
    }, 30000);
  }

  private cleanupIdleConnections(): void {
    const now = Date.now();
    const idsToRemove: string[] = [];

    for (const [id, conn] of this.connections.entries()) {
      // Don't remove if in use or if we're at minimum connections
      if (conn.inUse) continue;
      if (this.connections.size <= this.config.minConnections) break;

      // Remove if idle for too long
      if (now - conn.lastUsed > this.config.idleTimeoutMs) {
        idsToRemove.push(id);
      }
    }

    for (const id of idsToRemove) {
      this.connections.delete(id);
    }

    // Ensure minimum connections
    const deficit = this.config.minConnections - this.connections.size;
    for (let i = 0; i < deficit; i++) {
      this.createConnection();
    }
  }

  async acquire(priority: number = 3): Promise<PooledConnection> {
    // Find available connection
    for (const conn of this.connections.values()) {
      if (!conn.inUse) {
        conn.inUse = true;
        conn.lastUsed = Date.now();
        return conn;
      }
    }

    // Create new connection if under limit
    if (this.connections.size < this.config.maxConnections) {
      await this.createConnection();
      
      // Find the new connection
      for (const conn of this.connections.values()) {
        if (!conn.inUse) {
          conn.inUse = true;
          conn.lastUsed = Date.now();
          return conn;
        }
      }
    }

    // Queue the request
    if (this.queue.length >= this.config.maxQueuedRequests) {
      throw new Error('Connection pool exhausted. Please try again later.');
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        const index = this.queue.findIndex(r => r.resolve === resolve);
        if (index !== -1) {
          this.queue.splice(index, 1);
          reject(new Error('Connection acquire timeout'));
        }
      }, this.config.acquireTimeoutMs);

      this.queue.push({
        resolve: (conn) => {
          clearTimeout(timeoutId);
          resolve(conn);
        },
        reject: (err) => {
          clearTimeout(timeoutId);
          reject(err);
        },
        timestamp: Date.now(),
        priority,
      });

      // Sort by priority (lower number = higher priority)
      this.queue.sort((a, b) => a.priority - b.priority);
    });
  }

  release(connection: PooledConnection): void {
    connection.inUse = false;
    connection.lastUsed = Date.now();

    // Process queue
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) {
        connection.inUse = true;
        next.resolve(connection);
      }
    }
  }

  async execute<T>(
    fn: (zai: Awaited<ReturnType<typeof ZAI.create>>) => Promise<T>,
    priority: number = 3
  ): Promise<T> {
    const startTime = Date.now();
    const conn = await this.acquire(priority);

    try {
      conn.requestCount++;
      const result = await fn(conn.zai);
      
      this.stats.successfulRequests++;
      this.stats.totalRequestTime += Date.now() - startTime;
      
      return result;
    } catch (error) {
      this.stats.failedRequests++;
      throw error;
    } finally {
      this.stats.totalRequests++;
      this.release(conn);
    }
  }

  getStats(): ConnectionPoolStats {
    let active = 0;
    let idle = 0;

    for (const conn of this.connections.values()) {
      if (conn.inUse) active++;
      else idle++;
    }

    return {
      total: this.connections.size,
      active,
      idle,
      queuedRequests: this.queue.length,
      avgRequestTime: this.stats.totalRequests > 0
        ? this.stats.totalRequestTime / this.stats.successfulRequests
        : 0,
    };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.connections.clear();
    this.queue.forEach(r => r.reject(new Error('Pool destroyed')));
    this.queue = [];
  }
}

// Singleton instance
let globalPool: AIConnectionPool | null = null;

export function getConnectionPool(): AIConnectionPool {
  if (!globalPool) {
    globalPool = new AIConnectionPool({
      maxConnections: 100,
      minConnections: 10,
      acquireTimeoutMs: 5000,
      idleTimeoutMs: 30000,
      maxQueuedRequests: 1000,
    });
  }
  return globalPool;
}

// Helper function for AI operations
export async function withAIConnection<T>(
  fn: (zai: Awaited<ReturnType<typeof ZAI.create>>) => Promise<T>,
  priority: number = 3
): Promise<T> {
  const pool = getConnectionPool();
  return pool.execute(fn, priority);
}
