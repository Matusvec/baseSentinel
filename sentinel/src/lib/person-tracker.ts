/**
 * SENTINEL Person Tracker — Cross-frame identity persistence.
 *
 * Assigns stable IDs to detected persons using centroid proximity matching.
 * Called every perception cycle (2Hz) with the local_cv.persons array.
 * Prevents over-counting: a person standing still is always the same ID.
 *
 * Matching strategy: if an incoming person's bbox center is within
 * MATCH_THRESHOLD (15% of normalized frame) of an existing tracked person,
 * they're the same person. Otherwise a new ID is created.
 */

// ── Types ────────────────────────────────────────────────────

interface Point {
  x: number;
  y: number;
}

interface IncomingPerson {
  id: number;
  bbox: { x: number; y: number; width: number; height: number };
  center?: Point;
  speed?: number;
  activity?: string;
}

export interface TrackedIdentity {
  id: string;
  centroid: Point;
  bbox: { x: number; y: number; width: number; height: number };
  firstSeen: number;
  lastSeen: number;
  framesSeen: number;
  /** Running average velocity for direction tracking. */
  velocity: Point;
  lastActivity: string;
}

// ── Constants ────────────────────────────────────────────────

/** Max normalized distance (0-1) for centroid matching. Squared for fast comparison. */
const MATCH_THRESHOLD_SQ = 0.15 * 0.15;

/** Prune tracked persons not seen for this many ms. */
const PRUNE_TIMEOUT_MS = 3000;

/** Velocity smoothing factor (EMA alpha). */
const VELOCITY_ALPHA = 0.3;

// ── Module-level state ───────────────────────────────────────

let tracked = new Map<string, TrackedIdentity>();
let nextId = 1;
let totalUnique = 0;
let enteringCount = 0;
let exitingCount = 0;
let lastMovementAt = Date.now();

// ── Public API ───────────────────────────────────────────────

/**
 * Update tracking with the latest detected persons from local_cv.
 * Call this every perception cycle (0.5s).
 * Returns the array of currently tracked persons with stable IDs.
 */
export function updateTracking(persons: IncomingPerson[]): TrackedIdentity[] {
  const now = Date.now();
  const matched = new Set<string>();

  for (const person of persons) {
    const centroid = person.center ?? {
      x: person.bbox.x + person.bbox.width / 2,
      y: person.bbox.y + person.bbox.height / 2,
    };

    // Find closest existing tracked person
    let bestId: string | null = null;
    let bestDist = Infinity;

    for (const [id, tp] of tracked) {
      if (matched.has(id)) continue;
      const dist = distSq(centroid, tp.centroid);
      if (dist < bestDist) {
        bestDist = dist;
        bestId = id;
      }
    }

    if (bestId && bestDist < MATCH_THRESHOLD_SQ) {
      // Same person — update
      const existing = tracked.get(bestId)!;
      const dx = centroid.x - existing.centroid.x;
      const dy = centroid.y - existing.centroid.y;

      existing.velocity = {
        x: VELOCITY_ALPHA * dx + (1 - VELOCITY_ALPHA) * existing.velocity.x,
        y: VELOCITY_ALPHA * dy + (1 - VELOCITY_ALPHA) * existing.velocity.y,
      };
      existing.centroid = centroid;
      existing.bbox = person.bbox;
      existing.lastSeen = now;
      existing.framesSeen++;
      existing.lastActivity = person.activity ?? 'unknown';

      // Track movement
      if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
        lastMovementAt = now;
      }

      matched.add(bestId);
    } else {
      // New person — don't reset lastMovementAt here, only real movement
      // of existing persons should update it (prevents new arrivals from
      // suppressing lingering_detected for stationary persons)
      const id = `p-${nextId++}`;
      totalUnique++;
      tracked.set(id, {
        id,
        centroid,
        bbox: person.bbox,
        firstSeen: now,
        lastSeen: now,
        framesSeen: 1,
        velocity: { x: 0, y: 0 },
        lastActivity: person.activity ?? 'unknown',
      });
      matched.add(id);
    }
  }

  // Prune stale entries and track exits
  for (const [id, tp] of tracked) {
    if (now - tp.lastSeen > PRUNE_TIMEOUT_MS) {
      // Determine exit direction from velocity
      if (tp.velocity.x > 0.005) exitingCount++;
      else if (tp.velocity.x < -0.005) enteringCount++;
      tracked.delete(id);
    }
  }

  return Array.from(tracked.values());
}

/** Total unique persons seen since last reset. */
export function getUniqueCount(): number {
  return totalUnique;
}

/** Currently visible (tracked) person count. */
export function getVisibleCount(): number {
  return tracked.size;
}

/** Net flow: entering - exiting (positive = more entering). */
export function getNetFlow(): number {
  return enteringCount - exitingCount;
}

/** Entering count since last reset. */
export function getEnteringCount(): number {
  return enteringCount;
}

/** Exiting count since last reset. */
export function getExitingCount(): number {
  return exitingCount;
}

/** Seconds a specific tracked person has been in zone. */
export function getTimeInZone(personId: string): number {
  const tp = tracked.get(personId);
  if (!tp) return 0;
  return (Date.now() - tp.firstSeen) / 1000;
}

/** Minutes since any tracked person last moved significantly. */
export function getMinutesSinceLastMovement(): number {
  return (Date.now() - lastMovementAt) / 60_000;
}

/** Returns all currently tracked persons. */
export function getTrackedPersons(): TrackedIdentity[] {
  return Array.from(tracked.values());
}

/** Reset all tracking state. Call on mission change. */
export function resetTracking(): void {
  tracked = new Map();
  nextId = 1;
  totalUnique = 0;
  enteringCount = 0;
  exitingCount = 0;
  lastMovementAt = Date.now();
}

// ── Helpers ──────────────────────────────────────────────────

/** Squared Euclidean distance — avoids sqrt for hot-path comparison. */
function distSq(a: Point, b: Point): number {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}
