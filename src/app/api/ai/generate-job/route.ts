import { streamText } from 'ai';
import { getAIModel } from '@/lib/ai-provider';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'COMPANY')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { title, companyName, description } = await req.json();

    if (!title) {
      return new NextResponse('Missing job title', { status: 400 });
    }

    if (
      !process.env.GOOGLE_GENERATIVE_AI_API_KEY &&
      !process.env.GOOGLE_API_KEY &&
      !process.env.GROQ_API_KEY &&
      !process.env.OPENAI_API_KEY
    ) {
      return new NextResponse('No AI Provider API Keys configured in .env file', { status: 400 });
    }

    const isPolish = !!description && description.trim().length > 10;

    const systemPrompt = isPolish
      ? `You are an expert HR copywriter. Your task is to polish, clean up, and format the provided draft Job Description into a highly professional, well-structured Markdown format. Fix grammar, improve structure, use bullet points, and make it engaging. Do not fabricate facts, just polish what is there. Do not include a title header like "# Job Description", just start with the polished content.`
      : `You are an expert HR recruiter and copywriter for IndiGate, an India-to-Japan talent platform.
Your task is to write a highly professional, attractive Job Description in Markdown format.
Include these sections if appropriate:
- Role Overview
- Key Responsibilities
- Qualifications & Skills
- Why Join Us / Perks

The tone should be welcoming, professional, and clear. Format the response strictly in Markdown. Do not include a title header like "# Job Description", just start with the Role Overview or a strong opening hook.`;

    const prompt = isPolish
      ? `Please polish and format this draft job description for a ${title} position at ${companyName || 'our company'}:\n\n${description}`
      : `Write a compelling job description for a ${title} position at ${companyName || 'our company'}.`;

    const result = streamText({
      model: getAIModel(),
      system: systemPrompt,
      prompt: prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('AI Generation Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
