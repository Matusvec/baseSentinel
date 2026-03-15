import { NextResponse } from 'next/server';
import { pollAndRoute } from '@/lib/telegram-poll';
import { runTemporalAnalysis } from '@/lib/temporal-analysis';
import { getMode } from '@/lib/mode';
import { getMission } from '@/lib/mission-engine';
import { getVisibleCount, getUniqueCount } from '@/lib/person-tracker';

/**
 * GET /api/sentinel/heartbeat — Lightweight endpoint that drives Telegram
 * polling independently of the Python perception pipeline.
 *
 * Both pollAndRoute() and runTemporalAnalysis() are internally throttled
 * (3s and 15s respectively), so hitting this at any frequency is safe.
 */
export async function GET() {
  try {
    // Drive Telegram inbound message polling
    await pollAndRoute();

    // Drive temporal analysis with a minimal synthetic payload
    // (runTemporalAnalysis will no-op if no active mission or throttle not elapsed)
    await runTemporalAnalysis({
      source: 'heartbeat',
      timestamp: new Date().toISOString(),
      local_cv: { person_count: getVisibleCount(), persons: [] },
    });

    const mode = getMode();
    const mission = await getMission();

    return NextResponse.json({
      status: 'ok',
      mode,
      mission: mission
        ? { id: mission.id, missionName: mission.missionName, status: mission.status }
        : null,
      visible: getVisibleCount(),
      unique: getUniqueCount(),
      ts: Date.now(),
    });
  } catch (error) {
    console.error('[heartbeat] Error:', error);
    return NextResponse.json({ error: 'Heartbeat failed' }, { status: 500 });
  }
}
