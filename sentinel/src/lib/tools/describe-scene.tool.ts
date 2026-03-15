import type { ToolDefinition } from './types';

export const describeSceneTool: ToolDefinition = {
  name: 'describe_scene',
  description: 'Analyze the current camera frame with Gemini Vision AI. ALWAYS pass the user\'s question as the "focus" parameter so the analysis is targeted. For counting questions, pass "count the [objects]". For identification, pass "identify [thing]". Returns precise, detailed analysis.',
  parameters: [
    { name: 'focus', type: 'string', description: 'REQUIRED: the specific question to answer about the scene (e.g., "count the flags", "what color is the person\'s shirt", "is anyone sitting down")', required: true },
  ],
  category: 'analysis',
  async execute(params, context) {
    let frame = context.frameB64;

    // Fallback: grab frame from Python if not in perception cache
    if (!frame) {
      console.log('[describe_scene] No frame in context, fetching from Python...');
      try {
        const res = await fetch('http://localhost:5000/frame_b64', { signal: AbortSignal.timeout(3000) });
        console.log('[describe_scene] Python response status:', res.status);
        if (res.ok) {
          const data = await res.json();
          frame = (data.frame_b64 as string) || null;
          console.log('[describe_scene] Got frame:', frame ? `${frame.length} chars` : 'null');
        }
      } catch (err) {
        console.error('[describe_scene] Python fetch failed:', err);
      }
    }

    if (!frame) {
      return { success: false, error: 'No camera frame available — Python may not be running or no browser connected' };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { success: false, error: 'No Gemini API key' };

    const focus = (params.focus as string) || 'describe everything you see';
    const prompt = `You are analyzing a live camera frame. Answer this specific question:

"${focus}"

RULES:
- Give EXACT counts (not "several" or "multiple" — count them: 1, 2, 3...)
- Be PRECISE about colors, positions, sizes
- If asked to identify something, say exactly what you see
- If you can't see the thing being asked about, say "I don't see any [thing] in the frame"
- Keep your answer focused on the question, not a general scene description`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inlineData: { mimeType: 'image/jpeg', data: frame } },
                { text: prompt },
              ],
            }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 500 },
          }),
          signal: AbortSignal.timeout(10000),
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        return { success: false, error: `Gemini returned no response (${data.candidates?.[0]?.finishReason ?? 'unknown'})` };
      }
      return { success: true, data: { description: text } };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Vision analysis failed' };
    }
  },
};
