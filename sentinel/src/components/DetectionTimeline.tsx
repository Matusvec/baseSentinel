'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

type Severity = 'info' | 'warning' | 'alert';

interface TimelineEvent {
  _id: string;
  timestamp: string;
  type: string;
  event_type?: string; // legacy field fallback
  severity: Severity;
  description: string;
}

interface HistoryResponse {
  events: TimelineEvent[];
}

const SEVERITY_DOT: Record<Severity, string> = {
  info: 'bg-green-500',
  warning: 'bg-yellow-400',
  alert: 'bg-red-500',
};

const SEVERITY_BADGE: Record<Severity, string> = {
  info: 'bg-green-500/10 text-green-400 border-green-500/20',
  warning: 'bg-yellow-400/10 text-yellow-300 border-yellow-400/20',
  alert: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const TYPE_LABEL: Record<string, string> = {
  perimeter_breach: 'BREACH',
  person_detected: 'PERSON',
  person_close: 'CLOSE',
  crowd_detected: 'CROWD',
  ir_triggered: 'IR TRIP',
  agent_decision: 'AGENT',
  anomaly: 'ANOMALY',
  user_query: 'QUERY',
  system: 'SYSTEM',
};

/**
 * Formats an ISO timestamp as HH:MM:SS in local time.
 */
function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '--:--:--';
  }
}

/**
 * Infers severity from event type if not explicitly set.
 */
function coerceSeverity(event: Partial<TimelineEvent>): Severity {
  if (event.severity && ['info', 'warning', 'alert'].includes(event.severity)) {
    return event.severity as Severity;
  }
  const type = event.type ?? event.event_type ?? '';
  if (type.includes('breach') || type.includes('alert') || type.includes('close')) return 'alert';
  if (type.includes('crowd') || type.includes('person')) return 'warning';
  return 'info';
}

/**
 * DetectionTimeline polls /api/sentinel/history every 5 seconds and displays
 * a scrolling feed of security events with severity indicators, timestamps,
 * and event type badges. Auto-scrolls to the newest entry.
 */
export default function DetectionTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/sentinel/history?type=events&timerange=30m&limit=20');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: HistoryResponse = await res.json();

      const normalized: TimelineEvent[] = (data.events ?? []).map((e) => ({
        ...e,
        type: e.type ?? e.event_type ?? 'system',
        severity: coerceSeverity(e),
      }));

      setEvents(normalized);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (events.length > prevCountRef.current) {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }
    prevCountRef.current = events.length;
  }, [events]);

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <h2 className="text-zinc-300 font-mono text-xs font-bold tracking-widest uppercase">
            Event Timeline
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-600 font-mono text-[10px]">LAST 30M</span>
          {!isLoading && (
            <span className="text-zinc-500 font-mono text-[10px] tabular-nums">
              {events.length} events
            </span>
          )}
        </div>
      </div>

      {/* Severity legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-zinc-800/50 shrink-0">
        {(['info', 'warning', 'alert'] as Severity[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${SEVERITY_DOT[s]}`} />
            <span className="text-zinc-600 font-mono text-[10px] uppercase">{s}</span>
          </div>
        ))}
      </div>

      {/* Scrollable event list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto min-h-0 max-h-80 scroll-smooth"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#3f3f46 transparent' }}
      >
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <div className="flex items-center gap-2 text-zinc-600">
              <div className="w-3 h-3 border border-zinc-600 border-t-green-500 rounded-full animate-spin" />
              <span className="font-mono text-xs">Connecting...</span>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex items-center gap-2 px-4 py-4 text-red-400">
            <span className="font-mono text-xs">ERR: {error}</span>
          </div>
        )}

        {!isLoading && !error && events.length === 0 && (
          <div className="flex items-center justify-center py-10">
            <span className="text-zinc-600 font-mono text-xs tracking-widest">NO EVENTS</span>
          </div>
        )}

        {events.map((event, idx) => {
          const sev = event.severity;
          const eventType = event.type ?? event.event_type ?? 'system';
          const typeLabel = TYPE_LABEL[eventType] ?? eventType.toUpperCase().slice(0, 8);
          const isNewest = idx === events.length - 1;

          return (
            <div
              key={event._id ?? `${event.timestamp}-${idx}`}
              className={`
                flex items-start gap-3 px-4 py-2.5 border-b border-zinc-800/40
                transition-colors
                ${isNewest ? 'bg-zinc-800/30' : 'hover:bg-zinc-800/20'}
              `}
            >
              {/* Severity dot */}
              <div className="mt-1 shrink-0">
                <div
                  className={`w-2 h-2 rounded-full ${SEVERITY_DOT[sev]} ${
                    sev === 'alert' ? 'shadow-[0_0_4px_rgba(239,68,68,0.8)]' : ''
                  }`}
                />
              </div>

              {/* Timestamp */}
              <span className="text-zinc-500 font-mono text-xs tabular-nums shrink-0 mt-0.5 w-16">
                {formatTime(event.timestamp)}
              </span>

              {/* Type badge */}
              <span
                className={`
                  shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold
                  border ${SEVERITY_BADGE[sev]}
                `}
              >
                {typeLabel}
              </span>

              {/* Description */}
              <span className="text-zinc-300 font-mono text-xs leading-relaxed min-w-0 break-words">
                {event.description}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
