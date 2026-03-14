import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timerange = searchParams.get('timerange') || '15m';
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    const minutes = parseInt(timerange) || 15;
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
          total_detections: { $sum: 1 },
          avg_people: { $avg: { $size: { $ifNull: ['$vision.people', []] } } },
          max_people: { $max: { $size: { $ifNull: ['$vision.people', []] } } },
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
