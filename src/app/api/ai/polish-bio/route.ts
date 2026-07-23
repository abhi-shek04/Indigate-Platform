import { streamText } from 'ai';
import { getAIModel } from '@/lib/ai-provider';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { bio } = await req.json();

    if (!bio) {
      return new NextResponse('Missing bio text', { status: 400 });
    }

    const result = streamText({
      model: getAIModel(),
      system: `You are an expert career coach and resume writer for IndiGate, helping Indian candidates apply for jobs in Japan.
The user has provided a rough draft of their "Self-PR" (Personal Statement / Introduction).
Your task is to polish and rewrite it into a highly professional, confident, and engaging English introduction.
Fix any grammatical errors, improve vocabulary, and structure it clearly (1-2 short paragraphs).
Do not add completely fabricated skills or experiences; only polish what is provided or implied.
Return ONLY the polished text. Do not include markdown headers like "# Introduction".`,
      prompt: `Please polish this Self-PR text: ${bio}`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('AI Bio Polishing Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
