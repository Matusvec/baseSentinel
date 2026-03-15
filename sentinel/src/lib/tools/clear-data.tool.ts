import type { ToolDefinition } from './types';

export const clearDataTool: ToolDefinition = {
  name: 'clear_data',
  description: 'Clear historical data from the database. Can clear chat history, detection logs, events, or analysis results. Does NOT delete known faces or mission configs. Use when the user says "clear history", "delete old data", "clean up", etc.',
  parameters: [
    {
      name: 'collection',
      type: 'string',
      description: 'What to clear',
      required: true,
      enum: ['chat_messages', 'detections', 'events', 'agent_decisions', 'analysis_results', 'all'],
    },
    {
      name: 'older_than_minutes',
      type: 'number',
      description: 'Only delete data older than this many minutes ago. Use 0 to delete everything.',
      required: false,
      default: 0,
    },
  ],
  category: 'system',
  async execute(params, context) {
    const target = params.collection as string;
    const minutes = (params.older_than_minutes as number) ?? 0;
    const cutoff = minutes > 0 ? new Date(Date.now() - minutes * 60 * 1000) : new Date('2000-01-01');

    const filter = { timestamp: { $lt: cutoff } };
    // For chat_messages, also match on no timestamp (old format)
    const chatFilter = minutes > 0
      ? { timestamp: { $lt: cutoff } }
      : {};

    const clearable = ['chat_messages', 'detections', 'events', 'agent_decisions', 'analysis_results'];
    const targets = target === 'all' ? clearable : [target];

    if (!clearable.includes(target) && target !== 'all') {
      return { success: false, error: `Cannot clear "${target}" — only: ${clearable.join(', ')}, all` };
    }

    const results: Record<string, number> = {};
    for (const col of targets) {
      const f = col === 'chat_messages' ? chatFilter : filter;
      const result = await context.db.collection(col).deleteMany(f);
      results[col] = result.deletedCount;
    }

    const total = Object.values(results).reduce((a, b) => a + b, 0);
    const summary = Object.entries(results)
      .filter(([, count]) => count > 0)
      .map(([col, count]) => `${count} from ${col}`)
      .join(', ');

    return {
      success: true,
      data: {
        deleted: total,
        details: results,
        message: total > 0
          ? `Cleared ${summary}`
          : 'No matching data to clear',
      },
    };
  },
};
