export interface PatternAnalysis {
  situation_assessment: {
    activity_level: 'low' | 'moderate' | 'high' | 'critical';
    crowd_density: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    overall_risk: 'normal' | 'elevated' | 'high';
  };
  patterns_detected: Array<{
    type: string;
    description: string;
    confidence: number;
    severity: 'info' | 'warning' | 'alert';
    location_in_frame?: string;
    reasoning: string;
  }>;
  recommendations: Array<{
    action: string;
    target: string;
    reasoning: string;
  }>;
  spoken_summary: string;
  narration_context: 'detection' | 'alert' | 'summary';
}

/**
 * Analyze behavioral patterns using Featherless.AI (Llama 3.1 70B).
 * This provides the "reasoning layer" — deep analysis of detection patterns over time.
 */
export async function analyzePatterns(
  perception: Record<string, unknown>,
  trigger: string
): Promise<PatternAnalysis | null> {
  const apiKey = process.env.FEATHERLESS_API_KEY;
  if (!apiKey) {
    console.error('FEATHERLESS_API_KEY not set');
    return null;
  }

  try {
    const response = await fetch('https://api.featherless.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
        messages: [
          {
            role: 'system',
            content: `You are SENTINEL's behavioral analysis engine. Analyze detection patterns and identify anomalies, trends, and insights.

ANALYSIS FRAMEWORK:
1. Traffic patterns: Are people moving through normally or is there congestion?
2. Behavioral anomalies: Is someone lingering unusually long? Moving erratically?
3. Crowd dynamics: Is density increasing/decreasing? Where are clusters forming?
4. Temporal patterns: How does current activity compare to baseline?
5. Object analysis: Any abandoned items? Unusual objects?

Respond ONLY in JSON:
{
  "situation_assessment": { "activity_level": "low|moderate|high|critical", "crowd_density": N, "trend": "increasing|stable|decreasing", "overall_risk": "normal|elevated|high" },
  "patterns_detected": [{ "type": "string", "description": "string", "confidence": 0-1, "severity": "info|warning|alert", "reasoning": "string" }],
  "recommendations": [{ "action": "track|investigate|alert|ignore", "target": "string", "reasoning": "string" }],
  "spoken_summary": "30-50 word natural language summary for voice narration",
  "narration_context": "detection|alert|summary"
}`,
          },
          {
            role: 'user',
            content: `Trigger: ${trigger}\nPerception: ${JSON.stringify(perception.vision)}\nSensors: ${JSON.stringify(perception.sensors)}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    return JSON.parse(
      data.choices[0].message.content.replace(/```json|```/g, '').trim()
    );
  } catch (error) {
    console.error('Featherless analysis error:', error);
    return null;
  }
}
