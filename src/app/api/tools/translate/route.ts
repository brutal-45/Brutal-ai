import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { prompt, input, targetLanguage } = await request.json();

    const userPrompt = input || prompt;

    if (!userPrompt || typeof userPrompt !== 'string') {
      return NextResponse.json(
        { error: 'Text to translate is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert translator. Translate the provided text accurately while preserving the meaning, tone, and context. If a target language is specified, translate to that language. If not, identify the source language and translate to English. Provide the translation clearly.`
        },
        {
          role: 'user',
          content: targetLanguage 
            ? `Translate the following text to ${targetLanguage}:\n\n${userPrompt}`
            : `Translate the following text:\n\n${userPrompt}`,
        },
      ],
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not translate the text.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Translate API error:', error);
    return NextResponse.json(
      { error: 'Failed to translate text' },
      { status: 500 }
    );
  }
}
