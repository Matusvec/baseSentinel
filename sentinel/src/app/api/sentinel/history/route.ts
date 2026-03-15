import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timerange = searchParams.get('timerange') || '15m';
    const type = searchParams.get('type') || 'all';
    const parsedLimit = parseInt(searchParams.get('limit') || '50');
    const limit = Math.min(Number.isNaN(parsedLimit) ? 50 : parsedLimit, 500);

    const TIMERANGE_MAP: Record<string, number> = { '5m': 5, '15m': 15, '30m': 30, '1h': 60 };
    const minutes = TIMERANGE_MAP[timerange] ?? (parseInt(timerange) || 15);
    const since = new Date(Date.now() - minutes * 60 * 1000);

    const db = await getDb();

    if (type === 'events') {
      const events = await db
        .collection('events')
        .find({ timestamp: { $gte: since } })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
      return NextResponse.json({ events });
    }

    if (type === 'decisions') {
      const decisions = await db
        .collection('agent_decisions')
        .find({ timestamp: { $gte: since } })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
      return NextResponse.json({ decisions });
    }

    // Default: return detections with aggregated stats
    const detections = await db
      .collection('detections')
      .find({ timestamp: { $gte: since } })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    const stats = await db.collection('detections').aggregate([
      { $match: { timestamp: { $gte: since } } },
      {
        $group: {
          _id: null,
          total_frames: { $sum: 1 },
          // Count frames where at least 1 person was detected
          total_detections: {
            $sum: {
              $cond: [
                { $gt: [{ $ifNull: ['$local_cv.person_count', 0] }, 0] },
                1,
                0,
              ],
            },
          },
          // Average people per frame (using local CV, not Gemini)
          avg_people: {
            $avg: { $ifNull: ['$local_cv.person_count', 0] },
          },
          // Peak concurrent people
          max_people: {
            $max: { $ifNull: ['$local_cv.person_count', 0] },
          },
          alerts: {
            $sum: {
              $cond: [
                { $or: [
                  { $eq: [{ $arrayElemAt: ['$sensors.ir', 0] }, 1] },
                  { $eq: [{ $arrayElemAt: ['$sensors.ir', 1] }, 1] },
                ]},
                1,
                0,
              ],
            },
          },
        },
      },
    ]).toArray();

    return NextResponse.json({
      detections: detections.map(d => ({
        _id: d._id,
        timestamp: d.timestamp,
        vision: d.vision,
        sensors: d.sensors,
      })),
      stats: stats[0] || { total_detections: 0, avg_people: 0, max_people: 0, alerts: 0 },
    });
  } catch (error) {
    console.error('History error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
