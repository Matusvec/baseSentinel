# SENTINEL — Implementation Guide
## Modes, Integrations, and Architecture Layering

---

## Core Concept: Three Modes

SENTINEL has three operating modes. The mode determines **when it speaks** and **what it does autonomously**. Everything else (storage, tracking, sensors) runs regardless of mode.

### Chat Mode (default)
- SENTINEL watches silently. It **never speaks unprompted**.
- You type or speak a question: "How many people have you seen?" — it answers from its memory (MongoDB) and current perception.
- You can give it a task: "Count people for the next 10 minutes" — it switches to Monitor mode automatically.
- The gimbal stays still unless you ask it to move.
- Think of this as having a quiet assistant in the room who only talks when spoken to.

### Monitor Mode
- You've given SENTINEL a custom job. It runs that job silently.
- It **only speaks when your condition is met**: "5 people now — that's above your threshold."
- It can move the gimbal to track things relevant to your task.
- You can stack multiple tasks: "Count foot traffic AND alert me if anyone lingers more than 30 seconds."
- Tasks are created from natural language — Gemini parses your instruction into a structured condition.

### Scan Mode (demo mode)
- Full autonomous narration. SENTINEL sweeps the room, announces detections, flags anomalies.
- This is what you show the judges. Maximum wow factor.
- Everything is loud and visible — voice announcements, LED changes, gimbal sweeping.

---

## How to Implement Modes on Your Existing Architecture

You already have the API routes, the dashboard, and the AI integrations. Modes layer on top without rewriting anything.

### Step 1: Add a mode state to your backend

Create a new file `lib/mode.ts` (or add to an existing state file):

```typescript
// Global mode state (lives in memory on the server)
let currentMode: 'chat' | 'monitor' | 'scan' = 'chat';
let activeTasks: Task[] = [];

interface Task {
  id: number;
  description: string;
  condition: any;        // Structured condition object
  speakOnTrigger: boolean;
  speakTemplate: string;  // "I've counted {count} people so far"
  continuous: boolean;    // Keep running or one-shot
  status: 'active' | 'paused' | 'completed';
  count: number;          // Running tally
  createdAt: Date;
}

export function getMode() { return currentMode; }
export function setMode(mode) { currentMode = mode; }
export function getTasks() { return activeTasks; }
export function addTask(task) { activeTasks.push(task); }
```

### Step 2: Modify your /perception route to respect modes

In your existing `/api/sentinel/perception/route.js`, add a mode check before triggering voice or agent actions:

```
BEFORE storing/processing:
  1. Store event in MongoDB (ALWAYS — all modes)
  2. Check mode:
     - chat: Do NOT trigger voice. Do NOT trigger agent narration.
       Just store silently.
     - monitor: Check active tasks against this perception data.
       If any task condition is met → trigger voice for THAT task only.
       Do NOT announce raw detections.
     - scan: Full behavior. Trigger agent, voice, everything.
```

The key change is wrapping your existing `shouldTriggerAgent()` and voice calls inside an `if (mode === 'scan')` check, and adding a `checkTasks(perception)` call for monitor mode.

### Step 3: Add a /chat route for conversational queries

Create `/api/sentinel/chat/route.js`:

```
POST body: { message: "How many people have walked by?" }

This route:
  1. Gets current perception (latest frame + sensors)
  2. Queries MongoDB for recent events (last 15-20)
  3. Sends everything to Gemini with the user's question
  4. Gemini answers as SENTINEL based on what it sees and remembers
  5. If the answer should be spoken, send to ElevenLabs
  6. Return the text response to the dashboard

If Gemini detects the user is giving a TASK (not a question):
  → Parse the task instruction (see Step 5)
  → Switch to monitor mode
  → Add the task
  → Respond: "Got it. I'll count people and let you know."
```

### Step 4: Add a /mode route for switching

Create `/api/sentinel/mode/route.js`:

```
GET  → returns { mode: "chat", activeTasks: [...] }
POST → { mode: "scan" } switches mode
       { mode: "monitor", task: "count people walking by" } switches + adds task
```

### Step 5: Task parsing — turning natural language into structured conditions

When a user says "count how many people walk across the room," you need to turn that into a structured object your perception loop can check every cycle.

Send the user's instruction to Gemini with a prompt like:

```
"The user wants SENTINEL to do this: [user message].
Parse into JSON:
{
  description: "human-readable task name",
  condition: {
    type: "people_count_exceeds | person_entered | lingering_detected | 
           object_detected | distance_below | perimeter_breach | activity_level",
    ...params for that type
  },
  speakTemplate: "what SENTINEL says when triggered, use {count} for totals",
  continuous: true/false
}"
```

The perception loop then checks each active task's condition against the incoming data every cycle. Most condition types are simple comparisons:
- `people_count_exceeds`: `people.length > threshold`
- `person_entered`: `people.length > previousPeopleCount`
- `lingering_detected`: any person's `stationaryFrames > durationThreshold`
- `object_detected`: any person description or object label contains the search term
- `distance_below`: `sensors.d.f < distanceCm`
- `perimeter_breach`: `sensors.ir[0] === 1 || sensors.ir[1] === 1`

### Step 6: Dashboard mode UI

Add a mode switcher component to your dashboard. Three buttons: Chat / Monitor / Scan. When in chat or monitor mode, show a text input where the user can type messages or task instructions. When in monitor mode, show the list of active tasks with their running counts and a pause/remove button for each.

---

## Integration Guide: How Each Service Fits

### Gemini (you already have this)

Gemini has THREE jobs in SENTINEL:

**Job 1: Vision (per-frame when triggered)**
Analyze camera frames. Returns people, objects, bounding boxes, environment. This is your existing `analyzeFrame()` function. No changes needed.

**Job 2: Agent planning (on triggers)**
When something happens (person close, breach, crowd), Gemini plans which tools to use. This is your existing `/agent` route. No changes needed — just wrap it in a mode check so it only fires in scan mode.

**Job 3: Chat + task parsing (new)**
Two new uses:
- Answer conversational questions ("How many people have you seen?") using current perception + MongoDB history as context.
- Parse natural language task instructions ("Count people walking by") into structured condition objects.

Both of these are just regular Gemini text calls with different prompts. Same API, same key, different system prompts.

### MongoDB (you already have this)

MongoDB has THREE jobs:

**Job 1: Event storage (all modes)**
Store meaningful events from the perception loop. Your existing `/perception` route handles this. The smart storage filter (only store when something changes) keeps the database clean.

**Job 2: Memory for chat queries**
When the user asks "what happened in the last 10 minutes?", you query the `detections` and `event_log` collections and pass the results to Gemini as context. Use your existing `/history` route or add simple queries.

**Job 3: Data source for pattern analysis**
Every 30 seconds (in scan mode) or on-demand, pull last 20 events + 1-hour baseline aggregation and send to Featherless. Your `analyses` collection stores the results.

**Additional MongoDB features to implement:**

- TTL index on `detections` collection: automatically delete documents older than 24 hours so the free tier doesn't fill up.
  ```
  db.detections.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 86400 })
  ```
- Aggregation pipeline for task tracking: count events matching a task's condition type over a time window.
- Store task definitions and results in a `tasks` collection so they persist across server restarts.

### Featherless / Llama (pattern analysis)

Featherless has ONE job: temporal pattern analysis. It reads stored events from MongoDB and finds patterns that no single frame could reveal.

**When it runs:**
- In scan mode: every 30 seconds automatically via setInterval on the dashboard or a cron-style call.
- In monitor mode: only when a task specifically requires pattern analysis (rare — most tasks are simple threshold checks).
- In chat mode: on-demand when the user asks something like "what patterns have you noticed?" — you can trigger it from the chat handler.

**What it receives:**
Last 20 events from MongoDB (timestamps, people counts, activities, sensor readings) plus a 1-hour baseline (average people, average distance, breach count).

**What it returns:**
Situation assessment, detected patterns with step-by-step reasoning, recommendations, and a spoken summary. The reasoning chain is the key differentiator — it's transparent because Llama is open-weight.

**Implementation:**
Your `/api/sentinel/analyze` route handles this. Call it:
- From a `setInterval` on the dashboard (scan mode, every 30s)
- From the `/chat` route when the user asks about patterns
- The route queries MongoDB, sends to Featherless, stores result in `analyses` collection

**Model selection:**
Use `meta-llama/Meta-Llama-3.1-70B-Instruct` for best reasoning quality. If latency is too high, fall back to a smaller model on Featherless (check their model catalog for what's available). Temperature 0.3 keeps the analysis focused and consistent.

### ElevenLabs (voice output)

ElevenLabs has ONE job: turn text into speech. But WHEN it speaks depends entirely on the mode.

**In chat mode:**
Only speaks when responding to a user query. The chat handler generates a text response, sends it to ElevenLabs, plays the audio on the dashboard.

**In monitor mode:**
Only speaks when a task condition is triggered. The task's `speakTemplate` string (with {count} etc. filled in) gets sent to ElevenLabs.

**In scan mode:**
Speaks on every significant detection, every pattern analysis summary, and every agent action. This is where the voice profiles matter — calm for routine detections, urgent for alerts, conversational for summaries.

**Voice queue (important):**
Implement a simple queue on the frontend to prevent overlapping speech. When a new speech request comes in while SENTINEL is already talking:
- In chat mode: queue it (wait for current speech to finish).
- In monitor mode: if the new message is higher priority, interrupt.
- In scan mode: queue with priority — alerts jump to the front.

```
// Simple frontend voice queue concept:
const voiceQueue = [];
let isSpeaking = false;

async function speak(text, context, priority = 'normal') {
  const item = { text, context, priority };
  if (priority === 'high') {
    voiceQueue.unshift(item);  // Jump to front
  } else {
    voiceQueue.push(item);
  }
  if (!isSpeaking) processQueue();
}

async function processQueue() {
  if (voiceQueue.length === 0) { isSpeaking = false; return; }
  isSpeaking = true;
  const { text, context } = voiceQueue.shift();
  const audioResponse = await fetch('/api/sentinel/speak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, context }),
  });
  const audioBlob = await audioResponse.blob();
  const audio = new Audio(URL.createObjectURL(audioBlob));
  audio.onended = () => processQueue();
  audio.play();
}
```

**Voice profile selection:**
Your existing ElevenLabs integration probably uses one voice setting. Add context-aware profiles:

```
detection → stability: 0.8, style: 0.15 (calm, informational)
alert     → stability: 0.55, style: 0.4 (urgent, attention-grabbing)
summary   → stability: 0.75, style: 0.2 (conversational, thoughtful)
chat      → stability: 0.7, style: 0.25 (friendly, responsive)
```

Pass the `context` field from your chat/agent/task responses to select the right profile.

### AWS Services (optional enhancements)

AWS is NOT required for the core system, but could add value if judges ask about scalability or production readiness. Only implement these if you have time after everything else works.

**AWS S3 — Frame storage:**
Instead of storing base64 frames in MongoDB (which eats your free tier storage), upload frames to S3 and store the URL in MongoDB. This is a quick win if your MongoDB is getting full.

```
Perception loop → capture frame → upload to S3 → store S3 URL in MongoDB
Dashboard → fetch frame URL from MongoDB → load image from S3
```

**AWS Lambda — Serverless pattern analysis:**
If you wanted to run the Featherless analysis on a schedule without relying on the dashboard being open, you could trigger a Lambda function every 30 seconds that queries MongoDB, calls Featherless, and stores the result. But for a hackathon demo, the dashboard-driven setInterval is simpler and works fine.

**AWS IoT Core — MQTT for real-time data:**
Instead of HTTP polling between the Pi and Next.js, you could use MQTT pub/sub through AWS IoT Core. The Pi publishes perception data to a topic, the dashboard subscribes. This gives you true real-time streaming instead of polling. But again, HTTP polling works fine for a demo.

**Recommendation:** Skip AWS unless you have extra time. The judges care about the AI stack (Gemini, Featherless, ElevenLabs) and the hardware. AWS adds complexity without adding demo impact. If asked about scalability, just SAY "in production we'd use S3 for frame storage and MQTT for real-time streaming" — you don't have to build it.

---

## Implementation Priority Order

### Must-have (do these first):

1. **Mode state on the backend** — `lib/mode.ts` with getMode/setMode/getTasks. (15 min)

2. **Mode check in /perception route** — Wrap agent triggers and voice calls in mode conditionals. (15 min)

3. **Mode switcher on the dashboard** — Three buttons, text input for chat/tasks. (30 min)

4. **Chat route** — `/api/sentinel/chat` that takes a user message, queries MongoDB for context, asks Gemini, returns a response. (30 min)

5. **Featherless analyze route** — `/api/sentinel/analyze` that pulls from MongoDB, sends to Featherless, stores result. Wire a 30-second setInterval on the dashboard that only runs in scan mode. (30 min)

6. **Voice queue on the frontend** — Prevent overlapping speech. (15 min)

### Nice-to-have (do these if time allows):

7. **Task parsing** — Gemini turns "count people" into a structured condition. The perception loop checks conditions. (45 min)

8. **Task UI** — Show active tasks on dashboard with counts and controls. (30 min)

9. **Voice profiles** — Different ElevenLabs settings per context type. (15 min)

10. **Pattern analysis loop** — setInterval that runs Featherless analysis every 30 seconds in scan mode. (15 min)

### Polish (only if everything else works):

11. **Smart storage filter** — Only store meaningful events, not every frame.
12. **Customizable profiles** — security/retail/care/wildlife presets that change thresholds.
13. **S3 frame storage** — Offload base64 frames from MongoDB.
14. **Voice input** — Web Speech API for hands-free chat (browser-native, no API needed).
15. **Overhead spatial map** — Bird's-eye view of where detections occurred.

---

## Example User Interactions by Mode

### Chat mode:

```
You: "How many people are in the room right now?"
SENTINEL: "I can see 3 people. Two are sitting at a table with laptops,
           one is standing near the door."

You: "Has anyone been here for a long time?"
SENTINEL: "One person at the center table has been there since I started
           monitoring 12 minutes ago. The other two arrived about 4 minutes ago."

You: "Start counting how many people walk past."
SENTINEL: "Got it. Switching to monitor mode. I'll count everyone who
           enters the scene and give you updates."
→ (automatically switches to monitor mode, creates a count task)
```

### Monitor mode:

```
(SENTINEL is silent, running the "count people" task)
(5 minutes pass, 8 people have walked by)

You: "How's the count going?"
SENTINEL: "I've counted 8 people walking past in the last 5 minutes.
           The busiest moment was around 2 minutes ago when 3 people
           came through within 15 seconds."

You: "Also alert me if anyone stands still for more than a minute."
SENTINEL: "Added. I'm now counting foot traffic and watching for lingering."

(30 seconds later, someone stops and stands still)
(60 seconds pass, they haven't moved)

SENTINEL: "Heads up — someone has been standing still near the left
           side for over a minute."
```

### Scan mode:

```
(SENTINEL is sweeping the room autonomously)
SENTINEL: "Scanning. I see 4 people at the tables on the left.
           Two laptops, one phone visible. Activity level is moderate."
(Gimbal pans right)
SENTINEL: "Right side is clear. One empty table."
(Someone approaches)
SENTINEL: "New person detected approaching at 2 meters. Standing,
           holding a coffee cup. Tracking."
(LEDs go yellow, gimbal follows the person)
(30-second pattern analysis runs)
SENTINEL: "Activity update: 5 people now in the area, up from 3
           ten minutes ago. Trend is increasing. The person near
           the entrance has been there for 2 minutes, which is
           longer than average."
```

---

## Architecture Summary

```
User input (text/voice)
    ↓
  Gemini parses intent:
    Question? → query MongoDB + current perception → answer
    Task?     → parse into structured condition → add to task list
    Mode switch? → change mode
    ↓
Perception loop (runs regardless of mode):
    OpenCV (fast, local) → bounding boxes, skeleton, face
    Sensors (Arduino) → distances, IR, sound
    ↓
  Smart storage filter:
    Changed? → store in MongoDB
    Same?    → skip
    ↓
  Mode check:
    Chat?    → store only, stay silent
    Monitor? → check task conditions → speak only on triggers
    Scan?    → full agent pipeline → narrate everything
    ↓
  If speaking needed:
    Generate text → ElevenLabs → voice queue → audio output
    ↓
  Every 30 seconds (scan mode only):
    MongoDB events → Featherless/Llama → pattern analysis
    → store analysis → speak summary if interesting
```

Every service has a clear, non-overlapping job:
- **OpenCV**: fast local tracking (what's moving)
- **Gemini**: understanding + planning (what is it, what should I do)
- **Featherless/Llama**: temporal reasoning (what does it mean over time)
- **ElevenLabs**: voice output (say it out loud)
- **MongoDB**: memory (remember everything important)
- **Arduino**: physical I/O (sensors in, servos/LEDs out)
