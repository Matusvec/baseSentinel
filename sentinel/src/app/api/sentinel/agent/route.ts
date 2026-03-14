import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { planAgentResponse } from '@/lib/gemini';
import { generateSpeech } from '@/lib/elevenlabs';
import { analyzePatterns } from '@/lib/featherless';

export async function POST(request: Request) {
  try {
    const { trigger, perception } = await request.json();

    // Step 1: Gemini plans the response
    const plan = await planAgentResponse(trigger, perception);

    // Step 2: Execute tool chain
    const results: Array<{ tool: string; result: unknown }> = [];
    for (const step of plan.steps) {
      let result: unknown;
      switch (step.tool) {
        case 'move_gimbal':
          result = await sendToRPi('/gimbal', step.params);
          break;
        case 'set_alert':
          result = await sendToRPi('/alert', step.params);
          break;
        case 'analyze_patterns':
          result = await analyzePatterns(perception, trigger);
          break;
        case 'speak':
          result = await generateSpeech(
            step.params.text as string,
            (step.params.context as 'detection' | 'alert' | 'summary') || 'detection'
          );
          break;
        case 'query_memory':
          result = await queryDetectionHistory(step.params);
          break;
        case 'start_tracking':
          result = await sendToRPi('/gimbal', calculateTrackingGimbal(perception, step.params));
          break;
        default:
          result = { error: `Unknown tool: ${step.tool}` };
      }
      results.push({ tool: step.tool, result });
    }

    // Step 3: Store agent decision in MongoDB
    const db = await getDb();
    await db.collection('agent_decisions').insertOne({
      timestamp: new Date(),
      trigger,
      plan,
      results,
      perception_snapshot: {
        people_count: (perception.vision?.people as unknown[])?.length || 0,
        distances: perception.sensors?.d,
        perimeter: perception.sensors?.ir,
      },
    });

    // Also store as an event for the timeline
    await db.collection('events').insertOne({
      timestamp: new Date(),
      event_type: trigger,
      severity: trigger === 'perimeter_breach' ? 'alert' : 'info',
      description: plan.reasoning,
      agent_response: { tool_chain: plan.steps.map(s => s.tool) },
    });

    return NextResponse.json({ plan, results });
  } catch (error) {
    console.error('Agent error:', error);
    return NextResponse.json({ error: 'Agent processing failed' }, { status: 500 });
  }
}

async function sendToRPi(path: string, params: Record<string, unknown>) {
  const rpiUrl = process.env.RPI_URL || 'http://localhost:5000';
  try {
    const response = await fetch(`${rpiUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(3000),
    });
    return await response.json();
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error(`RPi command failed: ${message}`);
    return { error: message };
  }
}

async function queryDetectionHistory(params: Record<string, unknown>) {
  const db = await getDb();
  const timerange = (params.timerange as string) || '5m';
  const minutes = parseInt(timerange) || 5;
  const since = new Date(Date.now() - minutes * 60 * 1000);

  const detections = await db
    .collection('detections')
    .find({ timestamp: { $gte: since } })
    .sort({ timestamp: -1 })
    .limit(50)
    .toArray();

  return {
    count: detections.length,
    timerange,
    detections: detections.map(d => ({
      timestamp: d.timestamp,
      people_count: d.vision?.people?.length || 0,
      distances: d.sensors?.d,
    })),
  };
}

function calculateTrackingGimbal(
  perception: Record<string, unknown>,
  params: Record<string, unknown>
) {
  const vision = perception.vision as Record<string, unknown> | undefined;
  const people = vision?.people as Array<{ id: number; bbox: { x: number; y: number; width: number; height: number } }> | undefined;
  const targetId = (params.target_id as number) || 1;
  // Find by person ID first, fall back to array index 0 (closest person)
  const person = people?.find(p => p.id === targetId) ?? people?.[0];

  if (!person?.bbox) {
    return { pan: 90, tilt: 90 };
  }

  const centerX = person.bbox.x + person.bbox.width / 2;
  const centerY = person.bbox.y + person.bbox.height / 2;

  // Map normalized coords to servo angles
  const pan = Math.round(centerX * 180);
  const tilt = Math.round(45 + centerY * 90);

  return {
    pan: Math.max(0, Math.min(180, pan)),
    tilt: Math.max(45, Math.min(135, tilt)),
  };
}
