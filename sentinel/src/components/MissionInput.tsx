'use client';

import { useState, useEffect, useRef } from 'react';

interface MissionInputProps {
  onMissionSet: (mission: { text: string; task: Record<string, unknown> | null }) => void;
}

const QUICK_CHIPS = [
  { label: 'Count foot traffic', instruction: 'Count how many people enter and exit this area every 5 minutes' },
  { label: 'Monitor elderly person', instruction: 'Watch this person — if they fall or do not move for 10 minutes, alert me with a picture' },
  { label: 'Track objects', instruction: 'Count and track all backpacks passing through this area' },
  { label: 'Security watch', instruction: 'Alert me if anyone enters this area or crosses the perimeter' },
  { label: 'Just chat with me', instruction: 'Sit on my desk and just chat with me about whatever I am working on' },
];

/**
 * MissionInput — Natural language instruction box for giving SENTINEL a mission.
 * Includes quick-start chips and a loading/confirmation flow.
 */
export default function MissionInput({ onMissionSet }: MissionInputProps) {
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up confirmation timer on unmount
  useEffect(() => {
    return () => {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    };
  }, []);

  const submitInstruction = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setConfirmation(null);

    try {
      const res = await fetch('/api/sentinel/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      // Play audio response if available
      if (data.audio_base64) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audio_base64}`);
        audio.play().catch(() => {});
      }

      setConfirmation(data.text);
      setInstruction('');
      onMissionSet({ text: data.text, task: data.task || null });

      // Clear confirmation after 8 seconds (cleaned up on unmount)
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = setTimeout(() => setConfirmation(null), 8000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to set mission';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitInstruction(instruction);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      {/* Confirmation banner */}
      {confirmation && (
        <div className="mb-3 rounded-lg border border-green-800/60 bg-green-950/40 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-green-400 uppercase">Mission Active</span>
          </div>
          <p className="text-xs font-mono text-green-300 leading-relaxed">{confirmation}</p>
        </div>
      )}

      {/* Input area */}
      <div className="relative">
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tell SENTINEL what to do... (e.g., 'count people entering this room' or 'alert me if someone falls')"
          disabled={loading}
          rows={2}
          className="
            w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 pr-12
            text-sm font-mono text-zinc-200 placeholder-zinc-600
            focus:border-cyan-700 focus:outline-none focus:ring-1 focus:ring-cyan-900
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-none transition-colors duration-150
          "
        />
        <button
          onClick={() => submitInstruction(instruction)}
          disabled={loading || !instruction.trim()}
          className="
            absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center
            rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400
            hover:border-cyan-600 hover:text-cyan-400
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-all duration-150
          "
          title="Deploy mission"
        >
          {loading ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="mt-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono text-cyan-400">SENTINEL is configuring...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-2 rounded border border-red-800 bg-red-950/50 px-3 py-1.5 text-xs font-mono text-red-400">
          {error}
        </div>
      )}

      {/* Quick-start chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip.label}
            onClick={() => {
              setInstruction(chip.instruction);
              submitInstruction(chip.instruction);
            }}
            disabled={loading}
            className="
              rounded-full border border-zinc-700 bg-zinc-800/60 px-3 py-1
              text-[11px] font-mono text-zinc-400
              hover:border-cyan-700 hover:text-cyan-300 hover:bg-cyan-950/30
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-150
            "
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
