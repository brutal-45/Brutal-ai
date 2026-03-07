import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { prompt, input } = await request.json();

    const userPrompt = input || prompt;

    if (!userPrompt || typeof userPrompt !== 'string') {
      return NextResponse.json(
        { error: 'Resume details are required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert resume writer and career consultant. Create professional, ATS-friendly resumes that highlight the candidate's strengths and achievements. Use strong action verbs, quantify achievements where possible, and format the resume professionally. Include sections for: Professional Summary, Experience, Skills, and Education.`
        },
        {
          role: 'user',
          content: `Create a resume for: ${userPrompt}`,
        },
      ],
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a resume.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Resume API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate resume' },
      { status: 500 }
    );
  }
}
