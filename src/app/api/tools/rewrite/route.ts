import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { prompt, input, style } = await request.json();

    const userPrompt = input || prompt;

    if (!userPrompt || typeof userPrompt !== 'string') {
      return NextResponse.json(
        { error: 'Text to rewrite is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert writer and editor. Rewrite the provided text to improve clarity, flow, and impact while maintaining the original meaning. ${style ? `Write in a ${style} style.` : 'Make it more engaging and professional.'} Offer multiple versions if appropriate.`
        },
        {
          role: 'user',
          content: `Rewrite the following text:\n\n${userPrompt}`,
        },
      ],
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not rewrite the text.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Rewrite API error:', error);
    return NextResponse.json(
      { error: 'Failed to rewrite text' },
      { status: 500 }
    );
  }
}
