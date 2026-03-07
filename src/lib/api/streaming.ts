// Advanced Streaming Support
// SSE streaming, backpressure handling, and real-time response delivery

import ZAI from 'z-ai-web-dev-sdk';
import { withAIConnection } from './connection-pool';

// Stream event types
export type StreamEventType = 'start' | 'token' | 'done' | 'error' | 'metadata';

export interface StreamEvent {
  type: StreamEventType;
  data: unknown;
  timestamp: number;
}

// Stream options
export interface StreamOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  systemPrompt?: string;
  model?: string;
  onToken?: (token: string) => void;
  onStart?: () => void;
  onDone?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
}

// Create SSE encoder
export function createSSEEncoder(): TransformStream<StreamEvent, Uint8Array> {
  const encoder = new TextEncoder();
  
  return new TransformStream({
    transform(event: StreamEvent, controller) {
      const data = JSON.stringify(event);
      controller.enqueue(encoder.encode(`data: ${data}\n\n`));
    },
  });
}

// AI streaming handler with connection pool
export async function streamAIResponse(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  options: StreamOptions = {}
): Promise<ReadableStream<Uint8Array>> {
  const {
    temperature = 0.7,
    maxTokens = 4096,
    topP = 1,
    systemPrompt,
    onToken,
    onStart,
    onDone,
    onError,
  } = options;

  const encoder = new TextEncoder();
  let fullResponse = '';
  let cancelled = false;

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // Send start event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'start',
          data: { timestamp: Date.now() },
          timestamp: Date.now(),
        })}\n\n`));
        
        onStart?.();

        // Use connection pool
        await withAIConnection(async (zai) => {
          // Prepare messages
          const apiMessages = systemPrompt
            ? [{ role: 'system' as const, content: systemPrompt }, ...messages]
            : messages;

          const completion = await zai.chat.completions.create({
            messages: apiMessages.map(m => ({
              role: m.role,
              content: m.content,
            })),
            temperature,
            max_tokens: maxTokens,
            top_p: topP,
            stream: true,
          });

          // Stream chunks
          for await (const chunk of completion) {
            if (cancelled) break;

            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              
              // Call token callback
              onToken?.(content);
              
              // Send token event
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'token',
                data: { content },
                timestamp: Date.now(),
              })}\n\n`));
            }
          }
        });

        // Send done event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'done',
          data: { fullResponse, length: fullResponse.length },
          timestamp: Date.now(),
        })}\n\n`));
        
        onDone?.(fullResponse);
        controller.close();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'error',
          data: { message: errorMessage },
          timestamp: Date.now(),
        })}\n\n`));
        
        onError?.(error as Error);
        controller.close();
      }
    },
    cancel() {
      cancelled = true;
    },
  });
}

// Tool streaming response - for tools that support incremental output
export async function streamToolResponse(
  toolName: string,
  processor: () => AsyncGenerator<string>,
  options: {
    onStart?: () => void;
    onDone?: (fullResponse: string) => void;
    onError?: (error: Error) => void;
  } = {}
): Promise<ReadableStream<Uint8Array>> {
  const { onStart, onDone, onError } = options;
  const encoder = new TextEncoder();
  let fullResponse = '';
  let cancelled = false;

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // Send start event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'start',
          data: { tool: toolName, timestamp: Date.now() },
          timestamp: Date.now(),
        })}\n\n`));
        
        onStart?.();

        // Process and stream
        for await (const chunk of processor()) {
          if (cancelled) break;
          
          fullResponse += chunk;
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'token',
            data: { content: chunk, tool: toolName },
            timestamp: Date.now(),
          })}\n\n`));
        }

        // Send done event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'done',
          data: { fullResponse, length: fullResponse.length, tool: toolName },
          timestamp: Date.now(),
        })}\n\n`));
        
        onDone?.(fullResponse);
        controller.close();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'error',
          data: { message: errorMessage, tool: toolName },
          timestamp: Date.now(),
        })}\n\n`));
        
        onError?.(error as Error);
        controller.close();
      }
    },
    cancel() {
      cancelled = true;
    },
  });
}

// Image generation with progress streaming
export async function streamImageGeneration(
  prompt: string,
  options: {
    size?: '1024x1024' | '768x1344' | '864x1152' | '1344x768' | '1152x864' | '1440x720' | '720x1440';
    style?: string;
    onProgress?: (progress: number) => void;
  } = {}
): Promise<ReadableStream<Uint8Array>> {
  const { size = '1024x1024', style, onProgress } = options;
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // Send start event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'start',
          data: { prompt, size, style, timestamp: Date.now() },
          timestamp: Date.now(),
        })}\n\n`));

        // Simulate progress for UX
        for (let progress = 0; progress < 90; progress += 10) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'metadata',
            data: { progress, stage: 'generating' },
            timestamp: Date.now(),
          })}\n\n`));
          onProgress?.(progress);
          await new Promise(r => setTimeout(r, 100));
        }

        // Generate image
        const imageBase64 = await withAIConnection(async (zai) => {
          const enhancedPrompt = style ? `${prompt}, ${style}` : prompt;
          
          const response = await zai.images.generations.create({
            prompt: enhancedPrompt,
            size,
          });
          
          return response.data[0]?.base64;
        });

        if (!imageBase64) {
          throw new Error('Failed to generate image');
        }

        // Send progress complete
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'metadata',
          data: { progress: 100, stage: 'complete' },
          timestamp: Date.now(),
        })}\n\n`));

        // Send done event with image
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'done',
          data: { 
            image: `data:image/png;base64,${imageBase64}`,
            prompt,
            size,
          },
          timestamp: Date.now(),
        })}\n\n`));
        
        controller.close();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'error',
          data: { message: errorMessage },
          timestamp: Date.now(),
        })}\n\n`));
        
        controller.close();
      }
    },
  });
}

// Create streaming response for API routes
export function createStreamingResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Transfer-Encoding': 'chunked',
    },
  });
}

// Convert stream to text (for non-streaming clients)
export async function streamToText(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const event = JSON.parse(data) as StreamEvent;
            if (event.type === 'token' && typeof event.data === 'object' && event.data !== null) {
              const dataObj = event.data as { content?: string };
              result += dataObj.content || '';
            } else if (event.type === 'done' && typeof event.data === 'object' && event.data !== null) {
              const dataObj = event.data as { fullResponse?: string };
              result = dataObj.fullResponse || result;
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return result;
}

// Batch streaming - stream multiple responses
export async function* batchStreamGenerator(
  items: Array<() => Promise<string>>,
  concurrency: number = 3
): AsyncGenerator<string> {
  const queue = [...items];
  const active: Array<Promise<void>> = [];
  const results: Array<{ index: number; result: string }> = [];
  let index = 0;
  let resolveWait: (() => void) | null = null;

  const processNext = async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      
      const currentIndex = index++;
      try {
        const result = await item();
        results.push({ index: currentIndex, result });
        if (resolveWait) {
          resolveWait();
          resolveWait = null;
        }
      } catch {
        results.push({ index: currentIndex, result: '[Error]' });
      }
    }
  };

  // Start workers
  for (let i = 0; i < Math.min(concurrency, items.length); i++) {
    active.push(processNext());
  }

  // Yield results in order
  let nextIndex = 0;
  while (nextIndex < items.length) {
    const found = results.find(r => r.index === nextIndex);
    if (found) {
      yield found.result;
      nextIndex++;
    } else {
      // Wait for new results
      await new Promise<void>(resolve => {
        resolveWait = resolve;
      });
    }
  }

  await Promise.all(active);
}
