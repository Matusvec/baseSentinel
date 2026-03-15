import { NextResponse } from 'next/server';
import { sendText, sendPhoto, sendAlert } from '@/lib/telegram';

/**
 * POST /api/sentinel/telegram — Send a message or photo to Telegram.
 *
 * Body:
 *   { type: 'text', text: string }
 *   { type: 'photo', base64: string, caption?: string }
 *   { type: 'alert', text: string, base64?: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;

    let success = false;

    switch (type) {
      case 'text':
        if (!body.text) {
          return NextResponse.json({ error: 'text is required' }, { status: 400 });
        }
        success = await sendText(body.text);
        break;

      case 'photo':
        if (!body.base64) {
          return NextResponse.json({ error: 'base64 is required' }, { status: 400 });
        }
        success = await sendPhoto(body.base64, body.caption);
        break;

      case 'alert':
        if (!body.text) {
          return NextResponse.json({ error: 'text is required' }, { status: 400 });
        }
        success = await sendAlert(body.text, body.base64);
        break;

      default:
        return NextResponse.json(
          { error: 'type must be text, photo, or alert' },
          { status: 400 }
        );
    }

    return NextResponse.json({ ok: success });
  } catch (error) {
    console.error('[telegram route] Error:', error);
    return NextResponse.json({ error: 'Telegram send failed' }, { status: 500 });
  }
}

/**
 * GET /api/sentinel/telegram — Check Telegram bot connection status.
 */
export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json({
      connected: false,
      reason: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID',
    });
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();

    if (!data.ok) {
      return NextResponse.json({
        connected: false,
        reason: data.description || 'Bot token invalid',
      });
    }

    return NextResponse.json({
      connected: true,
      bot: {
        username: data.result.username,
        name: data.result.first_name,
      },
      chatId,
    });
  } catch (err) {
    console.error('[telegram route] Status check failed:', err);
    return NextResponse.json({
      connected: false,
      reason: 'Could not reach Telegram API',
    });
  }
}
