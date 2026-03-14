import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// In-memory latest state for real-time dashboard polling
let latestPerception: Record<string, unknown> | null = null;

export async function POST(request: Request) {
  try {
    const perception = await request.json();
    latestPerception = perception;

    const db = await getDb();

    await db.collection('detections').insertOne({
      ...perception,
      timestamp: new Date(perception.timestamp),
      received_at: new Date(),
    });

    // Check if this needs agent processing
    const trigger = shouldTriggerAgent(perception);

    if (trigger) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      fetch(`${baseUrl}/api/sentinel/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: trigger.trigger, perception }),
      }).catch(console.error);
    }

    return NextResponse.json({ status: 'ok', agent_triggered: !!trigger });
  } catch (error) {
    console.error('Perception error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ perception: latestPerception });
}

function shouldTriggerAgent(perception: Record<string, unknown>) {
  const vision = perception.vision as Record<string, unknown> | undefined;
  const sensors = perception.sensors as Record<string, unknown> | undefined;
  const distances = sensors?.d as Record<string, number> | undefined;
  const ir = sensors?.ir as number[] | undefined;

  // Perimeter breach — always trigger
  if (ir?.[0] === 1 || ir?.[1] === 1) {
    return { trigger: 'perimeter_breach' };
  }

  const people = vision?.people as unknown[] | undefined;

  // New person detected close
  if (people && people.length > 0 && distances?.f && distances.f < 200) {
    return { trigger: 'person_close', distance: distances.f };
  }

  // Crowd increase
  if (people && people.length >= 3) {
    return { trigger: 'crowd_detected', count: people.length };
  }

  return null;
}
