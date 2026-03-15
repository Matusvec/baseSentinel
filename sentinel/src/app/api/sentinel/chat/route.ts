import { NextResponse } from 'next/server';
import { getMode } from '@/lib/mode';
import { getDb } from '@/lib/mongodb';
import { reason } from '@/lib/reasoning-engine';
import { sendText } from '@/lib/telegram';
import { generateSpeech } from '@/lib/elevenlabs';

/**
 * POST /api/sentinel/chat — Unified conversational interface for SENTINEL.
 * GET  /api/sentinel/chat — Load chat history for UI.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, source = 'dashboard' } = body;

    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    const db = await getDb();

    // Store user message
    await db.collection('chat_messages').insertOne({
      role: 'user',
      text: message,
      source,
      timestamp: new Date(),
    });

    // Run unified reasoning — AI decides intent + tool calls
    const result = await reason({
      type: 'user_message',
      message,
      source,
    });

    // Store assistant response
    await db.collection('chat_messages').insertOne({
      role: 'assistant',
      text: result.responseText,
      tools_used: result.toolCalls.map(tc => tc.tool),
      timestamp: new Date(),
    });

    // Check if a mission was created
    let missionData = null;
    const missionResult = result.toolResults.find(r => r.tool === 'create_mission');
    if (missionResult?.result.success) {
      missionData = missionResult.result.data;
    }

    // Generate speech for dashboard (if no speak tool was already called)
    let audioBase64 = result.audioBase64 ?? null;
    if (source === 'dashboard' && !audioBase64 && result.responseText) {
      try {
        const speech = await generateSpeech(result.responseText, 'summary');
        audioBase64 = speech?.audio_base64 || null;
      } catch { /* speech is optional */ }
    }

    // Echo to Telegram if message came from there
    const alreadySentTelegram = result.toolCalls.some(tc => tc.tool === 'send_telegram');
    if (source === 'telegram' && result.responseText && !alreadySentTelegram) {
      try {
        await sendText(result.responseText);
      } catch (err) {
        console.error('[chat] Telegram echo failed:', err);
      }
    }

    return NextResponse.json({
      text: result.responseText,
      type: missionData ? 'new_mission' : 'question',
      mission: missionData,
      mode: getMode(),
      audio_base64: audioBase64,
      tools_used: result.toolCalls.map(tc => tc.tool),
      reasoning: result.reasoning,
    });
  } catch (error) {
    console.error('[chat] Error:', error);
    return NextResponse.json({ error: 'Chat processing failed' }, { status: 500 });
  }
}

/** GET /api/sentinel/chat — Returns recent chat history for the UI. */
export async function GET() {
  try {
    const db = await getDb();
    const messages = await db.collection('chat_messages')
      .find({})
      .sort({ timestamp: -1 })
      .limit(30)
      .toArray();

    return NextResponse.json({
      messages: messages.reverse().map(m => ({
        role: m.role,
        text: m.text,
        source: m.source,
        tools_used: m.tools_used,
        timestamp: m.timestamp,
      })),
    });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}
