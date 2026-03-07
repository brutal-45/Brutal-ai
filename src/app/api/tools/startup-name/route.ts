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
          content: `You are a creative naming consultant specializing in startup names. Your task is to generate unique, memorable, and brandable startup names.

For each startup name suggestion, provide:
1. **Name**: The suggested startup name
2. **Meaning/Origin**: Brief explanation of why this name works
3. **Domain Availability Tip**: Suggestions for domain variations
4. **Brand Potential**: Why this name has good branding potential
5. **Tagline Idea**: A catchy tagline that goes with the name

Generate 5-7 creative startup names with variety in style:
- Some modern/tech-sounding names
- Some descriptive names
- Some abstract/creative names
- Some action-oriented names

Ensure names are:
- Easy to spell and pronounce
- Memorable and catchy
- Not too long (preferably 1-2 words)
- Suitable for a startup company

Format your response using markdown with clear sections.`
        },
        {
          role: 'user',
          content: `Generate startup names for: ${prompt}`
        }
      ],
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate startup names.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Startup name API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate startup names' },
      { status: 500 }
    );
  }
}
