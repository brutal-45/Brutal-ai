// High-Performance API Configuration
// Enterprise-grade, infinitely scalable configuration

export const API_CONFIG = {
  // Rate Limiting Configuration - Supports millions of users
  rateLimit: {
    // Standard API rate limits per tier (requests per minute)
    free: { requests: 60, windowMs: 60000, burstLimit: 10 },
    basic: { requests: 200, windowMs: 60000, burstLimit: 30 },
    pro: { requests: 600, windowMs: 60000, burstLimit: 100 },
    enterprise: { requests: 5000, windowMs: 60000, burstLimit: 500 },
    
    // AI-specific limits (expensive operations)
    ai: {
      free: { requests: 20, windowMs: 60000, burstLimit: 5 },
      basic: { requests: 100, windowMs: 60000, burstLimit: 15 },
      pro: { requests: 300, windowMs: 60000, burstLimit: 50 },
      enterprise: { requests: 2000, windowMs: 60000, burstLimit: 200 },
    },
    
    // Image generation limits (resource intensive)
    image: {
      free: { requests: 10, windowMs: 60000, burstLimit: 2 },
      basic: { requests: 50, windowMs: 60000, burstLimit: 10 },
      pro: { requests: 150, windowMs: 60000, burstLimit: 30 },
      enterprise: { requests: 1000, windowMs: 60000, burstLimit: 100 },
    },
    
    // Tool-specific limits
    tools: {
      free: { requests: 40, windowMs: 60000, burstLimit: 8 },
      basic: { requests: 150, windowMs: 60000, burstLimit: 25 },
      pro: { requests: 500, windowMs: 60000, burstLimit: 80 },
      enterprise: { requests: 3000, windowMs: 60000, burstLimit: 300 },
    },
  },

  // Caching Configuration - Multi-tier caching strategy
  cache: {
    // L1: Hot cache (in-memory, ultra-fast)
    l1: {
      maxSize: 10000,
      ttlMs: 60000, // 1 minute
    },
    // L2: Warm cache (slightly larger)
    l2: {
      maxSize: 50000,
      ttlMs: 300000, // 5 minutes
    },
    // Response-specific TTLs
    chat: { ttl: 0 }, // No caching for chat (real-time)
    tools: { ttl: 1800000 }, // 30 minutes
    images: { ttl: 86400000 }, // 24 hours
    responses: { ttl: 120000 }, // 2 minutes
    static: { ttl: 3600000 }, // 1 hour
  },

  // Queue Configuration - Handle millions of concurrent requests
  queue: {
    chat: { 
      concurrency: 100, 
      timeout: 60000,
      maxRetries: 3,
      backoffMs: 1000,
    },
    image: { 
      concurrency: 20, 
      timeout: 120000,
      maxRetries: 2,
      backoffMs: 2000,
    },
    tools: { 
      concurrency: 50, 
      timeout: 45000,
      maxRetries: 3,
      backoffMs: 1000,
    },
    batch: {
      maxBatchSize: 10,
      batchWindowMs: 100, // Group requests within 100ms
    },
  },

  // Connection Pool Configuration
  connectionPool: {
    maxConnections: 100,
    minConnections: 10,
    acquireTimeoutMs: 5000,
    idleTimeoutMs: 30000,
    maxQueuedRequests: 1000,
  },

  // Circuit Breaker Configuration
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeoutMs: 30000,
    halfOpenRequests: 3,
  },

  // Performance Targets
  performance: {
    targetLatencyMs: 150,
    maxLatencyMs: 5000,
    healthCheckInterval: 15000,
    metricsInterval: 5000,
    maxMemoryUsage: 0.85, // 85%
  },

  // Auto-scaling triggers
  scaling: {
    scaleUpThreshold: 0.75, // 75% utilization
    scaleDownThreshold: 0.25, // 25% utilization
    cooldownMs: 60000,
    maxInstances: 100,
  },

  // Request limits
  limits: {
    maxBodySize: 10 * 1024 * 1024, // 10MB
    maxPromptLength: 10000,
    maxMessages: 50,
    maxImageBatch: 4,
  },
};

// User tiers
export type UserTier = 'free' | 'basic' | 'pro' | 'enterprise';

// Rate limit groups
export type RateLimitGroup = 'default' | 'ai' | 'image' | 'tools';

// Request priorities
export const PRIORITY = {
  CRITICAL: 0,   // Health checks, system operations
  HIGH: 1,       // Enterprise users, paid tiers
  MEDIUM: 2,     // Pro users
  NORMAL: 3,     // Basic users, standard requests
  LOW: 4,        // Free users
  BACKGROUND: 5, // Background jobs, batch processing
} as const;

export type Priority = typeof PRIORITY[keyof typeof PRIORITY];

// HTTP status codes for API responses
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// Error messages
export const API_ERRORS = {
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later.',
  INVALID_REQUEST: 'Invalid request. Please check your parameters.',
  UNAUTHORIZED: 'Authentication required.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again.',
  TIMEOUT: 'Request timed out. Please try again.',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again later.',
  INVALID_API_KEY: 'Invalid API key.',
} as const;
