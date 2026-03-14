'use client';

import { useState, useEffect, useCallback } from 'react';
import LiveFeed from '@/components/LiveFeed';
import SensorPanel from '@/components/SensorPanel';
import DetectionTimeline from '@/components/DetectionTimeline';
import GimbalControl from '@/components/GimbalControl';
import AgentReasoningLog from '@/components/AgentReasoningLog';
import StatsPanel from '@/components/StatsPanel';
import VoiceInterface from '@/components/VoiceInterface';
import ModeControl from '@/components/ModeControl';
import AlertBar from '@/components/AlertBar';

type AlertLevel = 'normal' | 'elevated' | 'alert';

interface SensorData {
  d: { f: number; l: number; r: number };
  ir: [number, number];
  s: number;
  p: number;
  t: number;
}

export default function CommandCenter() {
  const [sensors, setSensors] = useState<SensorData | null>(null);
  const [alertLevel, setAlertLevel] = useState<AlertLevel>('normal');
  const [currentMode, setCurrentMode] = useState<'scan' | 'track' | 'idle'>('idle');
  const [systemOnline, setSystemOnline] = useState(false);

  // Poll perception data for sensor readings + alert state
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/sentinel/perception');
        const data = await res.json();
        if (data.perception) {
          setSystemOnline(true);
          const p = data.perception;
          if (p.sensors) {
            setSensors(p.sensors);
          }

          // Derive alert level from perception
          const ir = p.sensors?.ir;
          if (ir?.[0] === 1 || ir?.[1] === 1) {
            setAlertLevel('alert');
          } else if (p.vision?.people?.length > 0 && p.sensors?.d?.f < 200) {
            setAlertLevel('elevated');
          } else {
            setAlertLevel('normal');
          }
        }
      } catch {
        setSystemOnline(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleModeChange = useCallback(async (mode: 'scan' | 'track' | 'idle') => {
    setCurrentMode(mode);
    try {
      if (mode === 'scan') {
        await fetch('/api/sentinel/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'scan_start' }),
        });
      } else if (mode === 'idle') {
        await fetch('/api/sentinel/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'scan_stop' }),
        });
      }
    } catch (err) {
      console.error('Mode change failed:', err);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Alert Bar */}
      <AlertBar alertLevel={alertLevel} />

      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${systemOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <h1 className="text-lg font-bold tracking-wider text-white">
            SENTINEL
          </h1>
          <span className="text-xs text-zinc-500 font-mono">
            AUTONOMOUS PERCEPTION STATION
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ModeControl currentMode={currentMode} onModeChange={handleModeChange} />
          <span className="text-xs text-zinc-600 font-mono">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 p-4 grid grid-cols-12 gap-4 max-h-[calc(100vh-110px)] overflow-hidden">
        {/* Left Column — Live Feed + Gimbal */}
        <div className="col-span-8 flex flex-col gap-4">
          {/* Live Feed - takes most space */}
          <div className="flex-1 min-h-0">
            <LiveFeed />
          </div>

          {/* Bottom row under feed */}
          <div className="grid grid-cols-2 gap-4 h-64">
            <GimbalControl />
            <VoiceInterface />
          </div>
        </div>

        {/* Right Column — Panels */}
        <div className="col-span-4 flex flex-col gap-4 overflow-hidden">
          {/* Stats */}
          <StatsPanel />

          {/* Sensors */}
          {sensors && <SensorPanel sensors={sensors} />}

          {/* Detection Timeline */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <DetectionTimeline />
          </div>
        </div>
      </main>

      {/* Bottom Panel — Agent Reasoning (full width, critical for judges) */}
      <div className="border-t border-zinc-800 px-4 py-2 h-52">
        <AgentReasoningLog />
      </div>
    </div>
  );
}
