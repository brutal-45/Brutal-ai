import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
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
          content: `You are an expert app idea generator and innovation consultant. Your task is to generate creative, viable, and innovative app ideas based on user interests or problems they want to solve.

For each app idea, provide:
1. **App Name**: A catchy, memorable name
2. **One-liner Pitch**: A compelling one-sentence description
3. **Problem Statement**: What problem does it solve?
4. **Target Audience**: Who would use this app?
5. **Key Features**: 3-5 main features
6. **Monetization Strategy**: How can this app make money?
7. **Technical Complexity**: Easy/Medium/Hard with brief explanation
8. **Market Potential**: Brief analysis of market opportunity

Generate 2-3 unique app ideas that are practical and have real market potential. Be creative but realistic. Format your response using markdown with proper headings and bullet points.`
        },
        {
          role: 'user',
          content: `Generate app ideas based on: ${prompt}`
        }
      ],
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate app ideas.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('App idea API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate app ideas' },
      { status: 500 }
    );
  }
}
