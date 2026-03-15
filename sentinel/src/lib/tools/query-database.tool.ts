import type { ToolDefinition } from './types';

export const queryDatabaseTool: ToolDefinition = {
  name: 'query_database',
  description: 'Query the SENTINEL database for historical data. Use for "what happened today?", "show me the history", "who was here earlier?", etc. Returns a pre-summarized view of events, detections, and analyses.',
  parameters: [
    { name: 'collection', type: 'string', description: 'What to query', required: true, enum: ['events', 'detections', 'analysis_results', 'known_faces', 'chat_messages', 'all_activity'] },
    { name: 'minutes_ago', type: 'number', description: 'Look back this many minutes (default 30, max 1440 for 24h)', required: false, default: 30 },
    { name: 'limit', type: 'number', description: 'Max items to return', required: false, default: 30 },
  ],
  category: 'data',
  async execute(params, context) {
    const collection = params.collection as string;
    const minutes = Math.min((params.minutes_ago as number) || 30, 1440);
    const limit = Math.min((params.limit as number) || 30, 100);
    const since = new Date(Date.now() - minutes * 60 * 1000);
    const tz = 'America/Los_Angeles';

    const formatTime = (ts: unknown) => {
      try { return new Date(ts as string).toLocaleTimeString('en-US', { hour12: true, timeZone: tz }); }
      catch { return '??'; }
    };

    // "all_activity" combines events + detections summary
    if (collection === 'all_activity') {
      const [events, detectionStats, analyses] = await Promise.all([
        context.db.collection('events')
          .find({ timestamp: { $gte: since } })
          .sort({ timestamp: -1 })
          .limit(limit)
          .toArray(),
        context.db.collection('detections').aggregate([
          { $match: { timestamp: { $gte: since } } },
          {
            $group: {
              _id: null,
              total_frames: { $sum: 1 },
              avg_people: { $avg: { $ifNull: ['$local_cv.person_count', 0] } },
              max_people: { $max: { $ifNull: ['$local_cv.person_count', 0] } },
            },
          },
        ]).toArray(),
        context.db.collection('analysis_results')
          .find({ timestamp: { $gte: since } })
          .sort({ timestamp: -1 })
          .limit(5)
          .toArray(),
      ]);

      // Deduplicate events by type+description (keep first occurrence)
      const seen = new Set<string>();
      const uniqueEvents = events.filter(e => {
        const key = `${e.event_type}:${e.description}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Group face recognitions by name
      const faceEvents = events.filter(e => e.event_type === 'face_recognized');
      const faceCounts: Record<string, { count: number; first: string; last: string }> = {};
      for (const e of faceEvents) {
        const name = (e.description as string).match(/Known person identified: (\w+)/)?.[1] ?? 'unknown';
        if (!faceCounts[name]) faceCounts[name] = { count: 0, first: formatTime(e.timestamp), last: formatTime(e.timestamp) };
        faceCounts[name].count++;
        faceCounts[name].first = formatTime(e.timestamp); // events are desc, so last in loop = earliest
      }

      const stats = detectionStats[0] ?? { total_frames: 0, avg_people: 0, max_people: 0 };

      return {
        success: true,
        data: {
          timerange: `last ${minutes} minutes`,
          stats: {
            total_perception_frames: stats.total_frames,
            avg_people_per_frame: Math.round((stats.avg_people ?? 0) * 10) / 10,
            peak_people: stats.max_people ?? 0,
          },
          people_seen: Object.entries(faceCounts).map(([name, info]) =>
            `${name}: seen ${info.count} times (first: ${info.first}, last: ${info.last})`
          ),
          notable_events: uniqueEvents
            .filter(e => e.event_type !== 'face_recognized')
            .slice(0, 15)
            .map(e => `[${formatTime(e.timestamp)}] ${e.event_type}: ${e.description}`),
          recent_analyses: analyses.slice(0, 3).map(a =>
            `[${formatTime(a.timestamp)}] ${a.result?.spoken_summary ?? 'No summary'}`
          ),
        },
      };
    }

    // Standard single-collection query with slim output
    const docs = await context.db
      .collection(collection)
      .find({ timestamp: { $gte: since } })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    // Slim down the output based on collection type
    const slimmed = docs.map(d => {
      const time = formatTime(d.timestamp);
      switch (collection) {
        case 'events':
          return `[${time}] ${d.event_type}: ${d.description}`;
        case 'detections':
          return `[${time}] ${d.local_cv?.person_count ?? d.context?.people_count ?? 0} people`;
        case 'analysis_results':
          return `[${time}] ${d.result?.spoken_summary ?? 'No summary'}`;
        case 'chat_messages':
          return `[${time}] ${d.role}: ${(d.text as string)?.slice(0, 100)}`;
        case 'known_faces':
          return d.name;
        default:
          return `[${time}] ${JSON.stringify(d).slice(0, 150)}`;
      }
    });

    return {
      success: true,
      data: {
        collection,
        count: docs.length,
        timerange: `last ${minutes} minutes`,
        items: slimmed,
      },
    };
  },
};
