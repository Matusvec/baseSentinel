import { NextResponse } from 'next/server';
import {
  createMission,
  getMission,
  clearMission,
} from '@/lib/mission-engine';
import { getVisionPrompt } from '@/lib/mission';
import { setMode } from '@/lib/mode';

/**
 * GET /api/sentinel/mission — returns the active mission config and current vision prompt.
 * Python's sentinel.py polls this to get the mission-specific vision prompt.
 * Frontend polls this to get analysisIntervalSeconds for Featherless timing.
 */
export async function GET() {
  const mission = await getMission();
  return NextResponse.json({
    mission: mission
      ? {
          id: mission.id,
          missionName: mission.missionName,
          instruction: mission.instruction,
          status: mission.status,
          triggers: mission.triggers,
          extractionFields: mission.extractionFields,
          speakBehavior: mission.speakBehavior,
          analysisIntervalSeconds: mission.analysisIntervalSeconds,
          createdAt: mission.createdAt,
        }
      : null,
    visionPrompt: getVisionPrompt(),
  });
}

/**
 * POST /api/sentinel/mission — create a new mission from a plain-English instruction.
 *
 * Body: { instruction: "count how many people walk through this hallway" }
 *
 * The instruction is sent to Gemini with a detailed meta-prompt (including 4
 * few-shot examples) and parsed into a full MissionConfig that rewires the
 * entire perception pipeline.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const instruction = body.instruction;
    if (!instruction || typeof instruction !== 'string') {
      return NextResponse.json(
        { error: 'instruction is required (string)' },
        { status: 400 }
      );
    }

    const mission = await createMission(instruction.trim());
    setMode('monitor');

    return NextResponse.json({
      ok: true,
      mission: {
        id: mission.id,
        missionName: mission.missionName,
        instruction: mission.instruction,
        triggers: mission.triggers,
        extractionFields: mission.extractionFields,
        visionPrompt: mission.visionPrompt,
        featherlessSystemPrompt: mission.featherlessSystemPrompt,
        speakBehavior: mission.speakBehavior,
        analysisIntervalSeconds: mission.analysisIntervalSeconds,
      },
      visionPrompt: getVisionPrompt(),
    });
  } catch (error) {
    console.error('Mission creation error:', error);
    return NextResponse.json(
      { error: 'Mission creation failed' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sentinel/mission — clears the active mission.
 * Marks it as 'completed' in MongoDB (preserving history) and
 * reverts SENTINEL to default perception behavior.
 */
export async function DELETE() {
  try {
    await clearMission();
    setMode('chat');
    return NextResponse.json({ ok: true, mission: null });
  } catch (error) {
    console.error('Mission clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear mission' },
      { status: 500 }
    );
  }
}
