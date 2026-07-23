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

    const { title, companyName } = await req.json();

    if (!title) {
      return new NextResponse('Missing job title', { status: 400 });
    }

    const result = streamText({
      model: getAIModel(),
      system: `You are an expert HR recruiter and copywriter for IndiGate, an India-to-Japan talent platform.
Your task is to write a highly professional, attractive Job Description in Markdown format.
Include these sections if appropriate:
- Role Overview
- Key Responsibilities
- Qualifications & Skills
- Why Join Us / Perks

The tone should be welcoming, professional, and clear. Format the response strictly in Markdown. Do not include a title header like "# Job Description", just start with the Role Overview or a strong opening hook.`,
      prompt: `Write a compelling job description for a ${title} position at ${companyName || 'our company'}.`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('AI Generation Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
