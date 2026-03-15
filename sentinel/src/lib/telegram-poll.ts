/**
 * SENTINEL Telegram Poll — Inbound message routing with mission confirmation.
 *
 * Called from the perception route's 2Hz heartbeat. Internally throttled to
 * poll Telegram every 3 seconds. When a message arrives, it's routed to the
 * chat logic or handled as a mission confirmation reply.
 */

import { checkForMessages } from '@/lib/telegram-listener';
import { sendText } from '@/lib/telegram';
import { createMission, getMission } from '@/lib/mission-engine';
import { getMode, setMode } from '@/lib/mode';
import { getUniqueCount, getVisibleCount } from '@/lib/person-tracker';
import { latestPerception } from '@/app/api/sentinel/perception/route';
import { getDb } from '@/lib/mongodb';

// ── Pending mission confirmation state ───────────────────────

interface PendingMission {
  instruction: string;
  preview: string;
  createdAt: number;
}

let pendingMission: PendingMission | null = null;

export function setPendingMission(instruction: string, preview: string): void {
  pendingMission = { instruction, preview, createdAt: Date.now() };
}

export function getPendingMission(): PendingMission | null {
  return pendingMission;
}

export function clearPendingMission(): void {
  pendingMission = null;
}

// ── Throttle state ───────────────────────────────────────────

let lastPollTime = 0;
const POLL_INTERVAL_MS = 3000;

// ── Confirmation detection ───────────────────────────────────

const CONFIRM_PATTERNS = /^(yes|yeah|yep|go|do it|ok|okay|sure|sounds good|confirm|start|y)$/i;
const REJECT_PATTERNS = /^(no|nah|nope|cancel|nevermind|stop|n)$/i;

// ── Public API ───────────────────────────────────────────────

/**
 * Poll Telegram for new messages and route them.
 * Throttled internally — safe to call at 2Hz from the perception loop.
 */
export async function pollAndRoute(): Promise<void> {
  const now = Date.now();
  if (now - lastPollTime < POLL_INTERVAL_MS) return;
  lastPollTime = now;

  // Expire stale pending missions (>2 minutes old)
  if (pendingMission && now - pendingMission.createdAt > 120_000) {
    pendingMission = null;
  }

  const msg = await checkForMessages();
  if (!msg) return;

  const text = msg.text.trim();
  console.log(`[telegram-poll] Message from ${msg.from}: "${text}"`);

  // ── Handle mission confirmation replies ──
  if (pendingMission) {
    if (CONFIRM_PATTERNS.test(text)) {
      try {
        const mission = await createMission(pendingMission.instruction);
        setMode('monitor');
        await sendText(`🎯 Mission "${mission.missionName}" is now active.\n\nI'm watching. I'll alert you when I detect something relevant.`);
      } catch (err) {
        console.error('[telegram-poll] Mission creation failed:', err);
        await sendText('Sorry, I had trouble setting up that mission. Try rephrasing it.');
      }
      pendingMission = null;
      return;
    }

    if (REJECT_PATTERNS.test(text)) {
      pendingMission = null;
      await sendText('Okay, mission cancelled. Just tell me what you need.');
      return;
    }

    // Not a clear yes/no — treat as a new message (clear pending)
    pendingMission = null;
  }

  // ── Handle status/update shortcuts ──
  const lowerText = text.toLowerCase();
  if (lowerText === '/status' || lowerText === '/update') {
    await handleStatusRequest();
    return;
  }

  if (lowerText === '/photo') {
    await sendText('📷 Photo capture coming soon. For now, check the dashboard for the live feed.');
    return;
  }

  // ── Route to chat logic ──
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/sentinel/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, source: 'telegram' }),
      signal: AbortSignal.timeout(15000),
    });

    const data = await res.json();

    // If the chat route created a mission immediately (shouldn't happen for telegram
    // source after our chat route modification), nothing more to do — chat route
    // already handles telegram echo
    if (data.pendingConfirmation) {
      // Chat route generated a confirmation — it's handled there
      return;
    }
  } catch (err) {
    console.error('[telegram-poll] Chat routing failed:', err);
    await sendText('Sorry, I had trouble processing that. Try again in a moment.');
  }
}

// ── Helpers ──────────────────────────────────────────────────

async function handleStatusRequest(): Promise<void> {
  const mode = getMode();
  const visible = getVisibleCount();
  const unique = getUniqueCount();

  // Get recognized names from current perception
  const localCv = latestPerception?.local_cv as Record<string, unknown> | undefined;
  const persons = (localCv?.persons as Array<Record<string, unknown>>) ?? [];
  const named = persons.filter(p => p.name).map(p => p.name as string);
  const unknownCount = persons.filter(p => !p.name).length;

  let peopleStr = `Currently visible: ${visible} people`;
  if (named.length > 0) {
    peopleStr += `\nIdentified: ${named.join(', ')}`;
  }
  if (unknownCount > 0) {
    peopleStr += `\nUnidentified: ${unknownCount}`;
  }

  let missionStr = 'No active mission.';
  try {
    const mission = await getMission();
    if (mission) {
      missionStr = `Active mission: "${mission.missionName}"`;
    }
  } catch { /* ignore */ }

  let recentEvents = '';
  try {
    const db = await getDb();
    const events = await db.collection('events')
      .find({ timestamp: { $gte: new Date(Date.now() - 15 * 60 * 1000) } })
      .sort({ timestamp: -1 })
      .limit(3)
      .toArray();
    if (events.length > 0) {
      recentEvents = `\n\nRecent events:\n${events.map(e => `• ${e.event_type}: ${e.description}`).join('\n')}`;
    }
  } catch { /* ignore */ }

  await sendText(
    `📊 <b>SENTINEL Status</b>\n\n` +
    `Mode: ${mode.toUpperCase()}\n` +
    `${peopleStr}\n` +
    `Unique people seen: ${unique}\n` +
    `${missionStr}${recentEvents}`
  );
}
