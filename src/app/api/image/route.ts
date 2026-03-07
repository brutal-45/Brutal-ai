import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

const VALID_SIZES = ['1024x1024', '768x1344', '864x1152', '1344x768', '1152x864', '1440x720', '720x1440'] as const;
type ImageSize = typeof VALID_SIZES[number];

// Simple in-memory cache
const imageCache = new Map<string, { data: string; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCacheKey(prompt: string, size: string): string {
  return Buffer.from(`${prompt}:${size}`).toString('base64').slice(0, 32);
}

function getSize(aspectRatio: string, resolution: string): ImageSize {
  const sizes: Record<string, Record<string, ImageSize>> = {
    '1:1': { hd: '1024x1024', '2k': '1024x1024', '4k': '1024x1024' },
    '16:9': { hd: '1344x768', '2k': '1344x768', '4k': '1440x720' },
    '9:16': { hd: '768x1344', '2k': '768x1344', '4k': '720x1440' },
    '4:3': { hd: '1152x864', '2k': '1152x864', '4k': '1152x864' },
    '3:4': { hd: '864x1152', '2k': '864x1152', '4k': '864x1152' },
  };
  return sizes[aspectRatio]?.[resolution] || '1024x1024';
}

function enhancePrompt(prompt: string, style?: string, lighting?: string, colorTone?: string): string {
  const styleModifiers: Record<string, string> = {
    'realistic': 'photorealistic, ultra detailed, 8k uhd, sharp focus, professional photography',
    'cinematic': 'cinematic, movie still, dramatic lighting, film grain, anamorphic',
    'anime': 'anime style, cel shaded, vibrant colors, studio ghibli, high quality',
    '3d': '3D render, octane render, unreal engine 5, ray tracing, volumetric lighting',
    'digital-art': 'digital art, artstation trending, concept art, highly detailed',
    'pixel-art': 'pixel art, 16-bit style, retro game aesthetic, nostalgic',
    'logo': 'minimalist logo design, vector style, clean lines, professional branding',
    'thumbnail': 'youtube thumbnail, eye-catching, bold colors, high contrast, attention grabbing',
    'poster': 'movie poster style, graphic design, artistic, creative composition',
    'ui-mockup': 'UI design mockup, clean modern interface, professional design, figma',
    'product': 'product photography, studio lighting, white background, commercial quality',
    'concept': 'concept art, matte painting, detailed environment, epic scale',
  };

  const lightingModifiers: Record<string, string> = {
    'natural': 'natural lighting, golden hour, soft sunlight, warm tones',
    'studio': 'studio lighting, softbox, professional setup, even illumination',
    'dramatic': 'dramatic lighting, high contrast, deep shadows, rim light',
    'soft': 'soft lighting, diffused, gentle shadows, dreamy atmosphere',
    'cinematic': 'cinematic lighting, volumetric rays, atmospheric, moody',
  };

  const colorModifiers: Record<string, string> = {
    'vibrant': 'vibrant colors, saturated, vivid, intense',
    'warm': 'warm color palette, orange golden tones, cozy',
    'cool': 'cool color palette, blue icy tones, refreshing',
    'muted': 'muted colors, desaturated, subtle, understated',
    'monochrome': 'monochrome, black and white, grayscale, timeless',
    'pastel': 'pastel colors, soft gentle tones, delicate',
  };

  let enhanced = prompt;
  if (style && styleModifiers[style]) enhanced += `, ${styleModifiers[style]}`;
  if (lighting && lightingModifiers[lighting]) enhanced += `, ${lightingModifiers[lighting]}`;
  if (colorTone && colorModifiers[colorTone]) enhanced += `, ${colorModifiers[colorTone]}`;
  return enhanced;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt, 
      size = '1024x1024', 
      aspectRatio, 
      resolution, 
      style, 
      lighting, 
      colorTone,
      count = 1,
    } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create();

    // Limit count to max 10
    const imageCount = Math.min(Math.max(1, count), 10);

    // Determine final size
    let finalSize: ImageSize = '1024x1024';
    if (aspectRatio && resolution) {
      finalSize = getSize(aspectRatio, resolution);
    } else if (VALID_SIZES.includes(size as ImageSize)) {
      finalSize = size as ImageSize;
    }

    const enhancedPrompt = enhancePrompt(prompt, style, lighting, colorTone);
    const cacheKey = getCacheKey(enhancedPrompt, finalSize);

    // Check cache for single image
    if (imageCount === 1) {
      const cached = imageCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json({
          image: `data:image/png;base64,${cached.data}`,
          success: true,
          cached: true,
          metadata: { prompt: enhancedPrompt, size: finalSize, style },
        });
      }
    }

    // Generate images
    const images: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < imageCount; i++) {
      try {
        const response = await zai.images.generations.create({
          prompt: enhancedPrompt,
          size: finalSize,
        });

        if (response.data?.[0]?.base64) {
          images.push(response.data[0].base64);
        } else {
          errors.push(`Image ${i + 1}: No base64 data returned`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Image ${i + 1}: ${errorMessage}`);
      }
    }

    if (images.length === 0) {
      throw new Error(errors.join('; ') || 'All image generations failed');
    }

    // Cache first image
    if (images.length > 0) {
      imageCache.set(cacheKey, { data: images[0], timestamp: Date.now() });
    }

    // Clean old cache entries
    if (imageCache.size > 500) {
      const now = Date.now();
      for (const [key, value] of imageCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          imageCache.delete(key);
        }
      }
    }

    // Return response
    if (imageCount === 1) {
      return NextResponse.json({
        image: `data:image/png;base64,${images[0]}`,
        success: true,
        metadata: { prompt: enhancedPrompt, size: finalSize, style, aspectRatio, resolution },
      });
    } else {
      return NextResponse.json({
        images: images.map(img => `data:image/png;base64,${img}`),
        count: images.length,
        requested: imageCount,
        success: true,
        metadata: { prompt: enhancedPrompt, size: finalSize, style, aspectRatio, resolution },
      });
    }
  } catch (error) {
    console.error('Image API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to generate image', message: errorMessage }, { status: 500 });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    service: 'image-api', 
    validSizes: VALID_SIZES,
    timestamp: Date.now() 
  });
}
