import type { ToolDefinition } from './types';

const PYTHON_URL = process.env.PYTHON_URL || 'http://localhost:5000';

export const setAlertTool: ToolDefinition = {
  name: 'set_alert',
  description: 'Set the physical alert status — controls the LED color and optional buzzer on the hardware.',
  parameters: [
    { name: 'color', type: 'string', description: 'LED color', required: true, enum: ['green', 'yellow', 'red'] },
    { name: 'buzzer', type: 'boolean', description: 'Enable buzzer alarm', required: false, default: false },
  ],
  category: 'hardware',
  async execute(params) {
    try {
      const res = await fetch(`${PYTHON_URL}/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(3000),
      });
      return { success: true, data: await res.json() };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Hardware unreachable' };
    }
  },
};
