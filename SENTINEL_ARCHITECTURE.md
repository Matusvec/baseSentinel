# SENTINEL — Agentic AI Architecture

## How SENTINEL Thinks — The Full Pipeline

### The Big Picture

SENTINEL has **three AI brains** working in parallel at different speeds:

| Brain | Model | Speed | Purpose |
|-------|-------|-------|---------|
| **Gemini Vision** | `gemini-2.5-flash-lite` | Every ~3s | Frame-level analysis — "what's happening right now?" |
| **Featherless/Llama 3.1 70B** | Llama 3.1 70B | Every ~15s | Temporal pattern analysis — "what's been happening over time?" |
| **Gemini Chat** | `gemini-2.5-flash-lite` | On demand | Intent classification — "what does the user want?" |

---

## Stage 1: Sensor Input (Python → Next.js)

Every **500ms**, the Python process POSTs to `/api/sentinel/perception` with:
- `local_cv` — real-time OpenCV person/face detection (runs on-device)
- `sensors` — ultrasonic distances, IR beams, sound level, gimbal angles
- `frame_b64` — raw JPEG for Gemini to analyze

The Python process is intentionally "dumb" — it only does fast CV (MediaPipe pose + Haar face detection) and hardware I/O. ALL reasoning happens server-side in Next.js, which makes the system work even without the physical hardware.

## Stage 2: The Perception Route — Central Orchestrator

**`perception/route.ts`** is the heart of the system. Every 500ms it:

1. **Caches** the latest perception for dashboard polling
2. **Reads mode** (`chat` | `monitor` | `scan`) and **active mission**
3. **Updates person tracker** — cross-frame identity matching via centroid proximity
4. **Calls Gemini Vision** (throttled) if a mission is active
5. **Builds an AdaptiveDocument** — extracts only mission-relevant fields
6. **Deduplicates storage** — skips MongoDB writes when nothing changed
7. **Evaluates triggers** against mission conditions
8. **Branches by mode** for action handling
9. **Fires background tasks** — Telegram polling, temporal analysis

## Stage 3: The Three Modes

### Chat Mode
- Triggers are evaluated but only fire voice alerts if `speakBehavior.silent` is false
- User interaction is primary — conversational Q&A via the ChatInterface

### Monitor Mode
- Checks **simple threshold tasks** (legacy system: "tell me when someone gets within 100cm")
- Fires **mission triggers** with voice + Telegram alerts
- Shows StatsPanel + SensorPanel alongside a compact chat

### Scan Mode (Full Autonomous)
- Runs **hardcoded heuristics** to trigger the full agent:
  - IR beam broken → `perimeter_breach` (always triggers)
  - Person + distance < 200cm → `person_close`
  - Fast movement + distance < 300cm → `fast_movement`
  - 3+ people → `crowd_detected`
- The agent plans and executes a **tool chain** autonomously

## Stage 4: The Agent (Scan Mode Only)

When triggered, the agent route does:

1. **Gemini plans a tool chain** — given the trigger + sensor snapshot, it returns a list of tools to call
2. **All tools execute in parallel** via `Promise.all`
3. **Decision + event logged** to MongoDB

Available tools:

| Tool | Action |
|------|--------|
| `move_gimbal` | Pan/tilt servo to track a target |
| `set_alert` | LED color + buzzer on Arduino |
| `analyze_patterns` | Featherless deep reasoning |
| `speak` | ElevenLabs TTS voice output |
| `query_memory` | MongoDB lookup for context |
| `start_tracking` | Convert person bbox → servo angles, follow target |

The agent's tool-chain execution is **parallel, not sequential**. Gemini returns all tools at once, and they all fire simultaneously. This means the system can speak, move the gimbal, and flash LEDs at the same time — but tools can't depend on each other's results within a single plan.

## Stage 5: Mission Engine — Rewiring the Entire Pipeline

When a user says something like "watch for shoplifters" or "count foot traffic", the **entire perception pipeline reconfigures itself**.

Gemini receives the instruction + a massive meta-prompt with 4 few-shot examples and returns a complete `MissionConfig`:

```
visionPrompt        → custom Gemini prompt for every frame
extractionFields    → which data fields to persist
triggers            → conditions that fire alerts (8 types)
featherlessPrompt   → custom Llama system prompt
speakBehavior       → when/how to speak
analysisInterval    → how often temporal analysis runs
```

The 8 trigger types:
- `people_count_exceeds`
- `person_entered`
- `lingering_detected`
- `object_detected`
- `distance_below`
- `perimeter_breach`
- `activity_level`
- `custom_condition`

This is a **meta-AI pattern** — Gemini doesn't just answer questions, it *generates the configuration for other AI systems*. The mission prompt rewires what Gemini Vision looks for, what Featherless reasons about, what gets stored, and what triggers alerts. One natural language sentence cascades into 6+ configuration changes.

## Stage 6: Trigger Evaluator

Runs every perception cycle when a mission is active. Key design:
- **30s cooldown per trigger** prevents the same alert from spamming
- **Severity determines routing**: `critical`/`warning` → Telegram + voice; `info` → voice only
- **`custom_condition`** uses keyword matching ("floor"/"fall" → check `on_floor` field, "no movement" → check `minutesSinceMovement`), with a fallback to Gemini's `interesting_people_count > 0`

## Stage 7: Temporal Analysis (The "Slow Brain")

Featherless/Llama 3.1 70B runs every ~15s. It receives:
- Current perception snapshot
- **Last 10 detections** (5 min window)
- **Hourly stats** — 5-minute bucket aggregation
- **Recent events**
- **Previous analysis** (for continuity)
- **Person tracker stats** — visible count, unique count, net flow, minutes since last movement

Returns: `situation_assessment`, `patterns_detected`, `recommendations`, `spoken_summary`

## Stage 8: Output Channels

| Channel | Tech | When |
|---------|------|------|
| **Voice** | ElevenLabs `eleven_turbo_v2` | Trigger fires, pattern detected, user query |
| **Telegram** | Bot API (outbound + inbound polling) | Critical/warning triggers, photo requests |
| **Dashboard** | Polling (1-2s) | Always — LiveFeed, stats, reasoning log |
| **Hardware** | HTTP → Python → Arduino serial | Gimbal movement, LED, buzzer |

Voice has 4 profiles with different stability settings:
- `detection` (stability 0.8, calm)
- `alert` (stability 0.55, expressive)
- `summary` (stability 0.75, neutral)
- `tracking` (stability 0.85, flat)

## Stage 9: Chat Intent Classification

When a user talks to SENTINEL (dashboard or Telegram), Gemini classifies the message as:
- **`question`** → answer from MongoDB context + current perception
- **`command`** → create a threshold task, switch to monitor mode
- **`new_mission`** → call `createMission()` to rewire the pipeline

Telegram missions require a **confirmation step** before activating. Dashboard missions activate immediately.

---

## Architectural Diagram

```
Browser Camera (30fps)
    │
    ├──→ LiveFeed (canvas overlay)
    │
    └──→ /analyze (500ms) ──→ Python VisionEngine
                                    │
Python Perception Loop ◄────────────┘
    │
    └──→ POST /perception (500ms)
              │
              ├──→ Person Tracker (cross-frame ID)
              ├──→ Gemini Vision (3s, mission-specific)
              ├──→ Adaptive Storage (dedup → MongoDB)
              ├──→ Trigger Evaluator → Speak / Telegram
              ├──→ Temporal Analysis (15s, Featherless)
              └──→ Agent (scan mode) → Tool Chain
                    ├── move_gimbal
                    ├── set_alert
                    ├── analyze_patterns
                    ├── speak
                    ├── query_memory
                    └── start_tracking
```

---

## MongoDB Collections

| Collection | Purpose |
|---|---|
| `detections` | Every perception cycle's output (lean with adaptive storage) |
| `events` | Trigger fires, temporal analysis results, agent decisions |
| `agent_decisions` | Full agent plans with tool chains and reasoning |
| `analysis_results` | Featherless temporal pattern analysis outputs |
| `missions` | Persisted mission configs (survive server restarts) |

---

## Known Issues

1. **No cooldown on scan-mode agent triggers** — `shouldTriggerAgent()` can fire every 500ms, spawning concurrent Gemini plan calls for the same event
2. **`custom_condition` is brittle** — falls back to `interesting_people_count > 0` for any condition it can't keyword-match
3. **Dual in-memory mission state** — both `mission-engine.ts` and `mission.ts` hold `activeMission`; if `mission.ts` is cleared directly, the two diverge
4. **No speak rate limiting** — concurrent ElevenLabs calls can happen from both agent tools and trigger handlers for the same event
5. **Temporal aggregation field mismatch** — hourly stats query uses `context.people_count` which only exists in mission-mode documents

---

## Key Files

| File | Role |
|------|------|
| `sentinel.py` | Python hardware controller — camera, Arduino, local CV |
| `src/app/api/sentinel/perception/route.ts` | Central orchestrator — every 500ms |
| `src/app/api/sentinel/agent/route.ts` | Autonomous agent — scan mode tool chains |
| `src/app/api/sentinel/chat/route.ts` | Chat intent classification + response |
| `src/lib/mission-engine.ts` | Mission creation + pipeline reconfiguration |
| `src/lib/mission-prompts.ts` | Meta-prompt for mission generation |
| `src/lib/trigger-evaluator.ts` | Condition evaluation + cooldown |
| `src/lib/temporal-analysis.ts` | Featherless slow-brain reasoning |
| `src/lib/adaptive-storage.ts` | Smart dedup + field extraction |
| `src/lib/person-tracker.ts` | Cross-frame identity matching |
| `src/lib/gemini.ts` | Gemini Vision + agent planning |
| `src/lib/featherless.ts` | Llama 3.1 70B pattern analysis |
| `src/lib/telegram.ts` | Telegram bot outbound messaging |
| `src/lib/telegram-poll.ts` | Telegram inbound polling + routing |
