import type { ToolDefinition } from './types';

const PYTHON_URL = process.env.PYTHON_URL || 'http://localhost:5000';

export const scanRoomTool: ToolDefinition = {
  name: 'scan_room',
  description: 'Sweep the gimbal camera across the room to look around. Sends a scan command to the Arduino which will automatically sweep left-to-right. Use when user says "scan the room", "look around", "sweep", etc.',
  parameters: [
    { name: 'action', type: 'string', description: 'Start or stop scanning', required: false, enum: ['start', 'stop'], default: 'start' },
  ],
  category: 'hardware',
  async execute(params) {
    const action = (params.action as string) || 'start';
    try {
      const res = await fetch(`${PYTHON_URL}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
        signal: AbortSignal.timeout(3000),
      });
      const data = await res.json();
      return {
        success: true,
        data: {
          action,
          message: action === 'start' ? 'Scanning the room...' : 'Scan stopped.',
          ...data,
        },
      };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Hardware unreachable' };
    }
  },
};
