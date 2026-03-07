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
          content: `You are a creative branding expert and business name consultant. Your task is to generate unique, memorable, and brandable business names.

For each business name suggestion, provide:
1. **Name**: The suggested business name
2. **Meaning/Origin**: Brief explanation of why this name works
3. **Domain Availability Tip**: Suggestions for domain variations
4. **Brand Potential**: Why this name has good branding potential
5. **Tagline Idea**: A catchy tagline that goes with the name

Generate 5-7 creative business names with variety in style:
- Some descriptive/literal names
- Some abstract/creative names
- Some modern/tech-sounding names
- Some classic/professional names

Ensure names are:
- Easy to spell and pronounce
- Memorable
- Not too long (preferably 1-2 words)
- Available as potential trademarks (use general guidance)

Format your response using markdown with clear sections.`
        },
        {
          role: 'user',
          content: `Generate business names for: ${prompt}`
        }
      ],
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate business names.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Business name API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate business names' },
      { status: 500 }
    );
  }
}
