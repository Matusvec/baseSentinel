'use client';

import { useState, useEffect, useCallback } from 'react';

/** Trigger event types with associated badge styles. */
type TriggerEvent = 'perimeter_breach' | 'person_close' | 'crowd_detected' | string;

interface DecisionEntry {
  id: string;
  timestamp: string;
  trigger: TriggerEvent;
  reasoning: string;
  toolChain: string[];
}

interface HistoryApiResponse {
  decisions: DecisionEntry[];
}

const TRIGGER_STYLES: Record<string, { label: string; classes: string }> = {
  perimeter_breach: {
    label: 'PERIMETER BREACH',
    classes: 'bg-red-900/60 text-red-300 border border-red-700/60',
  },
  person_close: {
    label: 'PERSON CLOSE',
    classes: 'bg-yellow-900/60 text-yellow-300 border border-yellow-700/60',
  },
  crowd_detected: {
    label: 'CROWD DETECTED',
    classes: 'bg-blue-900/60 text-blue-300 border border-blue-700/60',
  },
};

function getTriggerStyle(trigger: string) {
  return (
    TRIGGER_STYLES[trigger] ?? {
      label: trigger.replace(/_/g, ' ').toUpperCase(),
      classes: 'bg-zinc-800 text-zinc-400 border border-zinc-600',
    }
  );
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return iso;
  }
}

interface DecisionCardProps {
  entry: DecisionEntry;
}

/** Single collapsible decision entry. */
function DecisionCard({ entry }: DecisionCardProps) {
  const [expanded, setExpanded] = useState(true);
  const style = getTriggerStyle(entry.trigger);

  return (
    <div className="rounded border border-zinc-700/60 bg-zinc-800/40 overflow-hidden">
      {/* Header row — always visible */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-700/30 transition-colors"
      >
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${style.classes}`}
        >
          {style.label}
        </span>
        <span className="ml-auto font-mono text-[10px] text-zinc-500 shrink-0">
          {formatTimestamp(entry.timestamp)}
        </span>
        <span className="text-zinc-600 text-xs ml-1">{expanded ? '▾' : '▸'}</span>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 space-y-2.5 border-t border-zinc-700/40">
          {/* Reasoning text */}
          <p className="text-xs text-zinc-300 leading-relaxed">{entry.reasoning}</p>

          {/* Tool chain */}
          {entry.toolChain.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 mr-1">
                Tools:
              </span>
              {entry.toolChain.map((tool, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  <span className="rounded bg-zinc-900 border border-zinc-700 px-2 py-0.5 font-mono text-[10px] text-green-400">
                    {tool}
                  </span>
                  {idx < entry.toolChain.length - 1 && (
                    <span className="text-zinc-600 text-xs">→</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * AgentReasoningLog — polls /api/sentinel/history for agent decisions every 5s.
 * Displays trigger badges, reasoning text, and tool chain visualization.
 */
export default function AgentReasoningLog() {
  const [decisions, setDecisions] = useState<DecisionEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDecisions = useCallback(async () => {
    try {
      const res = await fetch(
        '/api/sentinel/history?type=decisions&timerange=30m&limit=10',
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: HistoryApiResponse = await res.json();
      setDecisions(data.decisions ?? []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[AgentReasoningLog] Fetch failed:', msg);
      setError(msg);
    }
  }, []);

  useEffect(() => {
    fetchDecisions();
    const interval = setInterval(fetchDecisions, 5000);
    return () => clearInterval(interval);
  }, [fetchDecisions]);

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
          Agent Reasoning Log
        </h2>
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-[10px] text-red-400 font-mono">ERR: {error}</span>
          )}
          {lastUpdated && !error && (
            <span className="text-[10px] font-mono text-zinc-600">
              {formatTimestamp(lastUpdated.toISOString())}
            </span>
          )}
          {/* Live pulse indicator */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
        </div>
      </div>

      {/* Decision list */}
      <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
        {decisions.length === 0 && !error && (
          <p className="text-xs text-zinc-600 text-center py-6 font-mono">
            — awaiting decisions —
          </p>
        )}
        {decisions.map((entry) => (
          <DecisionCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
