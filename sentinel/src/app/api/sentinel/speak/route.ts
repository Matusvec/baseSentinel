import { NextResponse } from 'next/server';
import { generateSpeech, type VoiceContext } from '@/lib/elevenlabs';

export async function POST(request: Request) {
  try {
    const { text, context } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const result = await generateSpeech(text, (context as VoiceContext) || 'detection');

    if (!result) {
      return NextResponse.json({ error: 'Speech generation failed' }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Speak error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
