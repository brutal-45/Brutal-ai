import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { prompt, input } = await request.json();

    const userPrompt = input || prompt;

    if (!userPrompt || typeof userPrompt !== 'string') {
      return NextResponse.json(
        { error: 'Product/service details are required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert copywriter specializing in advertising. Create compelling, persuasive ad copy that converts. Include multiple headline options, body copy variations, and call-to-action suggestions. Consider different platforms (Facebook, Google, Instagram, etc.). Be creative and use proven copywriting techniques.`
        },
        {
          role: 'user',
          content: `Write ad copy for: ${userPrompt}`,
        },
      ],
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate ad copy.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Ad copy API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate ad copy' },
      { status: 500 }
    );
  }
}
