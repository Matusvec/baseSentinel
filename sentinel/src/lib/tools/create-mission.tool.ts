import type { ToolDefinition } from './types';
import { createMission } from '@/lib/mission-engine';
import { setMode } from '@/lib/mode';

export const createMissionTool: ToolDefinition = {
  name: 'create_mission',
  description: 'Create a new monitoring mission that reconfigures the entire perception pipeline. Use when the user wants to fundamentally change what SENTINEL watches for (e.g., "watch for shoplifters", "count foot traffic", "monitor for safety violations").',
  parameters: [
    { name: 'instruction', type: 'string', description: 'Plain English description of what to monitor', required: true },
  ],
  category: 'system',
  async execute(params) {
    try {
      const mission = await createMission(params.instruction as string);
      setMode('monitor');
      return {
        success: true,
        data: {
          id: mission.id,
          name: mission.missionName,
          triggers: mission.triggers.length,
          fields: mission.extractionFields,
        },
      };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Mission creation failed' };
    }
  },
};
