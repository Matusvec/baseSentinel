'use client';

interface DistanceReadings {
  f: number; // front cm
  l: number; // left cm
  r: number; // right cm
}

interface SensorData {
  d: DistanceReadings;
  ir: [number, number]; // 0=intact, 1=broken
  s: number;            // sound level 0-100
  p: number;            // pan angle degrees
  t: number;            // tilt angle degrees
}

interface SensorPanelProps {
  sensors: SensorData;
}

const MAX_DISTANCE_CM = 400;

/**
 * Clamps a value to [0, max] and returns percentage for bar width.
 */
function toBarPct(value: number, max: number): number {
  return Math.min(100, Math.max(0, (value / max) * 100));
}

/**
 * Returns a Tailwind color class based on distance proximity.
 * Close = red, medium = yellow, far = green.
 */
function distanceColor(cm: number): string {
  if (cm < 80) return 'bg-red-500';
  if (cm < 200) return 'bg-yellow-400';
  return 'bg-green-500';
}

interface DistanceGaugeProps {
  label: string;
  value: number;
  maxCm?: number;
}

function DistanceGauge({ label, value, maxCm = MAX_DISTANCE_CM }: DistanceGaugeProps) {
  const pct = toBarPct(value, maxCm);
  const color = distanceColor(value);
  const displayVal = value >= maxCm ? `>${maxCm}` : value.toFixed(0);

  return (
    <div className="flex items-center gap-3">
      <span className="text-zinc-500 font-mono text-xs w-5 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-zinc-300 font-mono text-xs w-14 text-right shrink-0">
        {displayVal} cm
      </span>
    </div>
  );
}

interface IrIndicatorProps {
  index: number;
  broken: boolean;
}

function IrIndicator({ index, broken }: IrIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-3 h-3 rounded-full ${broken ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]' : 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]'}`}
      />
      <span className="font-mono text-xs text-zinc-400">
        BEAM {index + 1}
      </span>
      <span className={`font-mono text-xs font-bold ${broken ? 'text-red-400' : 'text-green-400'}`}>
        {broken ? 'BROKEN' : 'INTACT'}
      </span>
    </div>
  );
}

/**
 * SensorPanel renders real-time hardware sensor readings for the SENTINEL station.
 * Displays ultrasonic distance gauges, IR beam status, sound level, and gimbal angles.
 */
export default function SensorPanel({ sensors }: SensorPanelProps) {
  const d = sensors?.d ?? { f: 0, l: 0, r: 0 };
  const ir = sensors?.ir ?? [0, 0] as [number, number];
  const s = sensors?.s ?? 0;
  const p = sensors?.p ?? 90;
  const t = sensors?.t ?? 90;
  const soundPct = toBarPct(s, 100);

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 flex flex-col gap-5">

      {/* Distance gauges */}
      <section>
        <h3 className="text-zinc-500 font-mono text-[10px] tracking-widest uppercase mb-3">
          Ultrasonic Distance
        </h3>
        <div className="flex flex-col gap-2.5">
          <DistanceGauge label="F" value={d.f} />
          <DistanceGauge label="L" value={d.l} />
          <DistanceGauge label="R" value={d.r} />
        </div>
      </section>

      <div className="h-px bg-zinc-800" />

      {/* IR beam status */}
      <section>
        <h3 className="text-zinc-500 font-mono text-[10px] tracking-widest uppercase mb-3">
          IR Perimeter Beams
        </h3>
        <div className="flex flex-col gap-2">
          <IrIndicator index={0} broken={ir[0] === 1} />
          <IrIndicator index={1} broken={ir[1] === 1} />
        </div>
      </section>

      <div className="h-px bg-zinc-800" />

      {/* Sound level */}
      <section>
        <h3 className="text-zinc-500 font-mono text-[10px] tracking-widest uppercase mb-3">
          Sound Level
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-150 ${s > 75 ? 'bg-red-500' : s > 40 ? 'bg-yellow-400' : 'bg-green-500'}`}
              style={{ width: `${soundPct}%` }}
            />
          </div>
          <span className="text-zinc-300 font-mono text-xs w-8 text-right shrink-0">
            {s.toFixed(0)}
          </span>
        </div>
      </section>

      <div className="h-px bg-zinc-800" />

      {/* Gimbal position */}
      <section>
        <h3 className="text-zinc-500 font-mono text-[10px] tracking-widest uppercase mb-3">
          Gimbal Position
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-zinc-800 p-3 flex flex-col items-center gap-1">
            <span className="text-zinc-500 font-mono text-[10px] tracking-widest uppercase">Pan</span>
            <span className="text-green-400 font-mono text-xl font-bold tabular-nums">
              {p >= 0 ? '+' : ''}{p.toFixed(1)}°
            </span>
          </div>
          <div className="rounded-lg bg-zinc-800 p-3 flex flex-col items-center gap-1">
            <span className="text-zinc-500 font-mono text-[10px] tracking-widest uppercase">Tilt</span>
            <span className="text-green-400 font-mono text-xl font-bold tabular-nums">
              {t >= 0 ? '+' : ''}{t.toFixed(1)}°
            </span>
          </div>
        </div>

        {/* Visual crosshair compass for gimbal */}
        <div className="relative mt-3 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border border-zinc-700 flex items-center justify-center relative">
            {/* Pan indicator line */}
            <div
              className="absolute w-px h-8 bg-green-500 origin-bottom"
              style={{
                bottom: '50%',
                left: '50%',
                transform: `translateX(-50%) rotate(${p}deg)`,
              }}
            />
            {/* Center dot */}
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 z-10" />
            {/* Cardinal marks */}
            <span className="absolute top-1 text-zinc-600 font-mono text-[8px]">N</span>
            <span className="absolute bottom-1 text-zinc-600 font-mono text-[8px]">S</span>
            <span className="absolute right-1 text-zinc-600 font-mono text-[8px]">E</span>
            <span className="absolute left-1 text-zinc-600 font-mono text-[8px]">W</span>
          </div>
        </div>
      </section>
    </div>
  );
}
