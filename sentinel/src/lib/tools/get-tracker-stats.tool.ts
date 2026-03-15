import type { ToolDefinition } from './types';

export const getTrackerStatsTool: ToolDefinition = {
  name: 'get_tracker_stats',
  description: 'Get real-time person tracking statistics — unique people seen, currently visible, entering/exiting counts, net flow, and minutes since last movement.',
  parameters: [],
  category: 'data',
  async execute(_params, context) {
    return {
      success: true,
      data: context.trackerStats,
    };
  },
};
