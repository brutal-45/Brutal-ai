import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { prompt, input } = await request.json();
    const userPrompt = input || prompt;

    if (!userPrompt || typeof userPrompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert programmer and code generator. Generate clean, efficient, and well-documented code based on the user's requirements. Include comments explaining the code. Use best practices and modern conventions. Format code in appropriate code blocks with language specification.`
        },
        {
          role: 'user',
          content: `Generate code for: ${userPrompt}`,
        },
      ],
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate code for that request.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Code generation API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate code' },
      { status: 500 }
    );
  }
}
