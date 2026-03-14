'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Person {
  id: number;
  bbox: [number, number, number, number]; // [x, y, w, h] normalized 0-1
  distance: number;
  confidence: number;
}

interface DetectedObject {
  label: string;
  bbox: [number, number, number, number]; // [x, y, w, h] normalized 0-1
  confidence: number;
}

interface VisionData {
  people: Person[];
  objects?: DetectedObject[];
  frame_full?: string; // base64 JPEG
  frame_w?: number;
  frame_h?: number;
}

interface PerceptionResponse {
  perception: {
    vision?: VisionData;
    timestamp?: string;
  } | null;
}

/**
 * LiveFeed displays the SENTINEL camera stream with AI detection overlays.
 * Polls /api/sentinel/perception every second and renders bounding boxes
 * for people and objects on a canvas overlay.
 */
export default function LiveFeed() {
  const [visionData, setVisionData] = useState<VisionData | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const fetchPerception = useCallback(async () => {
    try {
      const res = await fetch('/api/sentinel/perception');
      if (!res.ok) throw new Error('fetch failed');
      const data: PerceptionResponse = await res.json();

      if (data.perception?.vision) {
        setVisionData(data.perception.vision);
        setIsOnline(true);
        setLastUpdate(Date.now());
      } else {
        // No vision data — mark offline if stale
        if (Date.now() - lastUpdate > 5000) setIsOnline(false);
      }
    } catch {
      if (Date.now() - lastUpdate > 5000) setIsOnline(false);
    }
  }, [lastUpdate]);

  // Poll every second
  useEffect(() => {
    fetchPerception();
    const interval = setInterval(fetchPerception, 1000);
    return () => clearInterval(interval);
  }, [fetchPerception]);

  // Draw overlays whenever visionData changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = container.clientWidth;
    const H = container.clientHeight;
    canvas.width = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    if (!visionData) return;

    const people = visionData.people ?? [];
    const objects = visionData.objects ?? [];

    // Find closest person (tracking target)
    const closestPerson = people.length > 0
      ? people.reduce((min, p) => p.distance < min.distance ? p : min, people[0])
      : null;

    // Draw object bounding boxes — blue dashed
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.font = '11px monospace';
    ctx.fillStyle = '#3b82f6';

    for (const obj of objects) {
      const [nx, ny, nw, nh] = obj.bbox;
      const x = nx * W;
      const y = ny * H;
      const w = nw * W;
      const h = nh * H;
      ctx.strokeRect(x, y, w, h);
      ctx.fillText(obj.label, x + 4, y - 4 < 0 ? y + 14 : y - 4);
    }

    // Draw person bounding boxes — green solid
    ctx.setLineDash([]);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.font = '12px monospace';

    for (let i = 0; i < people.length; i++) {
      const person = people[i];
      const [nx, ny, nw, nh] = person.bbox;
      const x = nx * W;
      const y = ny * H;
      const w = nw * W;
      const h = nh * H;

      ctx.strokeStyle = '#22c55e';
      ctx.strokeRect(x, y, w, h);

      // Label background
      const label = `Person ${i + 1} · ${person.distance}cm`;
      const textW = ctx.measureText(label).width + 8;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(x, y - 20, textW, 18);
      ctx.fillStyle = '#22c55e';
      ctx.fillText(label, x + 4, y - 6);
    }

    // Draw red crosshair on closest person
    if (closestPerson) {
      const [nx, ny, nw, nh] = closestPerson.bbox;
      const cx = (nx + nw / 2) * W;
      const cy = (ny + nh / 2) * H;
      const size = 20;

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);

      // Crosshair lines
      ctx.beginPath();
      ctx.moveTo(cx - size, cy);
      ctx.lineTo(cx - 6, cy);
      ctx.moveTo(cx + 6, cy);
      ctx.lineTo(cx + size, cy);
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx, cy - 6);
      ctx.moveTo(cx, cy + 6);
      ctx.lineTo(cx, cy + size);
      ctx.stroke();

      // Circle
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(239,68,68,0.6)';
      ctx.stroke();
    }
  }, [visionData]);

  const peopleCount = visionData?.people?.length ?? 0;
  const frameData = visionData?.frame_full;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800"
    >
      {/* Camera frame background */}
      {frameData ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={`data:image/jpeg;base64,${frameData}`}
          alt="Camera feed"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-zinc-600 text-sm font-mono tracking-widest uppercase">
            No Signal
          </div>
        </div>
      )}

      {/* Canvas overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Top-left: LIVE/OFFLINE indicator */}
      <div className="absolute top-3 left-3 flex items-center gap-2 rounded-md bg-black/60 px-2.5 py-1 backdrop-blur-sm">
        {isOnline ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-green-400 text-xs font-mono font-bold tracking-widest">LIVE</span>
          </>
        ) : (
          <>
            <span className="inline-flex rounded-full h-2 w-2 bg-zinc-600" />
            <span className="text-zinc-500 text-xs font-mono font-bold tracking-widest">OFFLINE</span>
          </>
        )}
      </div>

      {/* Top-right: people count badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1 backdrop-blur-sm">
        <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
        </svg>
        <span className="text-green-400 text-xs font-mono font-bold">{peopleCount}</span>
      </div>

      {/* Scan line effect overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        }}
      />
    </div>
  );
}
