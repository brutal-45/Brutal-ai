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
      prompt: `Professional logo design: ${prompt}. Clean, modern, minimalist style, suitable for branding, high quality, vector-style design`,
      size: '1024x1024',
    });

    const imageBase64 = response.data[0]?.base64;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Failed to generate logo' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      image: imageBase64,
      success: true 
    });
  } catch (error) {
    console.error('Logo generation API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate logo' },
      { status: 500 }
    );
  }
}
