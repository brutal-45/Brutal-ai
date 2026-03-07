import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { prompt, input } = await request.json();

    const userPrompt = input || prompt;

    if (!userPrompt || typeof userPrompt !== 'string') {
      return NextResponse.json(
        { error: 'Text to fix is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert editor and grammar specialist. Fix all grammar, spelling, punctuation, and style errors in the provided text. Also improve clarity and readability where needed. Show the corrected text clearly, and optionally list the main corrections made.`
        },
        {
          role: 'user',
          content: `Fix the grammar and spelling in the following text:\n\n${userPrompt}`,
        },
      ],
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not fix the grammar.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Grammar API error:', error);
    return NextResponse.json(
      { error: 'Failed to fix grammar' },
      { status: 500 }
    );
  }
}
