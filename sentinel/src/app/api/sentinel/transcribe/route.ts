import { NextResponse } from 'next/server';

/**
 * POST /api/sentinel/transcribe — Speech-to-text via ElevenLabs Scribe.
 * Accepts audio as base64 or raw form data, returns transcribed text.
 */
export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ELEVENLABS_API_KEY not set' }, { status: 500 });
  }

  try {
    let audioBlob: Blob;

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      // Base64 audio in JSON body
      const { audio, mimeType } = await request.json();
      if (!audio) {
        return NextResponse.json({ error: 'audio required' }, { status: 400 });
      }
      const buffer = Buffer.from(audio, 'base64');
      audioBlob = new Blob([buffer], { type: mimeType || 'audio/webm' });
    } else {
      // Raw form data
      const formData = await request.formData();
      const file = formData.get('audio') as Blob | null;
      if (!file) {
        return NextResponse.json({ error: 'audio file required' }, { status: 400 });
      }
      audioBlob = file;
    }

    // Send to ElevenLabs STT (field must be named "file")
    const form = new FormData();
    form.append('file', audioBlob, 'recording.webm');
    form.append('model_id', 'scribe_v1');
    form.append('language_code', 'en');  // force English

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: form,
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[transcribe] ElevenLabs STT error:', response.status, errText);
      return NextResponse.json({ error: `STT failed: ${response.status}`, detail: errText }, { status: 502 });
    }

    const data = await response.json();
    console.log('[transcribe] Result:', data.text?.slice(0, 80) || '(empty)');
    return NextResponse.json({ text: data.text || '' });
  } catch (error) {
    console.error('[transcribe] Error:', error);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
