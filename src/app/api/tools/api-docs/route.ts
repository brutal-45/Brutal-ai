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
          content: `You are an expert technical writer specializing in API documentation. Your task is to generate clear, comprehensive, and developer-friendly API documentation.

Generate documentation that includes:
1. **Overview**: Brief description of the API endpoint
2. **Endpoint URL**: The API endpoint path
3. **HTTP Method**: GET, POST, PUT, DELETE, etc.
4. **Authentication**: Required authentication method
5. **Request Parameters**: Query params, path params, request body
6. **Request Example**: Code example in multiple languages (cURL, JavaScript, Python)
7. **Response Schema**: JSON structure with field descriptions
8. **Response Example**: Sample successful response
9. **Error Codes**: Possible error responses and their meanings
10. **Rate Limits**: If applicable

Use markdown formatting with proper headings, code blocks, and tables where appropriate. Make the documentation clear and easy to follow.`
        },
        {
          role: 'user',
          content: `Generate API documentation for: ${prompt}`
        }
      ],
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate API documentation.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('API docs API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate API documentation' },
      { status: 500 }
    );
  }
}
