/**
 * SENTINEL Telegram Listener — Inbound message polling.
 *
 * Uses Telegram's getUpdates long-polling to check for new messages
 * directed at the bot. Maintains an offset so each message is only
 * returned once across polling cycles.
 */

const TELEGRAM_API = 'https://api.telegram.org';

/** Offset for getUpdates — tracks last processed update. */
let updateOffset = 0;

export interface TelegramMessage {
  text: string;
  from: string;
  timestamp: number;
}

/**
 * Poll Telegram for new messages since the last check.
 *
 * Returns the most recent unprocessed message, or null if none.
 * Uses a short timeout (2s) to avoid blocking the caller.
 */
export async function checkForMessages(): Promise<TelegramMessage | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return null;

  try {
    const res = await fetch(
      `${TELEGRAM_API}/bot${token}/getUpdates?offset=${updateOffset}&timeout=0&allowed_updates=["message"]`,
      { signal: AbortSignal.timeout(5000) }
    );

    const data = await res.json();
    if (!data.ok || !data.result?.length) return null;

    // Process only messages from our configured chat
    const messages = data.result.filter(
      (update: Record<string, unknown>) => {
        const msg = update.message as Record<string, unknown> | undefined;
        const chat = msg?.chat as Record<string, unknown> | undefined;
        return chat?.id?.toString() === chatId && msg?.text;
      }
    );

    if (messages.length === 0) {
      // Still advance offset to skip non-matching updates
      const lastId = data.result[data.result.length - 1].update_id as number;
      updateOffset = lastId + 1;
      return null;
    }

    // Take the most recent matching message
    const latest = messages[messages.length - 1];
    const msg = latest.message as Record<string, unknown>;
    const from = msg.from as Record<string, unknown> | undefined;

    // Advance offset past all processed updates
    updateOffset = (latest.update_id as number) + 1;

    return {
      text: msg.text as string,
      from: (from?.first_name as string) || (from?.username as string) || 'Unknown',
      timestamp: (msg.date as number) * 1000,
    };
  } catch (err) {
    console.error('[telegram-listener] Poll error:', err);
    return null;
  }
}
