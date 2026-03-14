import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, params } = body;

    const rpiUrl = process.env.RPI_URL || 'http://localhost:5000';
    let rpiPath: string;
    let rpiBody: Record<string, unknown>;

    switch (action) {
      case 'gimbal':
        rpiPath = '/gimbal';
        rpiBody = { pan: params.pan, tilt: params.tilt };
        break;
      case 'scan_start':
        rpiPath = '/scan';
        rpiBody = { action: 'start' };
        break;
      case 'scan_stop':
        rpiPath = '/scan';
        rpiBody = { action: 'stop' };
        break;
      case 'alert':
        rpiPath = '/alert';
        rpiBody = { color: params.color, buzzer: params.buzzer };
        break;
      case 'raw':
        rpiPath = '/command';
        rpiBody = { command: params.command };
        break;
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    const response = await fetch(`${rpiUrl}${rpiPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rpiBody),
      signal: AbortSignal.timeout(3000),
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Command error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
