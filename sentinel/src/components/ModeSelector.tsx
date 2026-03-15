'use client';

import { useState } from 'react';

type SentinelMode = 'chat' | 'monitor' | 'scan';

interface ModeSelectorProps {
  currentMode: SentinelMode;
  onModeChange: (mode: SentinelMode) => void;
}

interface ModeConfig {
  mode: SentinelMode;
  label: string;
  subtitle: string;
  color: string;
  activeClasses: string;
  icon: React.ReactNode;
}

const MODES: ModeConfig[] = [
  {
    mode: 'chat',
    label: 'CHAT',
    subtitle: 'Conversational',
    color: 'blue',
    activeClasses: 'border-blue-500 text-blue-400 bg-blue-500/10 shadow-[0_0_12px_rgba(59,130,246,0.15)]',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    mode: 'monitor',
    label: 'MISSION',
    subtitle: 'Task-focused',
    color: 'amber',
    activeClasses: 'border-amber-500 text-amber-400 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    mode: 'scan',
    label: 'SCAN',
    subtitle: 'Full auto',
    color: 'green',
    activeClasses: 'border-green-500 text-green-400 bg-green-500/10 shadow-[0_0_12px_rgba(34,197,94,0.15)]',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 0 1 0 20" />
        <path d="M12 6a6 6 0 0 1 0 12" />
        <line x1="12" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
];

/**
 * ModeSelector — Three-mode toggle (Chat / Mission / Scan) for the SENTINEL dashboard.
 * Calls POST /api/sentinel/mode on switch. Designed to sit prominently in the header.
 */
export default function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  const [loading, setLoading] = useState<SentinelMode | null>(null);

  const handleSwitch = async (cfg: ModeConfig) => {
    if (cfg.mode === currentMode || loading) return;

    setLoading(cfg.mode);
    try {
      const res = await fetch('/api/sentinel/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: cfg.mode }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      onModeChange(cfg.mode);
    } catch (err) {
      console.error('Mode switch failed:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/80 p-1">
      {MODES.map((cfg) => {
        const isActive = currentMode === cfg.mode;
        const isLoading = loading === cfg.mode;

        return (
          <button
            key={cfg.mode}
            onClick={() => handleSwitch(cfg)}
            disabled={isLoading}
            className={[
              'flex items-center gap-1.5 rounded-md border px-3 py-1.5',
              'text-[11px] font-bold tracking-wider uppercase transition-all duration-200',
              isActive
                ? cfg.activeClasses
                : 'border-transparent text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/50',
              isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer',
            ].join(' ')}
            title={cfg.subtitle}
          >
            <span className={isActive ? '' : 'opacity-60'}>{cfg.icon}</span>
            <span>{isLoading ? '...' : cfg.label}</span>
          </button>
        );
      })}
    </div>
  );
}
