import { NextResponse } from 'next/server';

/**
 * Proxies a browser-captured frame to the local Python VisionEngine for CV analysis.
 * Browser sends base64 JPEG → this route forwards to the local Python server → returns CV results.
 */
export async function POST(request: Request) {
  try {
    const { frame } = await request.json();
    if (!frame) {
      return NextResponse.json({ error: 'no frame' }, { status: 400 });
    }

    const pythonUrl = process.env.PYTHON_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${pythonUrl}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frame }),
        signal: AbortSignal.timeout(3000),
      });
      const result = await response.json();
      return NextResponse.json(result);
    } catch {
      // Python not running — return empty result so browser still works
      return NextResponse.json({ ok: true, local_cv: null, enriched_persons: [] });
    }
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
