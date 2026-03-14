'use client';

import { useEffect, useState } from 'react';

export type AlertLevel = 'normal' | 'elevated' | 'alert';

interface AlertBarProps {
  alertLevel: AlertLevel;
}

const LEVEL_CONFIG: Record<
  AlertLevel,
  { label: string; bg: string; text: string; pulse: boolean }
> = {
  normal: {
    label: 'ALL CLEAR',
    bg: 'bg-green-900/80 border-green-500',
    text: 'text-green-400',
    pulse: false,
  },
  elevated: {
    label: 'ELEVATED — Person Detected',
    bg: 'bg-yellow-900/80 border-yellow-500',
    text: 'text-yellow-300',
    pulse: false,
  },
  alert: {
    label: 'ALERT — Perimeter Breach',
    bg: 'bg-red-900/80 border-red-500',
    text: 'text-red-400',
    pulse: true,
  },
};

/**
 * Full-width status bar showing the current SENTINEL alert level.
 * Flashes on alert level to draw immediate attention.
 */
export default function AlertBar({ alertLevel }: AlertBarProps) {
  const config = LEVEL_CONFIG[alertLevel];
  const [visible, setVisible] = useState(true);

  // Pulse effect: toggle visibility every 600ms when alertLevel is 'alert'
  useEffect(() => {
    if (!config.pulse) {
      setVisible(true);
      return;
    }
    const interval = setInterval(() => {
      setVisible((v) => !v);
    }, 600);
    return () => clearInterval(interval);
  }, [alertLevel, config.pulse]);

  const levelDot: Record<AlertLevel, string> = {
    normal: 'bg-green-400',
    elevated: 'bg-yellow-300',
    alert: 'bg-red-400',
  };

  return (
    <div
      className={`
        w-full border-b px-6 py-2 flex items-center justify-center gap-3
        transition-all duration-300 font-mono
        ${config.bg}
        ${config.pulse && !visible ? 'opacity-40' : 'opacity-100'}
      `}
    >
      {/* Status dot */}
      <span
        className={`
          inline-block h-2.5 w-2.5 rounded-full flex-shrink-0
          ${levelDot[alertLevel]}
          ${alertLevel === 'alert' ? 'animate-ping' : ''}
        `}
      />
      {/* Label */}
      <span className={`text-sm font-bold tracking-widest uppercase ${config.text}`}>
        SENTINEL //&nbsp;{config.label}
      </span>
      {/* Timestamp */}
      <span className="ml-auto text-xs text-zinc-500 tracking-widest hidden sm:block">
        {new Date().toLocaleTimeString('en-US', { hour12: false })}
      </span>
    </div>
  );
}
