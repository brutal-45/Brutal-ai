import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { prompt, input } = await request.json();

    const userPrompt = input || prompt;

    if (!userPrompt || typeof userPrompt !== 'string') {
      return NextResponse.json(
        { error: 'Business idea is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert business consultant. Create comprehensive business plans including: Executive Summary, Company Description, Market Analysis, Organization & Management, Services/Products, Marketing Strategy, Financial Projections, and Funding Requirements. Be detailed, professional, and realistic.`
        },
        {
          role: 'user',
          content: `Create a business plan for: ${userPrompt}`,
        },
      ],
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a business plan.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Business plan API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate business plan' },
      { status: 500 }
    );
  }
}
