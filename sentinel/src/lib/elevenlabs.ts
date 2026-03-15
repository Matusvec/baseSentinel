const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'onwK4e9ZLuTAKqWW03F9';

export type VoiceContext = 'detection' | 'alert' | 'summary' | 'tracking';

const VOICE_PROFILES: Record<VoiceContext, { stability: number; similarity_boost: number; style: number }> = {
  detection: { stability: 0.8, similarity_boost: 0.8, style: 0.15 },
  alert: { stability: 0.55, similarity_boost: 0.85, style: 0.4 },
  summary: { stability: 0.75, similarity_boost: 0.75, style: 0.2 },
  tracking: { stability: 0.85, similarity_boost: 0.8, style: 0.1 },
};

/**
 * Generate speech audio from text using ElevenLabs TTS.
 * Returns base64-encoded audio (mp3).
 */
export async function generateSpeech(
  text: string,
  context: VoiceContext = 'detection'
): Promise<{ audio_base64: string } | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('ELEVENLABS_API_KEY not set');
    return null;
  }

  try {
    const settings = VOICE_PROFILES[context] || VOICE_PROFILES.detection;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2',
          voice_settings: settings,
        }),
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!response.ok) {
      console.error('ElevenLabs error:', response.status, await response.text());
      return null;
    }

    const buffer = await response.arrayBuffer();
    return { audio_base64: Buffer.from(buffer).toString('base64') };
  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    return null;
  }
}
