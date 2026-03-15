import type { ToolDefinition } from './types';
import { clearMission } from '@/lib/mission-engine';
import { setMode } from '@/lib/mode';

export const clearMissionTool: ToolDefinition = {
  name: 'clear_mission',
  description: 'Stop the active mission and switch to chat mode. Use this when the user says "stop mission", "end mission", "cancel mission", or similar. This is the ONLY way to stop a mission — set_mode alone is NOT enough.',
  parameters: [],
  category: 'system',
  async execute() {
    await clearMission();
    setMode('chat');
    return { success: true, data: { message: 'Mission cleared, now in chat mode' } };
  },
};
