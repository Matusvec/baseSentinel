import type { ToolDefinition } from './types';

export const captureSnapshotTool: ToolDefinition = {
  name: 'capture_snapshot',
  description: 'Save the current camera frame to the database with an optional annotation. Use for "take a photo" or documenting an event.',
  parameters: [
    { name: 'annotation', type: 'string', description: 'Note to attach to the snapshot', required: false },
  ],
  category: 'data',
  async execute(params, context) {
    if (!context.frameB64) {
      return { success: false, error: 'No camera frame available' };
    }
    await context.db.collection('snapshots').insertOne({
      timestamp: new Date(),
      frame: context.frameB64,
      annotation: (params.annotation as string) || null,
      mission_id: context.mission?.id || null,
      mode: context.mode,
    });
    return { success: true, data: { message: 'Snapshot saved' } };
  },
};
