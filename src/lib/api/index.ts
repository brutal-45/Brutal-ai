// Unified API System
// Enterprise-grade API infrastructure for Brutal.ai

// Configuration
export { API_CONFIG, PRIORITY, API_STATUS, API_ERRORS } from './config';
export type { UserTier, RateLimitGroup, Priority } from './config';

// Simple cache implementation
export { 
  LRUCache, 
  responseCache, 
  aiResponseCache, 
  imageCache,
  generateCacheKey,
  hashKey,
  getAllCacheStats,
} from './cache';

// Monitoring
export { 
  metricsStore, 
  trackRequest, 
  recordRateLimitEvent,
  createHealthResponse, 
  createMetricsResponse,
} from './monitoring';

// Rate limiting (simplified exports)
export { 
  checkRateLimit,
  withRateLimit,
  withApiMiddleware,
  addSecurityHeaders,
  validateRequest,
  getUserTier,
  getRequestPriority,
  getClientStats,
  getRateLimitStats,
} from './rate-limiter';
export type { RateLimitResult } from './rate-limiter';
