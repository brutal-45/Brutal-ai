import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { prompt, input } = await request.json();

    const userPrompt = input || prompt;

    if (!userPrompt || typeof userPrompt !== 'string') {
      return NextResponse.json(
        { error: 'Content to summarize is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert at summarizing and distilling information. Create clear, concise summaries that capture the key points and main ideas. Structure the summary with bullet points for easy reading. Highlight important concepts and findings.`
        },
        {
          role: 'user',
          content: `Summarize the following content:\n\n${userPrompt}`,
        },
      ],
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not summarize the content.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('PDF Summary API error:', error);
    return NextResponse.json(
      { error: 'Failed to summarize content' },
      { status: 500 }
    );
  }
}
