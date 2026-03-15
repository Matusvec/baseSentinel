'use client';

import { useState, useEffect } from 'react';

export type SentinelMode = 'chat' | 'monitor' | 'scan';

interface ModeControlProps {
  currentMode: SentinelMode;
  onModeChange: (mode: SentinelMode) => void;
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2a10 10 0 0 1 0 20" />
      <path d="M12 6a6 6 0 0 1 0 12" />
      <line x1="12" y1="12" x2="22" y2="12" />
    </svg>
  );
}

interface TaskInfo {
  id: number;
  description: string;
  status: string;
  count: number;
}

interface ModeButtonConfig {
  mode: SentinelMode;
  label: string;
  description: string;
  icon: React.ReactNode;
  activeClasses: string;
  hoverClasses: string;
}

const MODES: ModeButtonConfig[] = [
  {
    mode: 'chat',
    label: 'CHAT',
    description: 'Ask questions',
    icon: <ChatIcon />,
    activeClasses: 'border-blue-500 text-blue-400 bg-blue-900/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
    hoverClasses: 'hover:border-blue-700 hover:text-blue-500',
  },
  {
    mode: 'monitor',
    label: 'MONITOR',
    description: 'Run tasks',
    icon: <MonitorIcon />,
    activeClasses: 'border-yellow-500 text-yellow-400 bg-yellow-900/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]',
    hoverClasses: 'hover:border-yellow-700 hover:text-yellow-500',
  },
  {
    mode: 'scan',
    label: 'SCAN',
    description: 'Full auto',
    icon: <ScanIcon />,
    activeClasses: 'border-green-500 text-green-400 bg-green-900/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]',
    hoverClasses: 'hover:border-green-700 hover:text-green-500',
  },
];

/**
 * ModeControl — Chat / Monitor / Scan mode toggle for the SENTINEL dashboard.
 * Polls /api/sentinel/mode every 3 s and reflects server-side mode changes (e.g. task auto-promotes to monitor).
 */
export default function ModeControl({ currentMode, onModeChange }: ModeControlProps) {
  const [loading, setLoading] = useState<SentinelMode | null>(null);
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Poll mode/tasks to catch server-side changes (e.g. chat route auto-promoting to monitor)
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch('/api/sentinel/mode');
        const data = await res.json();
        if (data.mode && data.mode !== currentMode) {
          onModeChange(data.mode);
        }
        if (data.tasks) setTasks(data.tasks);
      } catch { /* ignore polling errors */ }
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [currentMode, onModeChange]);

  const handleModeClick = async (cfg: ModeButtonConfig) => {
    if (cfg.mode === currentMode) return;

    setLoading(cfg.mode);
    setError(null);
    try {
      const res = await fetch('/api/sentinel/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: cfg.mode }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      onModeChange(cfg.mode);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed';
      setError(msg);
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveTask = async (taskId: number) => {
    try {
      await fetch('/api/sentinel/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove_task', taskId }),
      });
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch { /* ignore */ }
  };

  const activeTasks = tasks.filter(t => t.status === 'active');

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase shrink-0">
          Mode
        </span>

        <div className="flex gap-2 flex-1">
          {MODES.map((cfg) => {
            const isActive = currentMode === cfg.mode;
            const isLoading = loading === cfg.mode;

            return (
              <button
                key={cfg.mode}
                onClick={() => handleModeClick(cfg)}
                disabled={isLoading}
                title={cfg.description}
                className={[
                  'flex flex-1 items-center justify-center gap-1.5 rounded border px-3 py-2',
                  'text-xs font-bold tracking-widest uppercase transition-all duration-150',
                  isActive
                    ? cfg.activeClasses
                    : `border-zinc-700 text-zinc-600 bg-zinc-800/50 ${cfg.hoverClasses}`,
                  isLoading ? 'opacity-60 cursor-wait' : '',
                ].join(' ')}
              >
                <span className={`transition-colors ${isActive ? '' : 'opacity-70'}`}>
                  {cfg.icon}
                </span>
                <span>{isLoading ? '...' : cfg.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active tasks badge */}
        {activeTasks.length > 0 && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-mono text-yellow-400">
              {activeTasks.length} task{activeTasks.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {error && (
          <span className="text-[10px] font-mono text-red-400 shrink-0 max-w-[120px] truncate">
            {error}
          </span>
        )}

        <div className="flex items-center gap-1 shrink-0">
          <span
            className={[
              'h-2 w-2 rounded-full',
              currentMode === 'scan'
                ? 'bg-green-500 animate-pulse'
                : currentMode === 'monitor'
                ? 'bg-yellow-500 animate-pulse'
                : 'bg-blue-500',
            ].join(' ')}
          />
          <span className="text-[10px] font-mono text-zinc-500 uppercase">{currentMode}</span>
        </div>
      </div>

      {/* Task list — visible in monitor mode */}
      {currentMode === 'monitor' && activeTasks.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {activeTasks.map(task => (
            <div
              key={task.id}
              className="flex items-center gap-2 rounded bg-zinc-800 border border-zinc-700 px-2 py-1"
            >
              <span className="text-[10px] font-mono text-yellow-300">{task.description}</span>
              <span className="text-[10px] font-mono text-zinc-500">x{task.count}</span>
              <button
                onClick={() => handleRemoveTask(task.id)}
                className="text-zinc-600 hover:text-red-400 text-[10px] transition-colors"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
