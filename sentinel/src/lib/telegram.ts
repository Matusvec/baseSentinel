/**
 * SENTINEL Telegram Bot — Outbound messaging.
 *
 * Sends text messages, photos, and formatted alerts to a Telegram chat
 * via the Bot API. Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID
 * environment variables.
 */

const TELEGRAM_API = 'https://api.telegram.org';

/** Returns the bot token or throws if missing. */
function getToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN not set');
  return token;
}

/** Returns the target chat ID or throws if missing. */
function getChatId(): string {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) throw new Error('TELEGRAM_CHAT_ID not set');
  return chatId;
}

/**
 * Send a plain text message to the configured Telegram chat.
 */
export async function sendText(text: string): Promise<boolean> {
  try {
    const token = getToken();
    const chatId = getChatId();

    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error('[telegram] sendText failed:', data.description);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[telegram] sendText error:', err);
    return false;
  }
}

/**
 * Send a photo (from base64 JPEG) with an optional caption.
 *
 * Telegram's sendPhoto requires multipart/form-data, so we convert
 * the base64 string into a Blob and upload it as a file attachment.
 */
export async function sendPhoto(
  base64: string,
  caption?: string
): Promise<boolean> {
  try {
    const token = getToken();
    const chatId = getChatId();

    const imageBuffer = Buffer.from(base64, 'base64');
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });

    const form = new FormData();
    form.append('chat_id', chatId);
    form.append('photo', blob, 'sentinel_frame.jpg');
    if (caption) {
      form.append('caption', caption);
      form.append('parse_mode', 'HTML');
    }

    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendPhoto`, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(15000),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error('[telegram] sendPhoto failed:', data.description);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[telegram] sendPhoto error:', err);
    return false;
  }
}

/**
 * Send a formatted SENTINEL alert to Telegram.
 *
 * If a base64 image is provided, sends it as a captioned photo.
 * Otherwise sends a text message with alert emoji formatting.
 */
export async function sendAlert(
  text: string,
  base64?: string
): Promise<boolean> {
  const formatted = `🚨 <b>SENTINEL ALERT</b>\n\n${text}`;

  if (base64) {
    return sendPhoto(base64, formatted);
  }
  return sendText(formatted);
}
