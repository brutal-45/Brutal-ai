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
          content: `You are an expert marketing strategist. Create comprehensive marketing strategies including: Target Audience Analysis, Unique Value Proposition, Marketing Channels, Content Strategy, Social Media Strategy, Paid Advertising Recommendations, Budget Allocation, KPIs and Metrics, and Timeline. Be specific and actionable.`
        },
        {
          role: 'user',
          content: `Create a marketing strategy for: ${userPrompt}`,
        },
      ],
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a marketing strategy.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Marketing API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate marketing strategy' },
      { status: 500 }
    );
  }
}
