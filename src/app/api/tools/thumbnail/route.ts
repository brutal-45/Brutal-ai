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

    const response = await zai.images.generations.create({
      prompt: `YouTube video thumbnail: ${prompt}. Eye-catching, vibrant colors, professional design, high contrast, engaging visual elements, text overlay ready`,
      size: '1344x768',
    });

    const imageBase64 = response.data[0]?.base64;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Failed to generate thumbnail' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      image: imageBase64,
      success: true 
    });
  } catch (error) {
    console.error('Thumbnail generation API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate thumbnail' },
      { status: 500 }
    );
  }
}
