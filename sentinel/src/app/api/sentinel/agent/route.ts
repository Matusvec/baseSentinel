import { NextResponse } from 'next/server';
import { reason } from '@/lib/reasoning-engine';

/**
 * POST /api/sentinel/agent — Autonomous agent endpoint.
 * Called by the perception route when the AI reasoning engine decides to act.
 * Uses the unified reasoning engine with the full tool registry.
 */
export async function POST(request: Request) {
  try {
    const { trigger, perception } = await request.json();

    const result = await reason({
      type: 'perception_event',
      perception,
      trigger,
    });

    return NextResponse.json({
      acted: result.shouldAct,
      reasoning: result.reasoning,
      tools_used: result.toolCalls.map(tc => tc.tool),
      results: result.toolResults,
    });
  } catch (error) {
    console.error('Agent error:', error);
    return NextResponse.json({ error: 'Agent processing failed' }, { status: 500 });
  }
}
