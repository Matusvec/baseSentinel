import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, params } = body;

    const pythonUrl = process.env.PYTHON_URL || 'http://localhost:5000';
    let rpiPath: string;
    let rpiBody: Record<string, unknown>;

    switch (action) {
      case 'gimbal':
        rpiPath = '/gimbal';
        rpiBody = { pan: params?.pan ?? 90, tilt: params?.tilt ?? 90 };
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
        rpiBody = { color: params?.color ?? 'green', buzzer: params?.buzzer ?? false };
        break;
      case 'raw':
        rpiPath = '/command';
        rpiBody = { command: params?.command ?? '' };
        break;
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    // Try to reach the hardware server — if unavailable, succeed anyway (software-only mode)
    try {
      const response = await fetch(`${pythonUrl}${rpiPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rpiBody),
        signal: AbortSignal.timeout(2000),
      });
      const result = await response.json();
      return NextResponse.json({ ...result, hardware: true });
    } catch {
      // Hardware unreachable — that's fine, command accepted in software-only mode
      console.log(`[command] Python server unreachable for ${action} — software-only mode`);
      return NextResponse.json({ ok: true, hardware: false, simulated: true });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Command error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
