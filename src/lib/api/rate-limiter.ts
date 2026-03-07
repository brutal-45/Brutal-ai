// High-Performance Rate Limiter
// Token bucket + sliding window algorithm for massive scale
// Supports millions of concurrent users with fair distribution

import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG, UserTier, RateLimitGroup, PRIORITY } from './config';

// Rate limit result type
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  limit: number;
  burstRemaining?: number;
}

// Token bucket for burst handling
interface TokenBucket {
  tokens: number;
  maxTokens: number;
  refillRate: number; // tokens per ms
  lastRefill: number;
}

// Sliding window entry
interface SlidingWindowEntry {
  timestamps: number[];
  resetTime: number;
}

// Client entry combining both algorithms
interface ClientEntry {
  slidingWindow: SlidingWindowEntry;
  tokenBucket: TokenBucket;
  tier: UserTier;
  firstSeen: number;
  requestCount: number;
  blocked: boolean;
  blockedUntil: number;
}

// Global stores
const clientStore = new Map<string, ClientEntry>();
const abuseList = new Map<string, { strikes: number; blockedUntil: number }>();

// Configuration
const BURST_REFILL_RATE = 0.1; // tokens per ms (6 tokens per second)
const ABUSE_THRESHOLD = 10;
const ABUSE_BLOCK_TIME = 300000; // 5 minutes

// Cleanup interval
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    
    // Clean up expired entries
    for (const [key, entry] of clientStore.entries()) {
      if (entry.slidingWindow.resetTime < now && entry.slidingWindow.timestamps.length === 0) {
        clientStore.delete(key);
      }
    }
    
    // Clean up abuse list
    for (const [key, entry] of abuseList.entries()) {
      if (entry.blockedUntil < now) {
        abuseList.delete(key);
      }
    }
  }, 60000);
}

// Get client identifier
function getClientId(request: NextRequest): string {
  // Priority: User ID > API Key > IP + User Agent hash
  const userId = request.headers.get('x-user-id');
  if (userId) return `user:${userId}`;
  
  const apiKey = request.headers.get('x-api-key');
  if (apiKey) return `key:${apiKey.slice(0, 16)}`;
  
  // Fall back to IP + user agent fingerprint
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || '';
  const uaHash = hashCode(userAgent).toString(36);
  
  return `ip:${ip}:${uaHash}`;
}

// Simple hash function
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Get user tier from request
function getUserTier(request: NextRequest): UserTier {
  const tier = request.headers.get('x-user-tier') as UserTier;
  return ['free', 'basic', 'pro', 'enterprise'].includes(tier) ? tier : 'free';
}

// Get priority from request
function getRequestPriority(request: NextRequest): number {
  const priority = request.headers.get('x-priority');
  if (priority !== null) {
    const parsed = parseInt(priority, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 5) {
      return parsed;
    }
  }
  
  // Infer from tier
  const tier = getUserTier(request);
  switch (tier) {
    case 'enterprise': return PRIORITY.HIGH;
    case 'pro': return PRIORITY.MEDIUM;
    case 'basic': return PRIORITY.NORMAL;
    default: return PRIORITY.LOW;
  }
}

// Get rate limit config for group and tier
function getRateLimitConfig(group: RateLimitGroup, tier: UserTier) {
  const configs = {
    ai: API_CONFIG.rateLimit.ai,
    image: API_CONFIG.rateLimit.image,
    tools: API_CONFIG.rateLimit.tools,
    default: API_CONFIG.rateLimit,
  };
  
  const config = configs[group] || configs.default;
  return config[tier] || config.free;
}

// Refill token bucket
function refillBucket(bucket: TokenBucket): void {
  const now = Date.now();
  const elapsed = now - bucket.lastRefill;
  const refill = elapsed * bucket.refillRate;
  
  bucket.tokens = Math.min(bucket.maxTokens, bucket.tokens + refill);
  bucket.lastRefill = now;
}

// Check rate limit using hybrid token bucket + sliding window
export function checkRateLimit(
  request: NextRequest,
  group: RateLimitGroup = 'default'
): RateLimitResult {
  const clientId = getClientId(request);
  const tier = getUserTier(request);
  const now = Date.now();
  
  // Check abuse list
  const abuse = abuseList.get(clientId);
  if (abuse && abuse.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: abuse.blockedUntil,
      retryAfter: Math.ceil((abuse.blockedUntil - now) / 1000),
      limit: 0,
      burstRemaining: 0,
    };
  }
  
  // Get or create client entry
  let entry = clientStore.get(clientId);
  const config = getRateLimitConfig(group, tier);
  
  if (!entry) {
    // Create new entry
    entry = {
      slidingWindow: {
        timestamps: [],
        resetTime: now + config.windowMs,
      },
      tokenBucket: {
        tokens: config.burstLimit,
        maxTokens: config.burstLimit,
        refillRate: config.burstLimit / config.windowMs,
        lastRefill: now,
      },
      tier,
      firstSeen: now,
      requestCount: 0,
      blocked: false,
      blockedUntil: 0,
    };
    clientStore.set(clientId, entry);
  }
  
  // Refill token bucket
  refillBucket(entry.tokenBucket);
  
  // Clean old timestamps in sliding window
  const windowStart = now - config.windowMs;
  entry.slidingWindow.timestamps = entry.slidingWindow.timestamps.filter(t => t > windowStart);
  
  // Check if window should reset
  if (entry.slidingWindow.resetTime <= now) {
    entry.slidingWindow.timestamps = [];
    entry.slidingWindow.resetTime = now + config.windowMs;
  }
  
  // Check sliding window limit
  const windowCount = entry.slidingWindow.timestamps.length;
  
  if (windowCount >= config.requests) {
    const retryAfter = Math.ceil((entry.slidingWindow.resetTime - now) / 1000);
    
    // Track abuse
    const abuse = abuseList.get(clientId) || { strikes: 0, blockedUntil: 0 };
    abuse.strikes++;
    if (abuse.strikes >= ABUSE_THRESHOLD) {
      abuse.blockedUntil = now + ABUSE_BLOCK_TIME;
    }
    abuseList.set(clientId, abuse);
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.slidingWindow.resetTime,
      retryAfter,
      limit: config.requests,
      burstRemaining: Math.floor(entry.tokenBucket.tokens),
    };
  }
  
  // Check burst limit (token bucket)
  let burstRemaining = Math.floor(entry.tokenBucket.tokens);
  
  if (entry.tokenBucket.tokens < 1) {
    // Burst exhausted, but sliding window allows - use queue
    burstRemaining = 0;
  }
  
  // Allow request
  entry.slidingWindow.timestamps.push(now);
  entry.tokenBucket.tokens = Math.max(0, entry.tokenBucket.tokens - 1);
  entry.requestCount++;
  
  return {
    allowed: true,
    remaining: config.requests - entry.slidingWindow.timestamps.length,
    resetTime: entry.slidingWindow.resetTime,
    limit: config.requests,
    burstRemaining,
  };
}

// Rate limit middleware factory
export function withRateLimit(group: RateLimitGroup = 'default') {
  return function(
    handler: (request: NextRequest) => Promise<NextResponse>
  ): (request: NextRequest) => Promise<NextResponse> {
    return async function(request: NextRequest): Promise<NextResponse> {
      const result = checkRateLimit(request, group);
      const tier = getUserTier(request);
      const priority = getRequestPriority(request);
      
      // Add rate limit headers helper
      const addHeaders = (response: NextResponse): NextResponse => {
        response.headers.set('X-RateLimit-Limit', String(result.limit));
        response.headers.set('X-RateLimit-Remaining', String(result.remaining));
        response.headers.set('X-RateLimit-Reset', String(Math.floor(result.resetTime / 1000)));
        response.headers.set('X-RateLimit-Tier', tier);
        response.headers.set('X-Priority', String(priority));
        if (result.burstRemaining !== undefined) {
          response.headers.set('X-Burst-Remaining', String(result.burstRemaining));
        }
        return response;
      };
      
      if (!result.allowed) {
        const response = NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: `Too many requests. Please try again in ${result.retryAfter} seconds.`,
            retryAfter: result.retryAfter,
            tier,
          },
          { status: 429 }
        );
        response.headers.set('Retry-After', String(result.retryAfter || 60));
        return addSecurityHeaders(addHeaders(response));
      }
      
      const response = await handler(request);
      return addSecurityHeaders(addHeaders(response));
    };
  };
}

// Request validation
export function validateRequest(request: NextRequest): { valid: boolean; error?: string } {
  // Check content length
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > API_CONFIG.limits.maxBodySize) {
    return { valid: false, error: `Request too large (max ${API_CONFIG.limits.maxBodySize / 1024 / 1024}MB)` };
  }
  
  // Check content type for body methods
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json') && 
        !contentType?.includes('multipart/form-data') &&
        !contentType?.includes('text/plain')) {
      return { valid: false, error: 'Invalid Content-Type' };
    }
  }
  
  return { valid: true };
}

// Security headers
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-Powered-By', 'Brutal.ai');
  return response;
}

// Combined middleware factory
export function withApiMiddleware(options: {
  rateLimit?: RateLimitGroup;
  validateBody?: boolean;
  requireAuth?: boolean;
} = {}) {
  const { rateLimit = 'default', validateBody = true, requireAuth = false } = options;
  
  return function(
    handler: (request: NextRequest, context?: unknown) => Promise<NextResponse>
  ): (request: NextRequest, context?: unknown) => Promise<NextResponse> {
    const rateLimitedHandler = withRateLimit(rateLimit)(handler);
    
    return async function(request: NextRequest, context?: unknown): Promise<NextResponse> {
      // Validate request
      if (validateBody) {
        const validation = validateRequest(request);
        if (!validation.valid) {
          return NextResponse.json(
            { error: validation.error },
            { status: 400 }
          );
        }
      }
      
      // Check auth if required
      if (requireAuth) {
        const auth = request.headers.get('authorization');
        if (!auth?.startsWith('Bearer ')) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }
      }
      
      return rateLimitedHandler(request);
    };
  };
}

// Get client statistics
export function getClientStats(clientId: string): {
  exists: boolean;
  tier?: UserTier;
  requestCount?: number;
  firstSeen?: number;
} {
  const entry = clientStore.get(clientId);
  if (!entry) {
    return { exists: false };
  }
  
  return {
    exists: true,
    tier: entry.tier,
    requestCount: entry.requestCount,
    firstSeen: entry.firstSeen,
  };
}

// Get global rate limit stats
export function getRateLimitStats(): {
  totalClients: number;
  blockedClients: number;
  abuseListSize: number;
} {
  let blocked = 0;
  const now = Date.now();
  
  for (const entry of clientStore.values()) {
    if (entry.blocked && entry.blockedUntil > now) {
      blocked++;
    }
  }
  
  return {
    totalClients: clientStore.size,
    blockedClients: blocked,
    abuseListSize: abuseList.size,
  };
}

// Export helpers
export { getUserTier, getRequestPriority };
