'use client';

import { useEffect, useRef, useState } from 'react';

interface Stats {
  total_detections: number;
  avg_people_per_frame: number;
  peak_people: number;
  total_alerts: number;
}

interface StatCardProps {
  label: string;
  value: string | number;
  danger?: boolean;
  unit?: string;
}

/** Single stat card with animated number transition. */
function StatCard({ label, value, danger = false, unit }: StatCardProps) {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current === value) return;
    prevRef.current = value;

    // Numeric count-up animation
    const numValue = typeof value === 'number' ? value : parseFloat(String(value));
    const numPrev = typeof displayed === 'number' ? displayed : parseFloat(String(displayed));

    if (isNaN(numValue) || isNaN(numPrev)) {
      setDisplayed(value);
      return;
    }

    const steps = 20;
    const diff = numValue - numPrev;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const interim = numPrev + (diff * step) / steps;
      // Preserve decimal places from original value format
      const isDecimal = String(value).includes('.');
      setDisplayed(isDecimal ? parseFloat(interim.toFixed(1)) : Math.round(interim));
      if (step >= steps) {
        setDisplayed(value);
        clearInterval(timer);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={`
        flex flex-col items-center justify-center gap-1 rounded-lg border p-4
        bg-zinc-900 transition-all duration-300
        ${danger && Number(value) > 0
          ? 'border-red-700 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
          : 'border-zinc-700'}
      `}
    >
      <span
        className={`
          text-4xl font-bold font-mono tabular-nums transition-all duration-150
          ${danger && Number(value) > 0 ? 'text-red-400' : 'text-green-400'}
        `}
      >
        {displayed}
        {unit && <span className="text-xl font-normal text-zinc-500 ml-1">{unit}</span>}
      </span>
      <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase text-center">
        {label}
      </span>
    </div>
  );
}

/**
 * Polls the SENTINEL history API every 10 seconds and renders a 2x2 stat grid.
 * Displays total detections, average people per frame, peak people, and total alerts.
 */
export default function StatsPanel() {
  const [stats, setStats] = useState<Stats>({
    total_detections: 0,
    avg_people_per_frame: 0,
    peak_people: 0,
    total_alerts: 0,
  });
  const [lastUpdated, setLastUpdated] = useState<string>('—');
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/sentinel/history?timerange=60m&limit=1');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const s = data?.stats ?? data?.[0]?.stats;
      if (s) {
        setStats({
          total_detections: s.total_detections ?? 0,
          avg_people_per_frame: parseFloat((s.avg_people ?? s.avg_people_per_frame ?? 0).toFixed(1)),
          peak_people: s.max_people ?? s.peak_people ?? 0,
          total_alerts: s.alerts ?? s.total_alerts ?? 0,
        });
        setLastUpdated(new Date().toLocaleTimeString('en-US', { hour12: false }));
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fetch failed');
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase">
          Threat Statistics
        </h2>
        <span className="text-xs font-mono text-zinc-600">
          {error ? (
            <span className="text-red-500">{error}</span>
          ) : (
            <>Updated {lastUpdated}</>
          )}
        </span>
      </div>

      {/* 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Detections" value={stats.total_detections} />
        <StatCard
          label="Avg People / Frame"
          value={stats.avg_people_per_frame}
        />
        <StatCard label="Peak People" value={stats.peak_people} />
        <StatCard label="Total Alerts" value={stats.total_alerts} danger />
      </div>
    </div>
  );
}
