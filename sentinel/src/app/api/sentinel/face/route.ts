import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

const PYTHON_URL = process.env.PYTHON_URL || 'http://localhost:5000';

/**
 * POST /api/sentinel/face — Register a known face.
 * Body: { name: string, image: string (base64 JPEG) }
 */
export async function POST(request: Request) {
  try {
    const { name, image } = await request.json();
    if (!name || !image) {
      return NextResponse.json({ error: 'name and image required' }, { status: 400 });
    }

    const db = await getDb();

    // Upsert in MongoDB (source of truth)
    await db.collection('known_faces').updateOne(
      { name },
      { $set: { name, image, updatedAt: new Date() } },
      { upsert: true }
    );

    // Forward to Python so in-memory registry is updated
    try {
      await fetch(`${PYTHON_URL}/register_face`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, image }),
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      // Python might not be running — face is still in MongoDB
    }

    return NextResponse.json({ ok: true, name });
  } catch (error) {
    console.error('[face] Register error:', error);
    return NextResponse.json({ error: 'Failed to register face' }, { status: 500 });
  }
}

/**
 * GET /api/sentinel/face — List all known faces.
 * Add ?include_images=true to include base64 images (used by Python sync).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeImages = searchParams.get('include_images') === 'true';

    const db = await getDb();
    const projection = includeImages
      ? { name: 1, image: 1, _id: 0 }
      : { name: 1, updatedAt: 1, _id: 0 };
    const faces = await db.collection('known_faces')
      .find({}, { projection })
      .sort({ name: 1 })
      .toArray();
    return NextResponse.json({ faces });
  } catch (error) {
    console.error('[face] List error:', error);
    return NextResponse.json({ faces: [] });
  }
}

/**
 * DELETE /api/sentinel/face — Remove a known face.
 * Body: { name: string }
 */
export async function DELETE(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'name required' }, { status: 400 });
    }

    const db = await getDb();
    await db.collection('known_faces').deleteOne({ name });

    // Remove from Python in-memory registry
    try {
      await fetch(`${PYTHON_URL}/unregister_face`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
        signal: AbortSignal.timeout(3000),
      });
    } catch { /* Python might not be running */ }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[face] Delete error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
