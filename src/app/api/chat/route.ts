import { NextRequest, NextResponse } from 'next/server'; 
import ZAI from 'z-ai-web-dev-sdk';

const SYSTEM_PROMPT = `You are Brutal.ai, a helpful AI assistant created by BRUTALTOOLS. You are smart, fast, and provide excellent responses.

Your capabilities include:
- Answering any question on any topic
- Writing code in any programming language
- Creating content, articles, emails, and documents
- Helping with business plans, marketing, and strategy
- Translating languages and fixing grammar
- Explaining complex topics simply
- Creative writing and brainstorming
- Analysis and problem-solving

Always be helpful, accurate, and provide detailed responses. Use markdown formatting when appropriate.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, stream = false, temperature = 0.7, maxTokens = 16000 } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Validate message content length
    const totalLength = messages.reduce((sum: number, msg: { content: string }) => sum + (msg.content?.length || 0), 0);
    if (totalLength > 50000) {
      return NextResponse.json({ error: 'Message content too long. Maximum 50,000 characters.' }, { status: 400 });
    }

    // Prepare messages for API
    const apiMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    // Initialize ZAI SDK
    const zai = await ZAI.create();

    // Handle streaming
    if (stream) {
      const encoder = new TextEncoder();
      let cancelled = false;

      const streamResponse = new ReadableStream({
        async start(controller) {
          try {
            const completion = await zai.chat.completions.create({
              messages: apiMessages,
              temperature,
              max_tokens: maxTokens,
              stream: true,
            });

            for await (const chunk of completion) {
              if (cancelled) break;
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            }

            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`));
            controller.close();
          }
        },
        cancel() {
          cancelled = true;
        },
      });

      return new Response(streamResponse, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      });
    }

    // Non-streaming request
    const completion = await zai.chat.completions.create({
      messages: apiMessages,
      temperature,
      max_tokens: maxTokens,
    });

    const responseContent = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return NextResponse.json({ response: responseContent });
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to generate response', message: errorMessage }, { status: 500 });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    service: 'chat-api', 
    timestamp: Date.now(),
  });
}
