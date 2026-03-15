import type { ToolDefinition } from './types';
import { setMode } from '@/lib/mode';

export const setModeTool: ToolDefinition = {
  name: 'set_mode',
  description: 'Change SENTINEL operating mode. "chat" = conversational, "monitor" = active task/mission monitoring, "scan" = full autonomous surveillance.',
  parameters: [
    { name: 'mode', type: 'string', description: 'Target mode', required: true, enum: ['chat', 'monitor', 'scan'] },
  ],
  category: 'system',
  async execute(params) {
    const mode = params.mode as 'chat' | 'monitor' | 'scan';
    setMode(mode);
    return { success: true, data: { mode } };
  },
};
