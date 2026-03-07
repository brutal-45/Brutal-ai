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
          content: `You are an expert in writing style and tone adjustment. Your task is to rewrite text in different tones while maintaining the core message.

Provide the text rewritten in multiple tones:
1. **Professional**: Formal, business-appropriate
2. **Casual**: Friendly, conversational
3. **Enthusiastic**: Energetic, excited
4. **Formal**: Very proper, academic
5. **Friendly**: Warm, approachable
6. **Persuasive**: Convincing, compelling

For each tone:
- Maintain the original meaning
- Adjust vocabulary and sentence structure
- Keep appropriate length

Format the response with clear headings for each tone variation. Use markdown formatting.`
        },
        {
          role: 'user',
          content: `Rewrite this text in different tones: ${prompt}`
        }
      ],
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not adjust the tone.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Tone changer API error:', error);
    return NextResponse.json(
      { error: 'Failed to adjust tone' },
      { status: 500 }
    );
  }
}
