// AI Module - Backward compatible wrapper using connection pool
// Provides simple AI functions that use the enhanced infrastructure

import { withAIConnection, executeWithResilience } from './connection-pool';
import { PRIORITY } from './config';
import ZAI from 'z-ai-web-dev-sdk';

// Generate chat completion with connection pooling
export async function generateChatCompletion(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  options: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    priority?: number;
  } = {}
): Promise<string> {
  const { temperature = 0.7, maxTokens = 4096, systemPrompt, priority = PRIORITY.NORMAL } = options;

  return executeWithResilience(
    'chat',
    async () => {
      return withAIConnection(async (zai) => {
        const apiMessages = systemPrompt
          ? [{ role: 'system' as const, content: systemPrompt }, ...messages]
          : messages;

        const completion = await zai.chat.completions.create({
          messages: apiMessages,
          temperature,
          max_tokens: maxTokens,
        });

        return completion.choices[0]?.message?.content || '';
      });
    },
    { priority, timeout: 60000 }
  );
}

// Generate image with connection pooling
export async function generateImage(
  prompt: string,
  options: {
    size?: '1024x1024' | '768x1344' | '864x1152' | '1344x768' | '1152x864' | '1440x720' | '720x1440';
    priority?: number;
  } = {}
): Promise<string> {
  const { size = '1024x1024', priority = PRIORITY.NORMAL } = options;

  return executeWithResilience(
    'image-generation',
    async () => {
      return withAIConnection(async (zai) => {
        const response = await zai.images.generations.create({
          prompt,
          size,
        });

        const base64 = response.data[0]?.base64;
        if (!base64) {
          throw new Error('Failed to generate image');
        }

        return `data:image/png;base64,${base64}`;
      });
    },
    { priority, timeout: 120000 }
  );
}

// Create ZAI instance (for backward compatibility)
export async function createAI() {
  return ZAI.create();
}

// Export types
export type { ZAI };
