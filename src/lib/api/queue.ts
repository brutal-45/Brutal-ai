// High-Performance Request Queue System
// Handles millions of concurrent requests with priority queuing

import { PRIORITY } from './config';

// Queue item interface
interface QueueItem<T, R> {
  id: string;
  data: T;
  priority: number;
  timestamp: number;
  resolve: (result: R) => void;
  reject: (error: Error) => void;
  attempts: number;
  maxAttempts: number;
}

// Queue statistics
interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  avgProcessingTime: number;
}

// Request queue with priority support
export class RequestQueue<T, R> {
  private queues: Map<number, QueueItem<T, R>[]> = new Map();
  private processing: Set<QueueItem<T, R>> = new Set();
  private stats = {
    completed: 0,
    failed: 0,
    totalProcessingTime: 0,
  };
  private concurrency: number;
  private processor: (data: T) => Promise<R>;
  private isProcessing: boolean = false;
  private itemId = 0;

  constructor(
    processor: (data: T) => Promise<R>,
    concurrency: number = 100
  ) {
    this.processor = processor;
    this.concurrency = concurrency;
    
    // Initialize priority queues
    Object.values(PRIORITY).forEach(priority => {
      this.queues.set(priority, []);
    });
  }

  // Add item to queue
  enqueue(
    data: T,
    priority: number = PRIORITY.NORMAL,
    maxAttempts: number = 3
  ): Promise<R> {
    return new Promise((resolve, reject) => {
      const item: QueueItem<T, R> = {
        id: `req_${Date.now()}_${++this.itemId}`,
        data,
        priority,
        timestamp: Date.now(),
        resolve,
        reject,
        attempts: 0,
        maxAttempts,
      };

      const queue = this.queues.get(priority) || [];
      queue.push(item);
      this.queues.set(priority, queue);

      this.startProcessing();
    });
  }

  // Process queue items
  private async startProcessing(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.hasItems() && this.processing.size < this.concurrency) {
      const item = this.getNextItem();
      if (!item) break;

      this.processing.add(item);
      this.processItem(item);
    }

    this.isProcessing = false;
  }

  // Process single item
  private async processItem(item: QueueItem<T, R>): Promise<void> {
    const startTime = Date.now();
    
    try {
      item.attempts++;
      const result = await this.processor(item.data);
      
      this.stats.completed++;
      this.stats.totalProcessingTime += Date.now() - startTime;
      item.resolve(result);
    } catch (error) {
      if (item.attempts < item.maxAttempts) {
        // Retry with exponential backoff
        const queue = this.queues.get(item.priority) || [];
        setTimeout(() => {
          queue.unshift(item); // Add to front of queue
          this.queues.set(item.priority, queue);
          this.startProcessing();
        }, Math.pow(2, item.attempts) * 1000);
      } else {
        this.stats.failed++;
        item.reject(error as Error);
      }
    } finally {
      this.processing.delete(item);
      this.startProcessing();
    }
  }

  // Check if any items in queues
  private hasItems(): boolean {
    for (const queue of this.queues.values()) {
      if (queue.length > 0) return true;
    }
    return false;
  }

  // Get next item by priority
  private getNextItem(): QueueItem<T, R> | null {
    // Process in priority order (0 = highest priority)
    const priorities = [...this.queues.keys()].sort((a, b) => a - b);
    
    for (const priority of priorities) {
      const queue = this.queues.get(priority);
      if (queue && queue.length > 0) {
        return queue.shift()!;
      }
    }
    
    return null;
  }

  // Get queue statistics
  getStats(): QueueStats {
    let pending = 0;
    for (const queue of this.queues.values()) {
      pending += queue.length;
    }

    return {
      pending,
      processing: this.processing.size,
      completed: this.stats.completed,
      failed: this.stats.failed,
      avgProcessingTime: this.stats.completed > 0
        ? this.stats.totalProcessingTime / this.stats.completed
        : 0,
    };
  }

  // Clear all queues
  clear(): void {
    for (const queue of this.queues.values()) {
      queue.length = 0;
    }
    this.processing.clear();
  }
}

// AI Request Queue with batching support
interface AIRequest {
  messages: Array<{ role: string; content: string }>;
  model?: string;
}

interface AIResponse {
  content: string;
  model: string;
  usage: { input: number; output: number };
}

// Singleton queues
let chatQueue: RequestQueue<AIRequest, AIResponse> | null = null;
let imageQueue: RequestQueue<{ prompt: string; size: string }, string> | null = null;

export function getChatQueue(): RequestQueue<AIRequest, AIResponse> {
  if (!chatQueue) {
    chatQueue = new RequestQueue(
      async (request) => {
        // Import dynamically to avoid circular dependencies
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: request.messages }),
        });
        const data = await response.json();
        return {
          content: data.response || '',
          model: 'brutal-ai',
          usage: { input: 0, output: 0 },
        };
      },
      50 // Concurrency limit for AI
    );
  }
  return chatQueue;
}

export function getImageQueue(): RequestQueue<{ prompt: string; size: string }, string> {
  if (!imageQueue) {
    imageQueue = new RequestQueue(
      async (request) => {
        const response = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        });
        const data = await response.json();
        return data.image || '';
      },
      10 // Lower concurrency for image generation
    );
  }
  return imageQueue;
}

// Get all queue stats
export function getAllQueueStats(): Record<string, QueueStats> {
  return {
    chat: chatQueue?.getStats() || { pending: 0, processing: 0, completed: 0, failed: 0, avgProcessingTime: 0 },
    image: imageQueue?.getStats() || { pending: 0, processing: 0, completed: 0, failed: 0, avgProcessingTime: 0 },
  };
}
