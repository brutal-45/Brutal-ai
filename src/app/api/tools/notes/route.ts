import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { prompt, input } = await request.json();

    const userPrompt = input || prompt;

    if (!userPrompt || typeof userPrompt !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert at creating organized, structured notes. Generate comprehensive notes with clear headings, subheadings, bullet points, and key takeaways. Make the notes easy to study and reference. Include examples where helpful.`
        },
        {
          role: 'user',
          content: `Generate notes on: ${userPrompt}`,
        },
      ],
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate notes.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Notes API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate notes' },
      { status: 500 }
    );
  }
}
