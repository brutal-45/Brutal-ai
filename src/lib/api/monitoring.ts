// Monitoring and Health Check System
// Real-time metrics, health checks, and performance monitoring

interface RequestRecord {
  endpoint: string;
  latency: number;
  success: boolean;
  timestamp: number;
}

interface RequestTracker {
  end: (success: boolean) => void;
}

// Metrics store
class MetricsStore {
  private requests: RequestRecord[] = [];
  private rateLimitEvents: Array<{ type: string; timestamp: number }> = [];
  private startTime = Date.now();

  // Track a request
  trackRequest(endpoint: string): RequestTracker {
    const start = Date.now();
    
    return {
      end: (success: boolean) => {
        const latency = Date.now() - start;
        this.requests.push({ endpoint, latency, success, timestamp: Date.now() });
        
        // Keep last 100k requests
        if (this.requests.length > 100000) {
          this.requests = this.requests.slice(-50000);
        }
      },
    };
  }

  // Record rate limit event
  recordRateLimitEvent(type: 'triggered' | 'blocked'): void {
    this.rateLimitEvents.push({ type, timestamp: Date.now() });
    
    if (this.rateLimitEvents.length > 10000) {
      this.rateLimitEvents = this.rateLimitEvents.slice(-5000);
    }
  }

  // Get stats for time window
  getStats(windowMs: number = 60000) {
    const now = Date.now();
    const cutoff = now - windowMs;
    const recentRequests = this.requests.filter(r => r.timestamp >= cutoff);
    
    const total = recentRequests.length;
    const errors = recentRequests.filter(r => !r.success).length;
    const latencies = recentRequests.map(r => r.latency);
    
    const avgLatency = latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : 0;

    // Calculate percentiles
    const sorted = [...latencies].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;

    return {
      requests: { total, errors, avgLatency, p50, p95, p99 },
      rateLimits: {
        triggered: this.rateLimitEvents.filter(e => e.type === 'triggered' && e.timestamp >= cutoff).length,
        blocked: this.rateLimitEvents.filter(e => e.type === 'blocked' && e.timestamp >= cutoff).length,
      },
    };
  }

  // Get health status
  getHealth() {
    const stats = this.getStats();
    const memoryUsage = process.memoryUsage();
    
    const errorRate = stats.requests.total > 0 
      ? stats.requests.errors / stats.requests.total 
      : 0;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (errorRate > 0.05 || memoryUsage.heapUsed / memoryUsage.heapTotal > 0.9) {
      status = 'unhealthy';
    } else if (errorRate > 0.01 || memoryUsage.heapUsed / memoryUsage.heapTotal > 0.8) {
      status = 'degraded';
    }

    return {
      status,
      uptime: Date.now() - this.startTime,
      timestamp: Date.now(),
      version: '2.4.1',
      metrics: {
        errorRate,
        avgLatency: stats.requests.avgLatency,
        requestsPerMinute: stats.requests.total,
        memoryUsage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
      },
    };
  }
}

// Global instance
export const metricsStore = new MetricsStore();

// Track request helper
export function trackRequest(endpoint: string): RequestTracker {
  return metricsStore.trackRequest(endpoint);
}

// Health response
export function createHealthResponse() {
  return metricsStore.getHealth();
}

// Metrics response
export function createMetricsResponse() {
  return {
    ...metricsStore.getStats(),
    health: metricsStore.getHealth(),
    system: {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      nodeVersion: process.version,
    },
  };
}

// Rate limit event recorder
export function recordRateLimitEvent(type: 'triggered' | 'blocked'): void {
  metricsStore.recordRateLimitEvent(type);
}
