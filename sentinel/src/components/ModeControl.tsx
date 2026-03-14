'use client';

import { useState } from 'react';

/** Available operational modes for the SENTINEL station. */
export type SentinelMode = 'scan' | 'track' | 'idle';

interface ModeControlProps {
  /** Current active mode — controls which button is highlighted. */
  currentMode: SentinelMode;
  /** Called after a successful mode change API call. */
  onModeChange: (mode: SentinelMode) => void;
}

/**
 * Sends a sentinel command action to the API.
 */
async function sendCommand(action: string): Promise<void> {
  const res = await fetch('/api/sentinel/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

/** SVG icon for SCAN mode (sweeping arc). */
function ScanIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 0 1 0 20" />
      <path d="M12 6a6 6 0 0 1 0 12" />
      <line x1="12" y1="12" x2="22" y2="12" />
    </svg>
  );
}

/** SVG icon for TRACK mode (crosshair). */
function TrackIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="7" />
      <line x1="12" y1="1" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="1" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="23" y2="12" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

/** SVG icon for IDLE mode (pause). */
function IdleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none" />
      <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

interface ModeButtonConfig {
  mode: SentinelMode;
  label: string;
  action: string;
  icon: React.ReactNode;
  activeClasses: string;
  hoverClasses: string;
}

const MODES: ModeButtonConfig[] = [
  {
    mode: 'scan',
    label: 'SCAN',
    action: 'scan_start',
    icon: <ScanIcon />,
    activeClasses: 'border-green-500 text-green-400 bg-green-900/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]',
    hoverClasses: 'hover:border-green-700 hover:text-green-500',
  },
  {
    mode: 'track',
    label: 'TRACK',
    action: '',          // TRACK is agent-driven — button is visual-only
    icon: <TrackIcon />,
    activeClasses: 'border-yellow-500 text-yellow-400 bg-yellow-900/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]',
    hoverClasses: 'hover:border-yellow-700 hover:text-yellow-500',
  },
  {
    mode: 'idle',
    label: 'IDLE',
    action: 'scan_stop',
    icon: <IdleIcon />,
    activeClasses: 'border-zinc-500 text-zinc-300 bg-zinc-700/40',
    hoverClasses: 'hover:border-zinc-500 hover:text-zinc-300',
  },
];

/**
 * ModeControl — compact SCAN / TRACK / IDLE toggle for the SENTINEL dashboard.
 * SCAN and IDLE send commands to /api/sentinel/command.
 * TRACK is a visual-only state set externally by the agent.
 */
export default function ModeControl({ currentMode, onModeChange }: ModeControlProps) {
  const [loading, setLoading] = useState<SentinelMode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleModeClick = async (cfg: ModeButtonConfig) => {
    if (cfg.mode === currentMode) return;
    if (cfg.mode === 'track') return; // agent-only state, not user-triggered

    setLoading(cfg.mode);
    setError(null);
    try {
      await sendCommand(cfg.action);
      onModeChange(cfg.mode);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Command failed';
      console.error('[ModeControl] Command error:', msg);
      setError(msg);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3">
      <div className="flex items-center gap-3">
        {/* Label */}
        <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase shrink-0">
          Mode
        </span>

        {/* Mode buttons */}
        <div className="flex gap-2 flex-1">
          {MODES.map((cfg) => {
            const isActive = currentMode === cfg.mode;
            const isLoading = loading === cfg.mode;
            const isTrack = cfg.mode === 'track';

            return (
              <button
                key={cfg.mode}
                onClick={() => handleModeClick(cfg)}
                disabled={isLoading || isTrack && currentMode !== 'track'}
                title={isTrack ? 'Set automatically by agent' : undefined}
                className={[
                  'flex flex-1 items-center justify-center gap-1.5 rounded border px-3 py-2',
                  'text-xs font-bold tracking-widest uppercase transition-all duration-150',
                  isActive
                    ? cfg.activeClasses
                    : `border-zinc-700 text-zinc-600 bg-zinc-800/50 ${!isTrack ? cfg.hoverClasses : 'cursor-not-allowed opacity-50'}`,
                  isLoading ? 'opacity-60 cursor-wait' : '',
                ].join(' ')}
              >
                <span
                  className={[
                    'transition-colors',
                    isActive ? '' : 'opacity-70',
                  ].join(' ')}
                >
                  {cfg.icon}
                </span>
                <span>{isLoading ? '...' : cfg.label}</span>
              </button>
            );
          })}
        </div>

        {/* Error indicator */}
        {error && (
          <span className="text-[10px] font-mono text-red-400 shrink-0 max-w-[120px] truncate">
            {error}
          </span>
        )}

        {/* Active mode status dot */}
        <div className="flex items-center gap-1 shrink-0">
          <span
            className={[
              'h-2 w-2 rounded-full',
              currentMode === 'scan'
                ? 'bg-green-500 animate-pulse'
                : currentMode === 'track'
                ? 'bg-yellow-500 animate-pulse'
                : 'bg-zinc-600',
            ].join(' ')}
          />
          <span className="text-[10px] font-mono text-zinc-500 uppercase">{currentMode}</span>
        </div>
      </div>
    </div>
  );
}
