import { getVisionPrompt } from '@/lib/mission';

export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedPerson {
  id: number;
  bbox: BBox;
  distance: 'near' | 'mid' | 'far';
  activity: string;
  description: string;
  facing: string;
  interesting?: boolean;
}

export interface DetectedObject {
  label: string;
  bbox: BBox;
  description?: string;
  interesting?: boolean;
}

export interface EnvironmentInfo {
  lighting?: string;
  crowd_density: string;
  activity_level: string;
  scene_description: string;
}

export interface VisionAnalysis {
  people: DetectedPerson[];
  objects: DetectedObject[];
  environment: EnvironmentInfo;
  motion_detected: boolean;
  motion_direction?: string | null;
}

/**
 * Analyze a camera frame using Gemini Vision API.
 * Uses the active mission's custom vision prompt if one is set,
 * otherwise falls back to the default generic prompt.
 */
export async function analyzeFrame(
  imageBase64: string,
  customPrompt?: string
): Promise<VisionAnalysis | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not set');
    return null;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
              { text: customPrompt || getVisionPrompt() },
            ],
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1500,
          },
        }),
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error('Gemini Vision: empty or blocked response', data.candidates?.[0]?.finishReason);
      return null;
    }
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch (error) {
    console.error('Gemini Vision error:', error);
    return null;
  }
}

// planAgentResponse removed — replaced by unified reasoning engine (reasoning-engine.ts)
