import type { ToolDefinition } from './types';
import { sendText, sendAlert, sendPhoto } from '@/lib/telegram';

export const sendTelegramTool: ToolDefinition = {
  name: 'send_telegram',
  description: 'Send a message to the connected Telegram chat. Can optionally attach the current camera frame as a photo. Use for remote alerts, status updates, or when the user asks you to send them a photo.',
  parameters: [
    { name: 'text', type: 'string', description: 'Message text to send', required: true },
    { name: 'is_alert', type: 'boolean', description: 'Format as an alert (bold, emoji)', required: false, default: false },
    { name: 'attach_photo', type: 'boolean', description: 'Attach the current camera frame', required: false, default: false },
  ],
  category: 'communication',
  async execute(params, context) {
    const text = params.text as string;
    try {
      if (params.attach_photo && context.frameB64) {
        await sendPhoto(context.frameB64, text);
      } else if (params.is_alert) {
        await sendAlert(text);
      } else {
        await sendText(text);
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Telegram send failed' };
    }
  },
};
