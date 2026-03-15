import type { ToolDefinition } from './types';
import { generateSpeech } from '@/lib/elevenlabs';

export const speakTool: ToolDefinition = {
  name: 'speak',
  description: 'Speak a message aloud using text-to-speech. Use for alerts, summaries, or responding to the user verbally.',
  parameters: [
    { name: 'text', type: 'string', description: 'The text to speak', required: true },
    { name: 'tone', type: 'string', description: 'Voice tone', required: false, enum: ['detection', 'alert', 'summary', 'tracking'], default: 'detection' },
  ],
  category: 'communication',
  async execute(params) {
    const text = params.text as string;
    const tone = (params.tone as string) || 'detection';
    const result = await generateSpeech(text, tone as 'detection' | 'alert' | 'summary' | 'tracking');
    return { success: true, data: { audio_base64: result?.audio_base64 } };
  },
};
