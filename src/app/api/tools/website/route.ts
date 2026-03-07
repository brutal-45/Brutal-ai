import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { prompt, input } = await request.json();

    const userPrompt = input || prompt;

    if (!userPrompt || typeof userPrompt !== 'string') {
      return NextResponse.json(
        { error: 'Website requirements are required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert web developer. Generate complete, modern, responsive website code including HTML, CSS, and JavaScript. Use modern frameworks and best practices. Include all necessary code in properly formatted code blocks. Make the design attractive and professional.`
        },
        {
          role: 'user',
          content: `Build a website for: ${userPrompt}`,
        },
      ],
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate website code.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Website builder API error:', error);
    return NextResponse.json(
      { error: 'Failed to build website' },
      { status: 500 }
    );
  }
}
