// Unified API Handler Factory
// Creates consistent, scalable API handlers for all tools

import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { 
  checkRateLimit, 
  addSecurityHeaders, 
  getUserTier,
  getRequestPriority 
} from './rate-limiter';
import { trackRequest } from './monitoring';
import { aiResponseCache, generateCacheKey } from './cache';
import { withAIConnection } from './connection-pool';
import { executeWithResilience, getScheduler } from './orchestrator';
import { streamAIResponse, createStreamingResponse, StreamOptions } from './streaming';
import { PRIORITY, API_ERRORS } from './config';

// Tool configuration
export interface ToolConfig {
  name: string;
  description: string;
  rateLimitGroup?: 'default' | 'ai' | 'image' | 'tools';
  cacheTTL?: number;
  timeout?: number;
  maxRetries?: number;
  requiresAuth?: boolean;
  priority?: number;
}

// Tool request context
export interface ToolContext {
  userId?: string;
  tier: 'free' | 'basic' | 'pro' | 'enterprise';
  priority: number;
  requestId: string;
  startTime: number;
}

// Tool handler function type
export type ToolHandler<T = unknown, R = unknown> = (
  input: T,
  context: ToolContext,
  zai: Awaited<ReturnType<typeof ZAI.create>>
) => Promise<R>;

// Stream handler type
export type StreamHandler<T = unknown> = (
  input: T,
  context: ToolContext
) => Promise<ReadableStream<Uint8Array>>;

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create tool API handler
export function createToolAPI<TInput, TOutput>(
  config: ToolConfig,
  handler: ToolHandler<TInput, TOutput>
) {
  return async function(request: NextRequest): Promise<NextResponse> {
    const requestId = generateRequestId();
    const startTime = Date.now();
    const tracker = trackRequest(`/api/tools/${config.name}`);
    
    // Get user context
    const tier = getUserTier(request);
    const priority = getRequestPriority(request);
    const userId = request.headers.get('x-user-id') || undefined;
    
    const context: ToolContext = {
      userId,
      tier,
      priority,
      requestId,
      startTime,
    };

    try {
      // Check rate limit
      const rateLimit = checkRateLimit(request, config.rateLimitGroup || 'tools');
      
      if (!rateLimit.allowed) {
        tracker.end(false);
        const response = NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            message: API_ERRORS.RATE_LIMIT_EXCEEDED,
            retryAfter: rateLimit.retryAfter,
            requestId,
          },
          { status: 429 }
        );
        response.headers.set('Retry-After', String(rateLimit.retryAfter || 60));
        response.headers.set('X-Request-Id', requestId);
        return addSecurityHeaders(response);
      }

      // Parse request body
      let input: TInput;
      try {
        input = await request.json();
      } catch {
        tracker.end(false);
        return addSecurityHeaders(NextResponse.json(
          { error: 'Invalid JSON body', requestId },
          { status: 400 }
        ));
      }

      // Check cache
      const cacheKey = generateCacheKey(`tool:${config.name}`, input as Record<string, unknown>);
      const cached = aiResponseCache.get(cacheKey);
      
      if (cached && config.cacheTTL !== 0) {
        tracker.end(true);
        const response = NextResponse.json({
          ...JSON.parse(cached),
          cached: true,
          requestId,
          latency: Date.now() - startTime,
        });
        response.headers.set('X-Cache-Status', 'HIT');
        response.headers.set('X-Request-Id', requestId);
        response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
        return addSecurityHeaders(response);
      }

      // Execute with resilience
      const result = await executeWithResilience(
        `tool:${config.name}`,
        async () => {
          return withAIConnection(async (zai) => {
            return handler(input, context, zai);
          });
        },
        {
          priority,
          timeout: config.timeout || 30000,
          retry: { maxRetries: config.maxRetries || 2 },
        }
      );

      // Cache result
      if (config.cacheTTL && config.cacheTTL > 0) {
        aiResponseCache.set(cacheKey, JSON.stringify(result), config.cacheTTL);
      }

      // Build response
      const latency = Date.now() - startTime;
      const response = NextResponse.json({
        ...result as object,
        cached: false,
        requestId,
        latency,
      });

      response.headers.set('X-Cache-Status', 'MISS');
      response.headers.set('X-Request-Id', requestId);
      response.headers.set('X-Response-Time', `${latency}ms`);
      response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
      
      tracker.end(true);
      return addSecurityHeaders(response);

    } catch (error) {
      tracker.end(false);
      console.error(`Tool API error [${config.name}]:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isTimeout = errorMessage.includes('timeout') || errorMessage.includes('Timeout');
      
      const response = NextResponse.json(
        {
          error: isTimeout ? API_ERRORS.TIMEOUT : API_ERRORS.SERVER_ERROR,
          message: errorMessage,
          requestId,
        },
        { status: isTimeout ? 504 : 500 }
      );
      
      response.headers.set('X-Request-Id', requestId);
      return addSecurityHeaders(response);
    }
  };
}

// Create streaming tool API handler
export function createStreamingToolAPI<TInput>(
  config: ToolConfig,
  streamHandler: StreamHandler<TInput>
) {
  return async function(request: NextRequest): Promise<Response> {
    const requestId = generateRequestId();
    const startTime = Date.now();
    const tracker = trackRequest(`/api/tools/${config.name}/stream`);
    
    const tier = getUserTier(request);
    const priority = getRequestPriority(request);
    const userId = request.headers.get('x-user-id') || undefined;
    
    const context: ToolContext = {
      userId,
      tier,
      priority,
      requestId,
      startTime,
    };

    try {
      // Check rate limit
      const rateLimit = checkRateLimit(request, config.rateLimitGroup || 'ai');
      
      if (!rateLimit.allowed) {
        tracker.end(false);
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfter: rateLimit.retryAfter,
            requestId,
          }),
          { 
            status: 429,
            headers: { 
              'Content-Type': 'application/json',
              'Retry-After': String(rateLimit.retryAfter || 60),
              'X-Request-Id': requestId,
            }
          }
        );
      }

      // Parse request body
      let input: TInput;
      try {
        input = await request.json();
      } catch {
        tracker.end(false);
        return new Response(
          JSON.stringify({ error: 'Invalid JSON body', requestId }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Get stream from handler
      const stream = await streamHandler(input, context);
      
      tracker.end(true);
      return createStreamingResponse(stream);

    } catch (error) {
      tracker.end(false);
      console.error(`Streaming tool API error [${config.name}]:`, error);
      
      return new Response(
        JSON.stringify({
          error: API_ERRORS.SERVER_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
          requestId,
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}

// Chat API with streaming support
export function createChatAPI(
  systemPrompt: string,
  options: {
    defaultTemperature?: number;
    maxTokens?: number;
  } = {}
) {
  const { defaultTemperature = 0.7, maxTokens = 4096 } = options;

  return async function(request: NextRequest): Promise<Response> {
    const requestId = generateRequestId();
    const startTime = Date.now();
    const tracker = trackRequest('/api/chat');
    
    const tier = getUserTier(request);
    const priority = getRequestPriority(request);

    try {
      // Check rate limit
      const rateLimit = checkRateLimit(request, 'ai');
      
      if (!rateLimit.allowed) {
        tracker.end(false);
        const response = NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            retryAfter: rateLimit.retryAfter,
            requestId,
          },
          { status: 429 }
        );
        response.headers.set('Retry-After', String(rateLimit.retryAfter || 60));
        return addSecurityHeaders(response);
      }

      const body = await request.json();
      const { 
        messages, 
        stream = false,
        temperature = defaultTemperature,
        max_tokens = maxTokens,
      } = body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        tracker.end(false);
        return addSecurityHeaders(NextResponse.json(
          { error: 'Messages array is required', requestId },
          { status: 400 }
        ));
      }

      // Check cache for non-streaming
      if (!stream) {
        const lastMessage = messages[messages.length - 1];
        const cacheKey = generateCacheKey('chat', { 
          prompt: lastMessage.content.slice(0, 200),
          system: systemPrompt.slice(0, 100),
        });
        const cached = aiResponseCache.get(cacheKey);
        
        if (cached) {
          tracker.end(true);
          const response = NextResponse.json({ 
            response: cached,
            cached: true,
            requestId,
            latency: Date.now() - startTime,
          });
          response.headers.set('X-Cache-Status', 'HIT');
          response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
          return addSecurityHeaders(response);
        }
      }

      // Streaming response
      if (stream) {
        const streamOptions: StreamOptions = {
          temperature,
          maxTokens: max_tokens,
          systemPrompt,
        };

        const streamResult = await streamAIResponse(
          messages.map((m: { role: string; content: string }) => ({
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content,
          })),
          streamOptions
        );

        tracker.end(true);
        return createStreamingResponse(streamResult);
      }

      // Non-streaming response
      const response = await executeWithResilience(
        'chat',
        async () => {
          return withAIConnection(async (zai) => {
            const completion = await zai.chat.completions.create({
              messages: [
                { role: 'system', content: systemPrompt },
                ...messages.map((m: { role: string; content: string }) => ({
                  role: m.role as 'user' | 'assistant',
                  content: m.content,
                })),
              ],
              temperature,
              max_tokens: max_tokens,
            });
            return completion.choices[0]?.message?.content || '';
          });
        },
        { priority, timeout: 60000 }
      );

      // Cache response
      const lastMessage = messages[messages.length - 1];
      const cacheKey = generateCacheKey('chat', { 
        prompt: lastMessage.content.slice(0, 200),
        system: systemPrompt.slice(0, 100),
      });
      aiResponseCache.set(cacheKey, response, 60000);

      const latency = Date.now() - startTime;
      const result = NextResponse.json({
        response,
        cached: false,
        requestId,
        latency,
      });

      result.headers.set('X-Cache-Status', 'MISS');
      result.headers.set('X-Response-Time', `${latency}ms`);
      result.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));

      tracker.end(true);
      return addSecurityHeaders(result);

    } catch (error) {
      tracker.end(false);
      console.error('Chat API error:', error);
      
      return addSecurityHeaders(NextResponse.json(
        { 
          error: API_ERRORS.SERVER_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
          requestId,
        },
        { status: 500 }
      ));
    }
  };
}

// Image generation API
export function createImageAPI() {
  return async function(request: NextRequest): Promise<NextResponse> {
    const requestId = generateRequestId();
    const startTime = Date.now();
    const tracker = trackRequest('/api/image');
    
    const tier = getUserTier(request);
    const priority = getRequestPriority(request);

    try {
      // Check rate limit
      const rateLimit = checkRateLimit(request, 'image');
      
      if (!rateLimit.allowed) {
        tracker.end(false);
        const response = NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            retryAfter: rateLimit.retryAfter,
            requestId,
          },
          { status: 429 }
        );
        response.headers.set('Retry-After', String(rateLimit.retryAfter || 60));
        return addSecurityHeaders(response);
      }

      const body = await request.json();
      const { prompt, size = '1024x1024', style } = body;

      if (!prompt) {
        tracker.end(false);
        return addSecurityHeaders(NextResponse.json(
          { error: 'Prompt is required', requestId },
          { status: 400 }
        ));
      }

      // Generate image
      const imageBase64 = await executeWithResilience(
        'image-generation',
        async () => {
          return withAIConnection(async (zai) => {
            const enhancedPrompt = style ? `${prompt}, ${style}` : prompt;
            
            const response = await zai.images.generations.create({
              prompt: enhancedPrompt,
              size,
            });
            
            return response.data[0]?.base64;
          });
        },
        { priority, timeout: 120000, retry: { maxRetries: 1 } }
      );

      if (!imageBase64) {
        tracker.end(false);
        return addSecurityHeaders(NextResponse.json(
          { error: 'Failed to generate image', requestId },
          { status: 500 }
        ));
      }

      const latency = Date.now() - startTime;
      const result = NextResponse.json({
        image: `data:image/png;base64,${imageBase64}`,
        success: true,
        requestId,
        latency,
        metadata: { prompt, size, style },
      });

      result.headers.set('X-Response-Time', `${latency}ms`);
      result.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));

      tracker.end(true);
      return addSecurityHeaders(result);

    } catch (error) {
      tracker.end(false);
      console.error('Image API error:', error);
      
      return addSecurityHeaders(NextResponse.json(
        { 
          error: API_ERRORS.SERVER_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
          requestId,
        },
        { status: 500 }
      ));
    }
  };
}
