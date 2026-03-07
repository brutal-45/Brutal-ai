import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { prompt, input } = await request.json();

    const userPrompt = input || prompt;

    if (!userPrompt || typeof userPrompt !== 'string') {
      return NextResponse.json(
        { error: 'Image description is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that helps users understand how to remove backgrounds from images. Explain the process and provide helpful tips and tool recommendations for background removal. Mention both free and paid tools available online.`
        },
        {
          role: 'user',
          content: `Help me understand how to remove background from: ${userPrompt}`,
        },
      ],
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not provide background removal guidance.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Background remover API error:', error);
    return NextResponse.json(
      { error: 'Failed to provide background removal guidance' },
      { status: 500 }
    );
  }
}
