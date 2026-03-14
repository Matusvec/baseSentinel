# GREENPULSE — IoT Environmental Intelligence Station
## Complete Hackathon Build Guide

---

## TABLE OF CONTENTS
1. [The Concept](#the-concept)
2. [Track Qualification Map](#track-qualification-map)
3. [System Architecture](#system-architecture)
4. [Tech Stack](#tech-stack)
5. [Hardware Setup Guide](#hardware-setup-guide)
6. [Software Implementation](#software-implementation)
7. [API Integration Details](#api-integration-details)
8. [Database Schema](#database-schema)
9. [Agent Architecture](#agent-architecture)
10. [Frontend Dashboard](#frontend-dashboard)
11. [24-Hour Timeline](#24-hour-timeline)
12. [Role Division](#role-division)
13. [Pitch Strategy](#pitch-strategy)
14. [Devpost Submission](#devpost-submission)
15. [Pre-Hackathon Checklist](#pre-hackathon-checklist)
16. [Emergency Fallbacks](#emergency-fallbacks)
17. [Code Templates](#code-templates)

---

## THE CONCEPT

**GreenPulse** is a physical IoT environmental monitoring station powered by a Raspberry Pi and Grove sensors that sits on the judging table. It reads real-time environmental data (air quality, CO2 approximation, temperature, humidity, light, sound levels) and feeds it into an AI-powered intelligence system.

An autonomous AI agent (Gemini as orchestrator + Featherless.AI open-weight LLM for transparent environmental reasoning) analyzes sensor patterns, detects anomalies, and generates actionable sustainability insights. It speaks these insights aloud through ElevenLabs TTS in natural, conversational language.

A real-time web dashboard displays live sensor feeds, historical trends, environmental scores, and estimated cost/carbon savings. MongoDB Atlas stores all historical data and enables trend analysis.

**The killer demo moment:** Judges walk up to your table. There's a physical device with blinking sensors. The dashboard shows live data from THIS ROOM, RIGHT NOW. The device speaks: *"I've been monitoring this room for 6 hours. CO2 levels peaked at 2:30 PM when foot traffic was highest. Based on the temperature and occupancy patterns, opening the east-facing windows during peak hours would reduce HVAC energy consumption by approximately 18%, saving an estimated $3.20 per day for a room this size."*

No other team will have this. It's visceral. Judges can see it, hear it, and the data is about the air they're literally breathing.

**Why GreenPulse wins over generic sustainability apps:**
- It's PHYSICAL — judges remember what they can touch
- It's LIVE — the data is real, from this room, right now
- It's INTELLIGENT — not just displaying data, but reasoning about it
- It's AUDIBLE — the voice makes it feel alive
- It's ACTIONABLE — it doesn't just say "air quality is bad," it says "here's what to do and how much you'll save"
- Your partner (MechE) is the MOST CREDIBLE person to explain the hardware design

---

## TRACK QUALIFICATION MAP

### Main Track: SUSTAINABILITY (Prize: Sony WH Series Headphones)
**How it qualifies:** GreenPulse directly addresses climate change through data-driven resource management. It enables:
- Real-time environmental monitoring for carbon-aware decision making
- Energy waste detection and reduction recommendations
- Data-driven sustainability approaches using IoT + AI
- Long-term resource management through historical trend analysis

**Pitch angle:** "You can't manage what you can't measure. GreenPulse gives buildings eyes, ears, and a brain for sustainability."

---

### Sponsor Track 1: ELEVENLABS (Prize: 6-month Scale Plan, $330/mo per member)
**Requirement:** Meaningful TTS/voice cloning/audio integration. Central to the project, not a throwaway.

**How GreenPulse qualifies:**
- ElevenLabs voice IS the primary output interface — GreenPulse "speaks" its environmental insights
- The voice creates an emotional, memorable experience that a dashboard alone cannot
- Use case: periodic announcements ("Air quality has dropped — I recommend ventilation"), on-demand briefings ("Give me a sustainability report for the last 3 hours"), and alert escalation (urgent tone for dangerous readings)
- Voice personality customization — warm, professional "building AI assistant" voice
- This is not bolted on — remove the voice and the product fundamentally changes

**Key demo moment:** Judge asks "How's the air quality?" and GreenPulse responds verbally with a detailed, naturally spoken analysis.

---

### Sponsor Track 2: FEATHERLESS.AI (Prize: $300 / $150 / $75 Scale Plan)
**Requirement:** Open-weight LLM via Featherless inference API. Model choice deliberate and justified. Core to app logic.

**How GreenPulse qualifies:**
- **Privacy/Transparency narrative:** "Environmental compliance data is sensitive for businesses. Open-weight models through Featherless.AI mean companies can audit the AI's reasoning chain — critical for ESG reporting and regulatory compliance."
- Featherless.AI runs the environmental reasoning engine — takes raw sensor data + context and generates:
  - Root cause analysis ("Temperature spike correlates with direct sunlight exposure, not HVAC failure")
  - Actionable recommendations ("Install solar film on south-facing windows — estimated 12% cooling savings")
  - Cost/carbon calculations ("Current waste: $X/day, Y kg CO2/month")
- Model: **Llama 3.1 70B Instruct** or **Mixtral 8x22B** — chosen for strong reasoning on quantitative data
- This is NOT a surface feature — the entire intelligence layer runs through Featherless

**Model choice justification:**
"We use Llama 3.1 70B through Featherless.AI because environmental compliance requires transparency. When a building manager asks 'why did you recommend this?', the open-weight model's reasoning can be inspected and validated — unlike closed APIs where the logic is a black box. For ESG auditing, this is non-negotiable."

---

### Sponsor Track 3: JASECI LABS (Prize: 1-Year GPT Pro Subscription per member)
**Requirement:** Sophisticated agentic AI with autonomous decision-making, multi-step reasoning, tool use. 30 points for autonomy.

**How GreenPulse qualifies:**
The GreenPulse agent autonomously:
1. **Monitors** — continuously ingests sensor data streams
2. **Detects** — identifies anomalies (sudden CO2 spike, temperature drift, unusual light patterns)
3. **Diagnoses** — reasons about root causes using multiple data sources
4. **Decides** — chooses which tools to invoke:
   - `read_sensors()` → Raspberry Pi sensor data
   - `analyze_trends(timeframe)` → MongoDB historical query
   - `environmental_reasoning(data, context)` → Featherless.AI
   - `analyze_image(image)` → Gemini vision (for analyzing building plans, equipment photos)
   - `calculate_savings(current, recommended)` → Cost/carbon calculator
   - `generate_report(data, insights)` → Structured output
   - `speak_insight(text)` → ElevenLabs TTS
5. **Acts** — generates alerts, recommendations, and reports without human prompting
6. **Learns** — tracks which recommendations were effective over time (via MongoDB)

**The key differentiator for Jaseci judges:** GreenPulse doesn't wait to be asked. It proactively monitors, reasons, and speaks when it detects something worth reporting. That's genuine autonomy, not a chatbot wrapper.

---

### MLH Track 1: BEST USE OF GOOGLE GEMINI API (Prize: Google Swag Kits)
**How GreenPulse qualifies:**
- Gemini serves as the **agent orchestrator** — it receives sensor data + user queries and decides which tools to invoke
- Gemini **vision** analyzes building photos, floor plans, and equipment images to provide context-aware recommendations
- Gemini **multimodal** processes both text data and visual inputs simultaneously
- Use `gemini-2.0-flash` for fast orchestration, `gemini-1.5-pro` for complex analysis

---

### MLH Track 2: BEST USE OF ELEVENLABS (Prize: Wireless Earbuds)
- Same integration as sponsor track — double qualification
- Emphasize the compelling audio experience in the demo

---

### MLH Track 3: BEST USE OF MONGODB ATLAS (Prize: M5Stack IoT Kit)
**How GreenPulse qualifies:**
- MongoDB Atlas is the **time-series data backbone**:
  - Stores all sensor readings with timestamps (perfect for MongoDB's time-series collections)
  - Patient profiles replaced by "room profiles" / "building profiles"
  - Historical trend data for the AI agent to query
  - Generated reports and recommendations stored for reference
- MongoDB Atlas Search for querying environmental patterns
- Aggregation pipeline for computing averages, peaks, trends

---

### TRACKS WE'RE SKIPPING

| Track | Why Skip |
|-------|----------|
| **AWS** | 4+ services we've never used. Time cost too high for 24h. |
| **Base44** | Must build in their platform. Locks us out of our own stack. |
| **Solana** | No blockchain use case for environmental monitoring. |
| **Vultr** | Deploying to Vultr adds friction with no product benefit. |
| **Hardware Track** | We USE hardware but enter SUSTAINABILITY. Hardware track judges want hardware-centric projects. Our project is sustainability-centric that happens to use hardware. The sustainability angle is stronger with our team. |

---

## SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                        GREENPULSE SYSTEM                         │
│                                                                   │
│  ┌──────────────┐     ┌──────────────────────────────────────┐  │
│  │ RASPBERRY PI  │     │           WEB DASHBOARD               │  │
│  │              │     │          (Next.js + React)             │  │
│  │ Grove Sensors │────▶│                                        │  │
│  │ - Air Quality │ API │  ┌────────┐  ┌────────┐  ┌────────┐  │  │
│  │ - Temperature │     │  │ Live   │  │ Trends │  │ Alerts │  │  │
│  │ - Humidity    │     │  │ Gauges │  │ Charts │  │  Feed  │  │  │
│  │ - Light       │     │  └────────┘  └────────┘  └────────┘  │  │
│  │ - Sound       │     └──────────────────────────────────────┘  │
│  │ - CO2 (calc)  │                                                │
│  └──────┬───────┘     ┌──────────────────────────────────────┐  │
│         │              │          AI AGENT ENGINE               │  │
│         │              │                                        │  │
│         ▼              │  ┌─────────────┐   ┌──────────────┐  │  │
│  ┌──────────────┐     │  │   GEMINI     │   │ FEATHERLESS  │  │  │
│  │  SENSOR API   │────▶│  │ Orchestrator│──▶│  Reasoner    │  │  │
│  │  (Python/     │     │  │ + Vision    │   │ (Llama 3.1)  │  │  │
│  │   Flask)      │     │  └─────────────┘   └──────────────┘  │  │
│  └──────────────┘     │         │                              │  │
│                        │         ▼                              │  │
│                        │  ┌─────────────┐   ┌──────────────┐  │  │
│                        │  │ ELEVENLABS  │   │  MONGODB     │  │  │
│                        │  │   TTS       │   │  ATLAS       │  │  │
│                        │  │  (Voice)    │   │ (Time-series)│  │  │
│                        │  └─────────────┘   └──────────────┘  │  │
│                        └──────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Data Flow:**
1. Raspberry Pi reads Grove sensors every 5 seconds
2. Python Flask server on the Pi exposes a REST API
3. Next.js dashboard polls the sensor API (or uses WebSocket)
4. Every reading gets stored in MongoDB Atlas
5. AI agent monitors the stream — when it detects something interesting, it:
   a. Queries MongoDB for historical context
   b. Sends data to Featherless.AI for environmental reasoning
   c. Optionally uses Gemini for multimodal analysis
   d. Generates a spoken insight via ElevenLabs
6. Dashboard updates in real-time with live data + AI insights

---

## TECH STACK

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Hardware** | Raspberry Pi 4B | Sensor hub + local API server |
| **Sensors** | Grove Air Quality, Temperature, Light, Sound, Moisture | Environmental data collection |
| **Sensor Server** | Python + Flask (on Pi) | REST API exposing sensor readings |
| **Frontend** | Next.js 14 + React + Tailwind CSS | Real-time dashboard |
| **Charts** | Recharts or Chart.js | Time-series visualizations |
| **Agent Orchestrator** | Gemini 2.0 Flash API | Tool selection + multimodal analysis |
| **Environmental Reasoner** | Featherless.AI (Llama 3.1 70B) | Deep analysis + recommendations |
| **Voice Output** | ElevenLabs API (Turbo v2) | Spoken insights and alerts |
| **Database** | MongoDB Atlas (free tier) | Time-series sensor data + insights |
| **Deployment** | Vercel (dashboard) + Pi local (sensors) | Hosting |
| **Realtime** | Server-Sent Events or polling | Live data stream to dashboard |

---

## HARDWARE SETUP GUIDE

### What You'll Use From the Hardware Kit

| Component | Quantity | Purpose |
|-----------|----------|---------|
| Raspberry Pi 4B | 1 | Main controller |
| Arduino + Base Shield | 1 | Grove sensor interface |
| Grove Air Quality Sensor | 1 (from sensor pool) | Air quality index |
| Grove Temperature Sensor | 1 | Temperature + humidity |
| Grove Light Sensor | 1 | Ambient light levels |
| Grove Sound Sensor | 1 | Noise levels |
| Grove Moisture Sensor | 1 | Humidity/moisture (optional) |
| Breadboard | 1 | Prototyping |
| Grove Cables | 5 | Sensor connections |
| SD Card (via Vanja reader) | 1 | Pi OS |
| Grove LCD (optional) | 1 | Local display of readings |

### Option A: Raspberry Pi + Grove HAT (Simplest)
If they have a Grove Base HAT for Raspberry Pi, sensors plug directly into the Pi's GPIO.

```bash
# On the Raspberry Pi
# Install Grove.py library
pip3 install grove.py

# Test a sensor
python3 -c "
from grove.grove_air_quality_sensor_v1_3 import GroveAirQualitySensor
sensor = GroveAirQualitySensor(0)
print(sensor.value)
"
```

### Option B: Arduino as Sensor Hub → Pi as Brain (More Reliable)
Arduino reads sensors via Grove Base Shield. Pi communicates with Arduino over USB serial.

**Arduino Code (upload before hackathon if possible):**
```cpp
// arduino_sensors.ino
#include <Wire.h>

// Pin assignments (adjust based on what you plug in)
const int AIR_QUALITY_PIN = A0;
const int LIGHT_PIN = A1;
const int SOUND_PIN = A2;
const int TEMP_PIN = A3;

void setup() {
  Serial.begin(9600);
  pinMode(AIR_QUALITY_PIN, INPUT);
  pinMode(LIGHT_PIN, INPUT);
  pinMode(SOUND_PIN, INPUT);
  pinMode(TEMP_PIN, INPUT);
}

void loop() {
  int airQuality = analogRead(AIR_QUALITY_PIN);
  int light = analogRead(LIGHT_PIN);
  int sound = analogRead(SOUND_PIN);
  int tempRaw = analogRead(TEMP_PIN);

  // Convert temp sensor reading to Celsius (Grove Temperature Sensor v1.2)
  float resistance = (float)(1023 - tempRaw) * 10000 / tempRaw;
  float temperature = 1 / (log(resistance / 10000) / 3975 + 1 / 298.15) - 273.15;

  // Calculate approximate CO2 from air quality sensor
  // Grove Air Quality sensor gives 0-1023, higher = worse
  float co2Estimate = map(airQuality, 0, 1023, 400, 2000);

  // Light percentage (0-100)
  float lightPercent = map(light, 0, 1023, 0, 100);

  // Sound level (0-100 normalized)
  float soundLevel = map(sound, 0, 1023, 0, 100);

  // Output as JSON
  Serial.print("{\"temperature\":");
  Serial.print(temperature, 1);
  Serial.print(",\"air_quality\":");
  Serial.print(airQuality);
  Serial.print(",\"co2_estimate\":");
  Serial.print(co2Estimate, 0);
  Serial.print(",\"light\":");
  Serial.print(lightPercent, 0);
  Serial.print(",\"sound\":");
  Serial.print(soundLevel, 0);
  Serial.println("}");

  delay(5000); // Read every 5 seconds
}
```

**Python on Raspberry Pi (reads from Arduino):**
```python
# sensor_reader.py — runs on Raspberry Pi
import serial
import json
import time
from flask import Flask, jsonify
from flask_cors import CORS
from threading import Thread
import requests
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Global state
latest_reading = {}
reading_history = []

# MongoDB connection
MONGODB_URI = "your_mongodb_atlas_connection_string"

def read_sensors():
    """Continuously read from Arduino over serial"""
    global latest_reading
    ser = serial.Serial('/dev/ttyUSB0', 9600, timeout=2)  # or /dev/ttyACM0
    time.sleep(2)  # Wait for Arduino to initialize

    while True:
        try:
            line = ser.readline().decode('utf-8').strip()
            if line and line.startswith('{'):
                data = json.loads(line)
                data['timestamp'] = datetime.utcnow().isoformat()
                data['unix_ts'] = time.time()
                latest_reading = data
                reading_history.append(data)

                # Keep last 1000 readings in memory
                if len(reading_history) > 1000:
                    reading_history.pop(0)

                # Store in MongoDB (async in production, sync ok for hackathon)
                try:
                    store_reading(data)
                except Exception as e:
                    print(f"MongoDB store error: {e}")

        except (json.JSONDecodeError, UnicodeDecodeError) as e:
            print(f"Parse error: {e}")
        except Exception as e:
            print(f"Serial error: {e}")
            time.sleep(1)

def store_reading(data):
    """Store reading in MongoDB Atlas via API"""
    # You can use pymongo directly or use MongoDB Data API
    # For simplicity, we'll use pymongo
    from pymongo import MongoClient
    client = MongoClient(MONGODB_URI)
    db = client.greenpulse
    db.readings.insert_one(data)

@app.route('/api/current')
def get_current():
    """Get latest sensor reading"""
    return jsonify(latest_reading)

@app.route('/api/history')
def get_history():
    """Get last N readings"""
    n = int(request.args.get('n', 60))  # Last 60 readings = 5 min
    return jsonify(reading_history[-n:])

@app.route('/api/stats')
def get_stats():
    """Get computed statistics"""
    if not reading_history:
        return jsonify({})

    temps = [r['temperature'] for r in reading_history if 'temperature' in r]
    air = [r['air_quality'] for r in reading_history if 'air_quality' in r]

    return jsonify({
        'temp_avg': round(sum(temps) / len(temps), 1) if temps else 0,
        'temp_min': round(min(temps), 1) if temps else 0,
        'temp_max': round(max(temps), 1) if temps else 0,
        'air_quality_avg': round(sum(air) / len(air)) if air else 0,
        'total_readings': len(reading_history),
        'uptime_minutes': round(len(reading_history) * 5 / 60, 1),
    })

@app.route('/api/health')
def health_check():
    """Verify the sensor system is running"""
    return jsonify({
        'status': 'ok',
        'last_reading': latest_reading.get('timestamp', 'none'),
        'readings_count': len(reading_history)
    })

if __name__ == '__main__':
    # Start sensor reading in background thread
    sensor_thread = Thread(target=read_sensors, daemon=True)
    sensor_thread.start()
    print("Sensor reader started. API running on port 5000.")
    app.run(host='0.0.0.0', port=5000)
```

### Option C: Simulated Sensors (Emergency Fallback)
If hardware fails completely, simulate realistic sensor data:

```python
# simulated_sensors.py — EMERGENCY FALLBACK ONLY
import random
import math
import time
from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

start_time = time.time()

def generate_reading():
    """Generate realistic-looking sensor data with natural patterns"""
    elapsed = time.time() - start_time
    hour_of_day = (elapsed / 3600) % 24

    # Temperature: follows a daily cycle, 68-78°F range
    base_temp = 72 + 5 * math.sin((hour_of_day - 6) * math.pi / 12)
    temperature = base_temp + random.gauss(0, 0.5)

    # CO2: rises with occupancy (simulated)
    occupancy_factor = max(0, math.sin((hour_of_day - 8) * math.pi / 10))
    co2 = 400 + 800 * occupancy_factor + random.gauss(0, 30)

    # Air quality: inversely related to ventilation
    air_quality = int(200 + 600 * occupancy_factor + random.gauss(0, 50))

    # Light: follows daylight pattern
    light = max(0, min(100, 70 * math.sin((hour_of_day - 6) * math.pi / 12) + random.gauss(0, 5)))

    # Sound: higher during "business hours"
    sound = 20 + 40 * occupancy_factor + random.gauss(0, 8)

    return {
        'temperature': round(temperature, 1),
        'air_quality': max(0, min(1023, air_quality)),
        'co2_estimate': round(max(400, co2)),
        'light': round(max(0, min(100, light))),
        'sound': round(max(0, min(100, sound))),
        'timestamp': datetime.utcnow().isoformat(),
        'simulated': True  # Be honest in the data
    }

@app.route('/api/current')
def get_current():
    return jsonify(generate_reading())

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

**IMPORTANT: Only use simulated data as a last resort. If you use it, be TRANSPARENT with judges. Say "We had sensor issues so we're running a simulation model, but here's the real hardware that was collecting data earlier." Judges respect honesty. They hate discovering deception.**

---

## SOFTWARE IMPLEMENTATION

### Project Structure

```
greenpulse/
├── pi/                          # Runs on Raspberry Pi
│   ├── sensor_reader.py         # Flask API + sensor reading
│   ├── arduino_sensors.ino      # Arduino firmware
│   └── requirements.txt         # Python dependencies
│
├── web/                         # Next.js dashboard
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Main dashboard
│   │   ├── globals.css
│   │   └── api/
│   │       ├── agent/
│   │       │   └── route.ts     # Agent endpoint
│   │       ├── speak/
│   │       │   └── route.ts     # ElevenLabs TTS endpoint
│   │       ├── analyze/
│   │       │   └── route.ts     # On-demand analysis
│   │       └── history/
│   │           └── route.ts     # MongoDB history query
│   │
│   ├── components/
│   │   ├── LiveGauges.tsx       # Real-time sensor gauges
│   │   ├── TrendChart.tsx       # Historical trends
│   │   ├── AlertFeed.tsx        # AI-generated alerts
│   │   ├── VoiceControl.tsx     # Voice interaction UI
│   │   ├── EnvironmentScore.tsx # Overall score card
│   │   └── InsightPanel.tsx     # Latest AI insight
│   │
│   ├── lib/
│   │   ├── mongodb.ts           # MongoDB client
│   │   ├── gemini.ts            # Gemini API wrapper
│   │   ├── featherless.ts       # Featherless API wrapper
│   │   ├── elevenlabs.ts        # ElevenLabs API wrapper
│   │   └── agent.ts             # Agent loop logic
│   │
│   ├── .env.local               # API keys
│   ├── package.json
│   └── tailwind.config.ts
│
└── README.md
```

### Environment Variables (.env.local)

```bash
# Gemini
GEMINI_API_KEY=your_key_here

# Featherless.AI
FEATHERLESS_API_KEY=your_key_here

# ElevenLabs
ELEVENLABS_API_KEY=your_key_here
ELEVENLABS_VOICE_ID=your_voice_id  # Pick a warm, professional voice

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/greenpulse

# Raspberry Pi Sensor API (local network)
SENSOR_API_URL=http://raspberrypi.local:5000
# OR use the Pi's IP address: http://192.168.X.X:5000
```

---

## API INTEGRATION DETAILS

### 1. Gemini API — Agent Orchestrator

```typescript
// lib/gemini.ts
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface AgentAction {
  tool: string;
  params: Record<string, any>;
  reasoning: string;
}

export async function geminiOrchestrate(
  sensorData: any,
  userQuery: string | null,
  conversationHistory: any[]
): Promise<{ actions: AgentAction[], directResponse?: string }> {

  const systemPrompt = `You are the GreenPulse AI orchestrator. You receive real-time environmental sensor data and either proactive monitoring triggers or user queries.

Your available tools:
1. "environmental_reasoning" — Send data to the open-weight LLM for deep environmental analysis. Use for: root cause analysis, complex recommendations, cost calculations.
2. "query_history" — Query MongoDB for historical sensor data. Params: { timeframe: "1h" | "6h" | "24h", metric: "temperature" | "air_quality" | "co2" | "light" | "sound" | "all" }
3. "speak_insight" — Generate a spoken insight via ElevenLabs. Params: { text: "the text to speak", urgency: "low" | "medium" | "high" }
4. "analyze_image" — Analyze an image using Gemini vision. Params: { image: base64data, context: "description" }
5. "calculate_savings" — Calculate energy/cost savings. Params: { current_usage: {}, recommended: {}, room_size_sqft: number }

Current sensor readings:
${JSON.stringify(sensorData, null, 2)}

Rules:
- For proactive monitoring: only trigger actions if something is noteworthy (anomaly, threshold breach, interesting pattern)
- For user queries: always respond helpfully, chain multiple tools if needed
- Always include reasoning for each tool call
- If sensor data looks alarming, escalate urgency
- Return a JSON object with "actions" array and optional "directResponse" string

Respond ONLY with valid JSON. No markdown, no backticks.`;

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        ...conversationHistory.map(h => ({
          role: h.role,
          parts: [{ text: h.content }]
        })),
        ...(userQuery ? [{ role: 'user', parts: [{ text: userQuery }] }] : [
          { role: 'user', parts: [{ text: 'Analyze the current sensor readings. Only respond if something is noteworthy.' }] }
        ])
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      }
    })
  });

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

  try {
    const cleaned = text.replace(/```json\n?|```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { actions: [], directResponse: text };
  }
}
```

### 2. Featherless.AI — Environmental Reasoning Engine

```typescript
// lib/featherless.ts
const FEATHERLESS_API_KEY = process.env.FEATHERLESS_API_KEY;
const FEATHERLESS_URL = 'https://api.featherless.ai/v1/chat/completions';

export async function environmentalReasoning(
  sensorData: any,
  historicalContext: any,
  query: string
): Promise<string> {

  const systemPrompt = `You are GreenPulse's environmental reasoning engine. You are an expert in:
- Indoor air quality science (CO2, VOCs, particulate matter)
- Building energy efficiency and HVAC systems
- Sustainability metrics and carbon footprint calculation
- Cost analysis for energy savings

You receive real-time sensor data and historical context. Provide:
1. Clear analysis of current conditions
2. Root cause identification for any anomalies
3. Specific, actionable recommendations
4. Estimated cost and carbon savings when applicable

Be precise with numbers. Use real environmental science. Don't hedge — give confident assessments with your reasoning.

Format: Speak naturally as if you're a building sustainability consultant briefing a facilities manager. Be concise but thorough.`;

  const response = await fetch(FEATHERLESS_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FEATHERLESS_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Current Sensor Data:\n${JSON.stringify(sensorData, null, 2)}\n\nHistorical Context:\n${JSON.stringify(historicalContext, null, 2)}\n\nQuery: ${query}`
        }
      ],
      temperature: 0.4,
      max_tokens: 800
    })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Unable to analyze at this time.';
}
```

### 3. ElevenLabs — Voice Output

```typescript
// lib/elevenlabs.ts
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

export async function speakInsight(
  text: string,
  urgency: 'low' | 'medium' | 'high' = 'medium'
): Promise<Buffer> {

  // Adjust voice settings based on urgency
  const voiceSettings = {
    low: { stability: 0.8, similarity_boost: 0.7, speed: 0.9 },
    medium: { stability: 0.7, similarity_boost: 0.8, speed: 1.0 },
    high: { stability: 0.5, similarity_boost: 0.9, speed: 1.1 },
  };

  const settings = voiceSettings[urgency];

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2',
        voice_settings: {
          stability: settings.stability,
          similarity_boost: settings.similarity_boost,
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs error: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Streaming version for faster response
export async function speakInsightStream(text: string): Promise<ReadableStream> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2',
        voice_settings: { stability: 0.7, similarity_boost: 0.8 }
      })
    }
  );

  return response.body!;
}
```

### 4. MongoDB Atlas — Data Storage

```typescript
// lib/mongodb.ts
import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  cachedDb = client.db('greenpulse');
  return cachedDb;
}

// Store a sensor reading
export async function storeReading(reading: any) {
  const db = await getDb();
  return db.collection('readings').insertOne({
    ...reading,
    createdAt: new Date()
  });
}

// Get readings for a time range
export async function getReadings(timeframeMinutes: number) {
  const db = await getDb();
  const since = new Date(Date.now() - timeframeMinutes * 60 * 1000);
  return db.collection('readings')
    .find({ createdAt: { $gte: since } })
    .sort({ createdAt: 1 })
    .toArray();
}

// Get aggregated stats
export async function getStats(timeframeMinutes: number) {
  const db = await getDb();
  const since = new Date(Date.now() - timeframeMinutes * 60 * 1000);

  const pipeline = [
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: null,
        avgTemp: { $avg: '$temperature' },
        maxTemp: { $max: '$temperature' },
        minTemp: { $min: '$temperature' },
        avgCo2: { $avg: '$co2_estimate' },
        maxCo2: { $max: '$co2_estimate' },
        avgLight: { $avg: '$light' },
        avgSound: { $avg: '$sound' },
        avgAirQuality: { $avg: '$air_quality' },
        count: { $sum: 1 }
      }
    }
  ];

  const results = await db.collection('readings').aggregate(pipeline).toArray();
  return results[0] || null;
}

// Store AI-generated insights
export async function storeInsight(insight: any) {
  const db = await getDb();
  return db.collection('insights').insertOne({
    ...insight,
    createdAt: new Date()
  });
}

// Get recent insights
export async function getInsights(limit: number = 10) {
  const db = await getDb();
  return db.collection('insights')
    .find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}
```

---

## DATABASE SCHEMA

### MongoDB Collections

```javascript
// Collection: readings (time-series)
{
  _id: ObjectId,
  temperature: 72.4,           // Fahrenheit
  air_quality: 342,            // Raw sensor value 0-1023
  co2_estimate: 680,           // Estimated ppm
  light: 65,                   // Percentage 0-100
  sound: 32,                   // Normalized 0-100
  humidity: 45,                // Percentage (if sensor available)
  environment_score: 78,       // Computed 0-100
  source: "live" | "simulated",
  createdAt: ISODate("2026-03-14T15:30:00Z")
}

// Index for time-series queries
db.readings.createIndex({ createdAt: 1 })

// Collection: insights (AI-generated)
{
  _id: ObjectId,
  type: "anomaly" | "recommendation" | "report" | "alert",
  severity: "low" | "medium" | "high",
  title: "CO2 levels rising above comfort threshold",
  content: "Full analysis text...",
  sensorSnapshot: { temperature: 72.4, co2_estimate: 1200, ... },
  recommendations: [
    { action: "Open windows", impact: "Reduce CO2 by ~30%", savings: "$2.10/day" }
  ],
  spoken: true,  // Whether this was spoken aloud
  createdAt: ISODate("2026-03-14T16:00:00Z")
}

// Collection: room_profiles
{
  _id: ObjectId,
  name: "Nitschke Hall - Hackathon Room",
  sqft: 2000,
  occupancy_capacity: 100,
  hvac_type: "central",
  window_count: 6,
  created: ISODate("2026-03-14T11:00:00Z")
}
```

---

## AGENT ARCHITECTURE

### The Autonomous Agent Loop

```typescript
// lib/agent.ts
import { geminiOrchestrate } from './gemini';
import { environmentalReasoning } from './featherless';
import { speakInsight } from './elevenlabs';
import { getReadings, getStats, storeInsight } from './mongodb';

interface AgentState {
  lastAnalysis: number;
  conversationHistory: any[];
  alertCooldown: Map<string, number>;
}

const state: AgentState = {
  lastAnalysis: 0,
  conversationHistory: [],
  alertCooldown: new Map()
};

// Thresholds for proactive monitoring
const THRESHOLDS = {
  co2_high: 1000,        // ppm — above this is poor
  co2_dangerous: 1500,   // ppm — ventilation needed immediately
  temp_high: 80,         // °F
  temp_low: 65,          // °F
  air_quality_poor: 700, // Raw sensor value
  sound_high: 75,        // Normalized
  analysis_interval: 120000, // Analyze every 2 minutes
};

export async function runAgentCycle(sensorData: any): Promise<any> {
  const now = Date.now();

  // Check thresholds for immediate alerts
  const alerts = checkThresholds(sensorData);

  // Periodic deep analysis (every 2 minutes)
  const shouldAnalyze = (now - state.lastAnalysis) > THRESHOLDS.analysis_interval;

  if (!shouldAnalyze && alerts.length === 0) {
    return { status: 'monitoring', alerts: [] };
  }

  state.lastAnalysis = now;

  // Get historical context
  const history1h = await getStats(60);
  const history6h = await getStats(360);

  // Orchestrate with Gemini
  const orchestration = await geminiOrchestrate(
    { ...sensorData, alerts, history1h, history6h },
    null, // No user query — this is proactive
    state.conversationHistory
  );

  // Execute tool calls
  const results = [];
  for (const action of orchestration.actions) {
    const result = await executeTool(action);
    results.push(result);
  }

  return { status: 'analyzed', results, alerts };
}

export async function handleUserQuery(
  query: string,
  sensorData: any
): Promise<{ text: string; audio?: Buffer }> {

  const history1h = await getStats(60);
  const history6h = await getStats(360);

  // Orchestrate with Gemini
  const orchestration = await geminiOrchestrate(
    { ...sensorData, history1h, history6h },
    query,
    state.conversationHistory
  );

  // Execute all tool calls
  let finalResponse = orchestration.directResponse || '';
  let audioBuffer: Buffer | undefined;

  for (const action of orchestration.actions) {
    const result = await executeTool(action);

    if (action.tool === 'environmental_reasoning') {
      finalResponse = result;
    }
    if (action.tool === 'speak_insight') {
      audioBuffer = result;
    }
  }

  // If no speak action was triggered but we have a response, speak it
  if (!audioBuffer && finalResponse) {
    audioBuffer = await speakInsight(finalResponse);
  }

  // Store the conversation
  state.conversationHistory.push(
    { role: 'user', content: query },
    { role: 'assistant', content: finalResponse }
  );

  // Keep conversation history manageable
  if (state.conversationHistory.length > 20) {
    state.conversationHistory = state.conversationHistory.slice(-16);
  }

  return { text: finalResponse, audio: audioBuffer };
}

async function executeTool(action: any): Promise<any> {
  switch (action.tool) {
    case 'environmental_reasoning':
      const history = await getReadings(60);
      const analysis = await environmentalReasoning(
        action.params.sensorData || {},
        history,
        action.params.query || 'Analyze current conditions'
      );
      await storeInsight({
        type: 'recommendation',
        severity: action.params.urgency || 'medium',
        content: analysis,
      });
      return analysis;

    case 'query_history':
      const minutes = action.params.timeframe === '1h' ? 60 :
                     action.params.timeframe === '6h' ? 360 : 1440;
      return await getReadings(minutes);

    case 'speak_insight':
      const audio = await speakInsight(
        action.params.text,
        action.params.urgency || 'medium'
      );
      return audio;

    case 'calculate_savings':
      return calculateSavings(action.params);

    default:
      return null;
  }
}

function checkThresholds(data: any): string[] {
  const alerts: string[] = [];
  const now = Date.now();

  const check = (condition: boolean, key: string, msg: string) => {
    const cooldown = state.alertCooldown.get(key) || 0;
    if (condition && now > cooldown) {
      alerts.push(msg);
      state.alertCooldown.set(key, now + 300000); // 5 min cooldown per alert type
    }
  };

  check(data.co2_estimate > THRESHOLDS.co2_dangerous, 'co2_danger',
    `URGENT: CO2 at ${data.co2_estimate}ppm — well above safe levels. Ventilation needed immediately.`);

  check(data.co2_estimate > THRESHOLDS.co2_high, 'co2_high',
    `CO2 levels elevated at ${data.co2_estimate}ppm. Consider improving ventilation.`);

  check(data.temperature > THRESHOLDS.temp_high, 'temp_high',
    `Temperature is ${data.temperature}°F — above comfort range.`);

  check(data.temperature < THRESHOLDS.temp_low, 'temp_low',
    `Temperature is ${data.temperature}°F — below comfort range.`);

  check(data.air_quality > THRESHOLDS.air_quality_poor, 'air_poor',
    `Air quality sensor reading ${data.air_quality} indicates poor air quality.`);

  return alerts;
}

function calculateSavings(params: any): any {
  // Simplified savings calculation
  const { current_usage, recommended, room_size_sqft = 2000 } = params;

  // Average commercial electricity cost: $0.12/kWh
  // Average HVAC: $2-4/sqft/year
  const annualHVACCost = room_size_sqft * 3; // $3/sqft avg
  const dailyCost = annualHVACCost / 365;

  // Estimated savings based on recommendation type
  const savingsPercent = 0.15; // Conservative 15% savings estimate
  const dailySavings = dailyCost * savingsPercent;
  const annualSavings = dailySavings * 365;

  // Carbon: average 0.855 lbs CO2 per kWh
  const kwhSaved = annualSavings / 0.12;
  const co2Saved = kwhSaved * 0.855;

  return {
    daily_savings: `$${dailySavings.toFixed(2)}`,
    annual_savings: `$${annualSavings.toFixed(0)}`,
    co2_reduced_lbs: `${co2Saved.toFixed(0)} lbs`,
    co2_reduced_tons: `${(co2Saved / 2000).toFixed(1)} tons`,
  };
}
```

---

## FRONTEND DASHBOARD

### Main Page Layout

```tsx
// app/page.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import LiveGauges from '@/components/LiveGauges';
import TrendChart from '@/components/TrendChart';
import AlertFeed from '@/components/AlertFeed';
import VoiceControl from '@/components/VoiceControl';
import EnvironmentScore from '@/components/EnvironmentScore';

export default function Dashboard() {
  const [sensorData, setSensorData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Poll sensor data every 5 seconds
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/sensors/current');
        const data = await res.json();
        setSensorData(data);
        setHistory(prev => [...prev.slice(-720), data]); // Keep 1hr of data
      } catch (err) {
        console.error('Sensor fetch error:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Run agent cycle every 30 seconds
  useEffect(() => {
    const runAgent = async () => {
      if (!sensorData) return;
      try {
        const res = await fetch('/api/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sensorData, mode: 'proactive' })
        });
        const result = await res.json();
        if (result.insights?.length > 0) {
          setInsights(prev => [...result.insights, ...prev].slice(0, 50));
        }
      } catch (err) {
        console.error('Agent error:', err);
      }
    };

    const interval = setInterval(runAgent, 30000);
    return () => clearInterval(interval);
  }, [sensorData]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-green-400">GreenPulse</h1>
            <p className="text-gray-400 text-sm">Live Environmental Intelligence</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${sensorData ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-sm text-gray-400">
                {sensorData ? 'Sensors Online' : 'Connecting...'}
              </span>
            </div>
            <VoiceControl sensorData={sensorData} onInsight={(i: any) => setInsights(prev => [i, ...prev])} />
          </div>
        </div>
      </header>

      {/* Dashboard Grid */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-4">

          {/* Environment Score — top left */}
          <div className="col-span-4">
            <EnvironmentScore data={sensorData} />
          </div>

          {/* Live Gauges — top center + right */}
          <div className="col-span-8">
            <LiveGauges data={sensorData} />
          </div>

          {/* Trend Charts — bottom left */}
          <div className="col-span-8">
            <TrendChart history={history} />
          </div>

          {/* Alert/Insight Feed — bottom right */}
          <div className="col-span-4">
            <AlertFeed insights={insights} />
          </div>
        </div>
      </main>
    </div>
  );
}
```

### Voice Control Component

```tsx
// components/VoiceControl.tsx
'use client';
import { useState, useRef } from 'react';

interface VoiceControlProps {
  sensorData: any;
  onInsight: (insight: any) => void;
}

export default function VoiceControl({ sensorData, onInsight }: VoiceControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const current = event.results[event.results.length - 1];
      setTranscript(current[0].transcript);

      if (current.isFinal) {
        handleQuery(current[0].transcript);
      }
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.start();
  };

  const handleQuery = async (query: string) => {
    setIsSpeaking(true);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sensorData,
          mode: 'query',
          query
        })
      });

      const result = await res.json();

      // Play audio response
      if (result.audioUrl) {
        const audio = new Audio(result.audioUrl);
        audioRef.current = audio;
        audio.onended = () => setIsSpeaking(false);
        await audio.play();
      }

      // Add insight to feed
      if (result.text) {
        onInsight({
          type: 'response',
          severity: 'medium',
          title: `Q: ${query}`,
          content: result.text,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Query error:', err);
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={startListening}
        disabled={isSpeaking}
        className={`
          px-4 py-2 rounded-full text-sm font-medium transition-all
          ${isListening
            ? 'bg-red-500 text-white animate-pulse'
            : isSpeaking
            ? 'bg-purple-500 text-white animate-pulse'
            : 'bg-green-500 text-white hover:bg-green-600'
          }
        `}
      >
        {isListening ? '● Listening...' : isSpeaking ? '♪ Speaking...' : '🎤 Ask GreenPulse'}
      </button>
      {transcript && (
        <span className="text-xs text-gray-500 max-w-48 truncate">{transcript}</span>
      )}
    </div>
  );
}
```

### Environment Score Component

```tsx
// components/EnvironmentScore.tsx
'use client';

interface Props {
  data: any;
}

export default function EnvironmentScore({ data }: Props) {
  if (!data) return <div className="bg-gray-900 rounded-xl p-6 h-48 animate-pulse" />;

  // Calculate composite environment score (0-100)
  const tempScore = data.temperature >= 68 && data.temperature <= 76 ? 100 :
    Math.max(0, 100 - Math.abs(data.temperature - 72) * 5);
  const co2Score = Math.max(0, 100 - ((data.co2_estimate - 400) / 16));
  const lightScore = data.light >= 30 && data.light <= 80 ? 100 :
    Math.max(0, 100 - Math.abs(data.light - 55) * 2);
  const soundScore = data.sound <= 40 ? 100 : Math.max(0, 100 - (data.sound - 40) * 2);

  const overallScore = Math.round((tempScore + co2Score + lightScore + soundScore) / 4);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <h2 className="text-gray-400 text-sm mb-4">Environment Score</h2>
      <div className="text-center">
        <div className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>
          {overallScore}
        </div>
        <div className={`text-lg ${getScoreColor(overallScore)}`}>
          {getScoreLabel(overallScore)}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Temp</span>
          <span className={getScoreColor(tempScore)}>{Math.round(tempScore)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Air</span>
          <span className={getScoreColor(co2Score)}>{Math.round(co2Score)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Light</span>
          <span className={getScoreColor(lightScore)}>{Math.round(lightScore)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Sound</span>
          <span className={getScoreColor(soundScore)}>{Math.round(soundScore)}</span>
        </div>
      </div>
    </div>
  );
}
```

---

## 24-HOUR TIMELINE

### FRIDAY NIGHT (TONIGHT — Pre-Hackathon Prep)

**7:00 - 8:00 PM — Account Setup & API Testing**
- [ ] Create ElevenLabs account → get API key → test with curl
- [ ] Create Featherless.AI account → get API key + promo code → test with curl
- [ ] Create MongoDB Atlas account → create free cluster → get connection string
- [ ] Verify Gemini API key works
- [ ] Pick an ElevenLabs voice ID (something warm, professional — try "Adam" or "Rachel")

```bash
# Test ElevenLabs
curl -X POST "https://api.elevenlabs.io/v1/text-to-speech/YOUR_VOICE_ID" \
  -H "xi-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text":"GreenPulse environmental monitoring system online.","model_id":"eleven_turbo_v2"}' \
  --output test.mp3

# Test Featherless.AI
curl -X POST "https://api.featherless.ai/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"meta-llama/Meta-Llama-3.1-70B-Instruct","messages":[{"role":"user","content":"Hello"}],"max_tokens":50}'

# Test Gemini
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

**8:00 - 9:30 PM — Project Scaffolding**
- [ ] `npx create-next-app@latest greenpulse --typescript --tailwind --app`
- [ ] Install dependencies: `npm install mongodb`
- [ ] Create project structure (all the folders/files listed above)
- [ ] Set up `.env.local` with all API keys
- [ ] Create the lib/ wrapper files (gemini.ts, featherless.ts, elevenlabs.ts, mongodb.ts)
- [ ] Test MongoDB connection
- [ ] Push to GitHub

**9:30 - 10:30 PM — Arduino Prep (If You Have Access to Hardware)**
- [ ] Write and upload the Arduino sensor firmware
- [ ] Test serial output
- If no hardware access: write the simulated sensor script instead

**10:30 PM — STOP. Sleep. You need energy for tomorrow.**

### SATURDAY, MARCH 14

**8:30 AM — Check In. Get Hardware Kit Immediately.**

**9:00 - 10:00 AM — Opening Ceremony**

**10:00 - 11:00 AM — Team Formation + Hardware Sprint**
- YOU: Get Raspberry Pi + Arduino + Grove sensors from the kit
  - Plug sensors into Grove Base Shield on Arduino
  - Connect Arduino to Pi via USB
  - Flash Arduino firmware if not done Friday night
  - Test: can you read sensor data on the Pi?
- PARTNER: Start the pitch deck. Research sustainability data for the presentation.

**11:00 AM — HACKING STARTS**

**11:00 AM - 12:30 PM — Hardware + Sensor API (1.5 hours)**
- YOU: Get `sensor_reader.py` running on the Pi
  - Flask API serving live sensor data
  - Test: `curl http://raspberrypi.local:5000/api/current` returns JSON
  - If hardware issues: switch to simulated sensors FAST (don't spend more than 45 min debugging)
- PARTNER: Continue pitch deck. Research cost-per-sqft data for energy savings calculations.

**12:30 - 1:30 PM — Lunch (THE NODE). Eat. Hydrate.**

**1:30 - 4:00 PM — Core Agent Architecture (2.5 hours) — CRITICAL**
- YOU: Build the agent engine
  1. Gemini orchestrator (decides what tools to call)
  2. Featherless.AI environmental reasoning
  3. Tool execution framework
  4. Threshold-based alerting
  5. MongoDB data storage pipeline
  - Test: Feed sensor data into agent → get back a reasoned insight
- PARTNER: Practice pitch. Build the "market opportunity" slide with real numbers.

**4:00 - 6:00 PM — Voice + Dashboard (2 hours)**
- YOU: Two parallel tracks:
  1. ElevenLabs TTS integration (agent speaks its insights)
  2. Dashboard layout (LiveGauges, EnvironmentScore)
  - Test: Say "How's the air quality?" → hear GreenPulse respond with real analysis
- PARTNER: Design the demo script. What exact questions will you ask during judging?

**6:00 - 7:30 PM — Dashboard Polish (1.5 hours)**
- YOU: Trend charts, alert feed, real-time updates
  - Connect dashboard to live sensor API
  - Historical data visualization from MongoDB
- PARTNER: Finalize slides. Help test the dashboard UX.

**7:30 - 9:00 PM — Dinner (THE NODE). Take a real break.**

**9:00 PM - 12:00 AM — Integration + Polish (3 hours)**
- YOU:
  1. End-to-end flow: sensors → API → dashboard → agent → voice
  2. Polish the UI — dark theme, smooth animations, professional look
  3. Add the financial savings calculator
  4. Proactive agent monitoring (GreenPulse speaks WITHOUT being asked when it detects something)
- PARTNER: Final pitch rehearsal. Time it. Must be under 3 minutes.

**12:00 AM - 3:00 AM — Demo Hardening (3 hours)**
- Build 3 golden-path demo scenarios:
  1. Live dashboard tour — show real-time gauges, explain what they mean
  2. Voice query — "Give me a sustainability report for the last 3 hours"
  3. Proactive alert — trigger a CO2 spike (breathe on the sensor!) and watch GreenPulse respond
- Test each scenario 5+ times
- Fix any bugs or timing issues

**3:00 - 6:00 AM — Sleep 3 hours OR final UI polish**

### SUNDAY, MARCH 15

**9:00 - 10:00 AM — Breakfast**

**10:00 - 11:00 AM — Final Testing + Submission**
- Run all 3 demo scenarios one final time
- Submit on Devpost BEFORE 11:00 AM
- Make sure the physical device is working and positioned nicely

**11:00 AM — SUBMISSION DEADLINE**

**12:00 - 1:30 PM — JUDGING**
- Physical device on table, dashboard on laptop screen
- See Pitch Strategy below

---

## ROLE DIVISION

### You (Lead Developer + Demo Driver)
- All coding — Pi setup, API integrations, agent architecture, dashboard
- Live demo during pitch (voice queries, pointing at hardware)
- Technical architecture explanation
- Hardware debugging

### Partner (MechE + Business Lead)
**This is where her MechE background SHINES:**
- Explains the sensor selection and hardware design decisions to judges
  - "We chose the Grove Air Quality Sensor v1.3 because it detects both CO2 and VOC levels..."
  - "The Raspberry Pi processes sensor data locally before sending to the cloud, reducing latency..."
- This is credible because she IS an engineer — judges will notice
- Pitch deck creation and delivery
- Market research: building management market size, energy cost data, carbon credit pricing
- Financial model: ROI calculation for building managers
- Demo script design and rehearsal
- Time management during the hackathon
- UX testing — she tests the app as a non-technical user

---

## PITCH STRATEGY (3 MINUTES)

### Structure:

**[0:00 - 0:25] The Problem (Partner)**
"Buildings account for 40% of global energy consumption. Most building managers make decisions based on gut feeling, not data. They can't see CO2 levels, they can't quantify waste, and they definitely can't predict savings. The result: $X billion in wasted energy annually."

**[0:25 - 0:50] The Solution (Partner → You)**
"GreenPulse is an AI-powered environmental intelligence station. It monitors, reasons, and speaks — turning any room into a smart, sustainable space. Let me show you."

**[0:50 - 2:15] Live Demo (You drive, partner narrates)**

*Demo moment 1 (30s):* Point to the physical device. "This is GreenPulse. It's been monitoring this room since 11 AM. Here's what it's found."
→ Show the dashboard with live gauges and trends.

*Demo moment 2 (30s):* "Let me ask it a question."
→ "GreenPulse, give me a sustainability report for the last few hours."
→ GreenPulse speaks a 15-second analysis with specific numbers.

*Demo moment 3 (25s):* "Now watch what happens when air quality drops."
→ (Breathe on the air quality sensor to spike it, or just explain: "When CO2 crosses 1000ppm...")
→ GreenPulse proactively speaks an alert WITHOUT being asked. "This is autonomous intelligence."

**[2:15 - 2:40] Architecture + Privacy (You)**
"Under the hood: Gemini orchestrates the agent, Featherless.AI runs environmental reasoning through open-weight models — because building compliance data needs auditable AI — ElevenLabs makes it conversational, and MongoDB Atlas stores the time-series data. The agent autonomously monitors, detects anomalies, and takes action."

**[2:40 - 3:00] Impact + Business (Partner)**
"A single GreenPulse unit can identify $X in annual energy savings per 2,000 sq ft. Scale to a 50,000 sq ft office building: $Y/year in savings and Z tons of CO2 reduced. The hardware costs under $100. The ROI is immediate."

### Tailored talking points per judge:

| Judge Track | Key Point |
|-------------|-----------|
| **Sustainability** | "Data-driven sustainability — you can't manage what you can't measure" |
| **ElevenLabs** | "Voice IS the interface — removes all barriers to interacting with environmental data" |
| **Featherless** | "Open-weight models for auditable environmental compliance reasoning" |
| **Jaseci Labs** | "Autonomous monitoring + tool use + multi-step reasoning — not a chatbot" |
| **Gemini** | "Multimodal orchestrator — processes sensor data, images, and user queries" |
| **MongoDB** | "Time-series sensor data with aggregation pipeline for trend analysis" |

---

## DEVPOST SUBMISSION

### Title
GreenPulse — AI-Powered Environmental Intelligence Station

### Tagline
Turn any room into a smart, sustainable space with real-time IoT monitoring and an autonomous AI agent that sees, reasons, and speaks.

### Description Template
```
## Inspiration
Buildings account for 40% of global energy consumption...

## What it does
GreenPulse is a physical IoT environmental monitoring station...

## How we built it
- **Hardware:** Raspberry Pi 4B + Grove sensors (air quality, temperature, light, sound)
- **Agent Engine:** Gemini 2.0 Flash for orchestration + Featherless.AI (Llama 3.1 70B) for environmental reasoning
- **Voice:** ElevenLabs Turbo v2 for natural spoken insights
- **Data:** MongoDB Atlas for time-series sensor storage
- **Frontend:** Next.js + React + Tailwind CSS + Recharts
- **Deployment:** Vercel (dashboard) + Raspberry Pi (sensor hub)

## Challenges we ran into
[Be honest — judges respect this]

## Accomplishments
- Multi-model agentic architecture with genuine autonomy
- Physical hardware reading real environmental data
- Open-weight models for auditable sustainability reasoning
- Natural voice interaction for accessibility

## What we learned
[Featherless.AI, MongoDB Atlas time-series, Grove sensor integration]

## What's next
- Additional sensors (particulate matter, humidity)
- Integration with building management systems (BMS)
- Carbon credit tracking and ESG report generation
- Multi-room deployment with spatial mapping
```

### Built With Tags
`raspberry-pi` `arduino` `grove-sensors` `nextjs` `react` `tailwind` `gemini` `featherless-ai` `elevenlabs` `mongodb-atlas` `python` `flask` `iot`

---

## PRE-HACKATHON CHECKLIST

### Accounts & API Keys
- [ ] ElevenLabs account + API key + voice ID selected
- [ ] Featherless.AI account + API key + promo code from organizers
- [ ] MongoDB Atlas account + free cluster created + connection string
- [ ] Gemini API key verified
- [ ] GitHub repo created

### Code Prep
- [ ] Next.js project scaffolded with TypeScript + Tailwind
- [ ] All lib/ wrapper files created (even if empty)
- [ ] .env.local configured with all keys
- [ ] MongoDB connection tested
- [ ] Each API tested with curl

### Hardware Prep
- [ ] Arduino firmware written (upload at hackathon)
- [ ] Python sensor reader script written
- [ ] Simulated sensor fallback script ready

### Partner Prep
- [ ] Pitch deck template created
- [ ] Market research bookmarks saved
- [ ] Demo script outline drafted

---

## EMERGENCY FALLBACKS

| Failure | Fallback | Time Cost |
|---------|----------|-----------|
| **Hardware sensors don't work** | Switch to simulated sensors immediately. Be transparent with judges. | 5 minutes |
| **Raspberry Pi won't boot** | Run sensor API on your laptop with simulated data. Remove "IoT" angle from pitch, focus on AI. | 10 minutes |
| **ElevenLabs API down** | Use browser SpeechSynthesis API. Sounds robotic but works. | 5 minutes |
| **Featherless.AI down** | Route all reasoning through Gemini. Lose privacy narrative but app works. | 15 minutes |
| **MongoDB down** | Use in-memory arrays. Lose persistence but demo still works for 3 min. | 10 minutes |
| **WiFi issues** | Hotspot from your phone. Have all API keys in .env ready. | 2 minutes |
| **Pi can't connect to network** | Run sensor API on localhost, access from laptop via USB network. | 15 minutes |

### Feature Cut Priority (if running out of time):
1. **Cut first:** Image analysis via Gemini vision
2. **Cut second:** Financial savings calculator
3. **Cut third:** Historical trend charts (show live gauges only)
4. **Cut fourth:** Voice INPUT (keep voice output + text input)
5. **NEVER cut:** Live sensor display + Agent reasoning + ElevenLabs voice output

---

## CODE TEMPLATES

### Next.js API Route — Agent Endpoint

```typescript
// app/api/agent/route.ts
import { NextResponse } from 'next/server';
import { runAgentCycle, handleUserQuery } from '@/lib/agent';

export async function POST(request: Request) {
  const { sensorData, mode, query } = await request.json();

  if (mode === 'query' && query) {
    const result = await handleUserQuery(query, sensorData);

    // Convert audio buffer to base64 for client playback
    let audioUrl = null;
    if (result.audio) {
      const base64 = result.audio.toString('base64');
      audioUrl = `data:audio/mpeg;base64,${base64}`;
    }

    return NextResponse.json({
      text: result.text,
      audioUrl
    });
  }

  // Proactive monitoring mode
  const result = await runAgentCycle(sensorData);
  return NextResponse.json(result);
}
```

### Next.js API Route — Proxy Sensor Data (if Pi is on local network)

```typescript
// app/api/sensors/current/route.ts
import { NextResponse } from 'next/server';

const SENSOR_API = process.env.SENSOR_API_URL || 'http://localhost:5000';

export async function GET() {
  try {
    const res = await fetch(`${SENSOR_API}/api/current`, {
      cache: 'no-store'
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    // Return simulated data if sensor API is unreachable
    return NextResponse.json({
      temperature: 72.4,
      air_quality: 342,
      co2_estimate: 680,
      light: 65,
      sound: 32,
      timestamp: new Date().toISOString(),
      simulated: true
    });
  }
}
```

### Package.json Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "mongodb": "^6.0.0",
    "recharts": "^2.8.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0"
  }
}
```

### Pi Requirements.txt

```
flask==3.0.0
flask-cors==4.0.0
pyserial==3.5
pymongo==4.6.0
```

---

**This document is your complete build guide. Print it, bookmark it, have it open on a second screen. Every code snippet is copy-pastable. Every decision has been pre-made. Your job tomorrow is just to EXECUTE.**

**Good luck. Build something they'll remember.**
