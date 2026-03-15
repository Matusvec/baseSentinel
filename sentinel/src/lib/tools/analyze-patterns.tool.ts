import type { ToolDefinition } from './types';
import { analyzePatterns } from '@/lib/featherless';

export const analyzePatternsTool: ToolDefinition = {
  name: 'analyze_patterns',
  description: 'Run deep behavioral pattern analysis using Featherless AI (Llama 3.1 70B). Identifies trends, anomalies, and provides situation assessment. Use for complex reasoning about what is happening over time.',
  parameters: [
    { name: 'trigger', type: 'string', description: 'What triggered this analysis', required: false, default: 'manual_analysis' },
  ],
  category: 'analysis',
  async execute(params, context) {
    const result = await analyzePatterns(
      context.perception ?? {},
      (params.trigger as string) || 'manual_analysis'
    );
    if (!result) return { success: false, error: 'Featherless analysis returned no result' };
    return { success: true, data: result };
  },
};
