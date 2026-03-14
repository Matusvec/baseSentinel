# SENTINEL — Autonomous AI Perception & Tracking Station
## RocketHacks Ultimate Hardware Track Strategy Document

---

## ELEVATOR PITCH (Memorize This)

> "Autonomous systems — drones, self-driving cars, security robots — all need the same thing: the ability to see, understand, decide, and act in the physical world. But building that perception stack costs hundreds of thousands of dollars and requires a team of PhD engineers. SENTINEL is a full autonomous perception station built from a $50 Raspberry Pi, a webcam, and two servo motors. It physically scans a room, detects and classifies everything it sees using AI vision, tracks targets by rotating in real-time, reasons about what it observes, and speaks its findings aloud. It's the entire self-driving car perception pipeline — in a device that fits on a desk. And every piece of the reasoning chain is transparent, built on open-weight AI."

---

## THE CONCEPT IN DETAIL

SENTINEL is a physical device sitting on your table that autonomously perceives and interacts with the world around it.

### What It Does — The Five Capabilities

**1. SCAN — Autonomous Room Surveillance**
The camera sits on a 2-axis servo gimbal (pan + tilt). When idle, SENTINEL slowly sweeps the room in a configurable scan pattern — left to right, then tilts slightly and sweeps back. Like a lighthouse, but intelligent. It's always looking.

**2. DETECT — AI-Powered Object & Person Recognition**
Every few seconds, SENTINEL captures a frame and sends it to Gemini Vision API. Gemini identifies everything in frame: people (how many, what they're doing, what they're holding), objects (laptops, phones, cups, backpacks), and environmental context (lighting, crowd density, activity level).

**3. TRACK — Physical Target Locking**
When something interesting is detected (a new person, movement, an anomaly), SENTINEL calculates where in the frame the target is and translates that to servo angles. The gimbal physically rotates to center the target in frame. As the target moves, SENTINEL follows. Judges will WATCH the camera head turn to face them.

**4. REASON — Autonomous AI Agent**
An AI agent (Gemini orchestrator + Featherless.AI reasoning) analyzes detection patterns over time. It doesn't just see — it understands: "Crowd density is increasing near the east side. 3 new people arrived in the last 2 minutes. The table at position 3 has been unoccupied for 15 minutes — possible abandoned items." It decides what's interesting without being told.

**5. SPEAK — Voice-Narrated Findings**
ElevenLabs gives SENTINEL a voice. It narrates detections in real-time: "New person detected, 1.8 meters away, approaching from the left." It also responds to voice queries: "What did you see in the last 10 minutes?" and delivers a spoken summary from its MongoDB memory.

### What It Looks Like On The Table

```
        [Webcam mounted on servo gimbal]
              |
    [Pan servo] ←→ rotates left/right
              |
    [Tilt servo] ↕ rotates up/down
              |
    [Arduino board] — controls servos + reads sensors
              |
    [Raspberry Pi 4B] — the brain
              |
    [Breadboard zone]
    ├── [Ultrasonic sensor #1] → front distance
    ├── [Ultrasonic sensor #2] → left distance  
    ├── [Ultrasonic sensor #3] → right distance
    ├── [IR Break Beam pair] → perimeter tripwire
    ├── [RGB Color Sensor] → object color identification
    ├── [Grove LEDs strip] → status indicators (green/yellow/red)
    ├── [Grove Buzzer] → alert sound
    ├── [Grove LCD] → local status display
    └── [Sound Sensor] → audio level detection

    [Your Laptop] — running the Next.js dashboard
```

### The Demo Scenarios That Win

**Demo 1 — The Judge Approach (30 seconds)**
A judge walks toward your table. The ultrasonic sensor detects them at 3 meters. The IR break beam triggers when they cross the perimeter. SENTINEL's camera rotates to face them. The voice says: "Person detected approaching at 1.8 meters. Standing, holding a clipboard. Confidence: 94%." The dashboard updates live with a detection card, distance reading, and AI analysis.

**Demo 2 — Autonomous Scan (30 seconds)**
You trigger scan mode. The camera sweeps left to right. On the dashboard, detections pop up in real-time as the camera captures each section: "Table 1: 3 people, 2 laptops. Table 2: empty. Table 3: 4 people, coding." An overhead map builds itself as SENTINEL creates a spatial awareness model of the room.

**Demo 3 — Conversational Query (30 seconds)**
You ask: "SENTINEL, what's happened in the last 5 minutes?" The voice responds: "In the last 5 minutes, I detected 12 unique people. 4 approached within 2 meters. Crowd density peaked at 2:43 PM with 8 people in frame. Activity level: high. One person lingered at the perimeter for 45 seconds before leaving — flagged as unusual."

**Demo 4 — Object Tracking (15 seconds)**
You hold up an object — a water bottle, a phone, whatever. SENTINEL's camera follows it as you move it left, right, up, down. The servos visibly rotate in real-time. The dashboard shows a tracking visualization with the object highlighted in the frame.

---

## TRACK QUALIFICATION MAP (7 Prize Pools)

### 1. MAIN TRACK: HARDWARE (Prize: Mechanical Keyboard + Gaming Mouse)

**Why SENTINEL dominates the Hardware track:**
The track description says: *"Projects that integrate physical components with software to solve real-world problems. This includes IoT devices, robotics, wearables, sensors, and custom-built electronics."*

SENTINEL uses **12+ physical components** working together:
- Raspberry Pi 4B (computing)
- Arduino + Base Shield (microcontroller)
- Logitech Webcam (vision input)
- 2x Micro Servos (motorized gimbal — ROBOTICS)
- 3x Ultrasonic Distance Sensors (spatial awareness — IoT)
- 2x IR Break Beam Sensors (perimeter detection — SECURITY)
- 20x Grove LEDs (status feedback — CUSTOM ELECTRONICS)
- Grove Buzzer (audio alert)
- Grove LCD (local display)
- Grove Sound Sensor (audio detection)
- RGB Color Sensor (object identification)
- 3-Axis Digital Sensor (vibration/movement)

Most hardware projects at hackathons use 2-3 components. You're using 12+. And they all work TOGETHER as a unified perception system. This isn't a Raspberry Pi reading a temperature sensor — it's a robot that sees, thinks, moves, and speaks.

**Pitch angle for hardware judges:**
- "SENTINEL is the full autonomous perception stack — scan, detect, track, reason, act — in a device that costs $50 in parts."
- "We're not just reading sensors. We built a robotic gimbal that physically tracks targets using computer vision and servo control. The hardware and software are inseparable."
- "12 hardware components, 2 microcontrollers, 4 AI systems, one autonomous machine."
- Your partner (MechE): "As a mechanical engineering student, I designed the gimbal assembly and sensor layout. The servo geometry maps camera pixel coordinates to physical rotation angles."

**Your partner's role is CRITICAL here.** She's a MechE. The hardware track judges will ask about the physical design. She should explain:
- Why the 2-axis gimbal design (pan + tilt gives full hemispheric coverage)
- The servo selection (9g micro servos — fast enough for tracking, precise enough for scanning)
- The ultrasonic sensor array geometry (front + left + right gives 180° distance awareness)
- The IR break beam as a binary perimeter trigger vs. ultrasonic for continuous distance

This is literally her engineering discipline. She's the most credible person in the room to present this.

---

### 2. SPONSOR TRACK: ELEVENLABS (Prize: 6-month Scale Plan, $330/mo per member)

**How SENTINEL qualifies:**
- **Real-time narration** is the primary output mechanism. SENTINEL doesn't show text alerts — it SPEAKS: "Person detected at 2.1 meters, moving left."
- **Contextual voice adaptation:** Routine scan results get a calm, measured voice. Anomaly detections get a more urgent tone. Query responses get a conversational tone.
- **Voice queries:** Users talk TO SENTINEL: "What did you see?" "How many people walked by?" "Is anyone in the restricted zone?" It answers from memory.
- **Voice is the product:** A perception system that only shows data on a screen is a dashboard. A perception system that TALKS TO YOU is an intelligent agent. ElevenLabs transforms SENTINEL from a monitoring tool into a conversational autonomous system.

**Implementation:**
```javascript
// ElevenLabs voice system with context-aware delivery
const VOICE_ID = 'onwK4e9ZLuTAKqWW03F9'; // "Daniel" — authoritative, clear

const VOICE_PROFILES = {
  detection: {
    stability: 0.8,
    similarity_boost: 0.8,
    style: 0.15,
    // Calm, informational — "Person detected at 2 meters"
  },
  alert: {
    stability: 0.55,
    similarity_boost: 0.85,
    style: 0.4,
    // Urgent — "Perimeter breach detected on the east side"
  },
  summary: {
    stability: 0.75,
    similarity_boost: 0.75,
    style: 0.2,
    // Conversational — responding to "What did you see?"
  },
  tracking: {
    stability: 0.85,
    similarity_boost: 0.8,
    style: 0.1,
    // Steady, continuous — "Target moving left... now centered... moving right"
  },
};

async function speakDetection(text, context = 'detection') {
  const settings = VOICE_PROFILES[context] || VOICE_PROFILES.detection;
  
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2', // Low latency — critical for real-time narration
        voice_settings: settings,
      }),
    }
  );
  return response;
}

// Debounce voice output — don't overlap speech
class VoiceQueue {
  constructor() {
    this.queue = [];
    this.speaking = false;
  }
  
  async enqueue(text, context, priority = 'normal') {
    if (priority === 'high') {
      this.queue.unshift({ text, context }); // Jump to front
    } else {
      this.queue.push({ text, context });
    }
    if (!this.speaking) this.processQueue();
  }
  
  async processQueue() {
    if (this.queue.length === 0) { this.speaking = false; return; }
    this.speaking = true;
    const { text, context } = this.queue.shift();
    const audio = await speakDetection(text, context);
    // Play audio, wait for completion, then process next
    await playAudioStream(audio);
    this.processQueue();
  }
}
```

---

### 3. SPONSOR TRACK: FEATHERLESS.AI (Prize: $300 / $150 / $75 Scale Plan)

**The narrative:**
"Autonomous perception systems make decisions that affect the physical world — where to look, what to track, how to classify threats. That reasoning MUST be transparent. We use open-weight models through Featherless.AI so every decision SENTINEL makes can be audited. If SENTINEL says 'this person is acting unusually,' you can trace exactly WHY it reached that conclusion through the open-weight reasoning chain."

**Featherless handles the PATTERN ANALYSIS pipeline:**
- Gemini does the raw detection (fast, multimodal — identifies objects in frames)
- Featherless does the REASONING (slow, deep — analyzes patterns across multiple detections over time)

This separation is deliberate and smart:
- "Gemini tells us WHAT it sees. Featherless tells us what it MEANS."
- "The detection layer is fast — sub-second. The reasoning layer is deep — multi-step analysis of behavioral patterns."

**Implementation:**
```javascript
// Featherless.AI: Behavioral pattern reasoning
async function analyzePatterns(recentDetections, historicalContext) {
  const response = await fetch('https://api.featherless.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.FEATHERLESS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
      messages: [
        {
          role: 'system',
          content: `You are an autonomous perception analysis engine. You analyze detection data from a camera-based monitoring system and identify patterns, anomalies, and insights.

ANALYSIS FRAMEWORK:
1. Traffic patterns: Are people moving through normally or is there congestion?
2. Behavioral anomalies: Is someone lingering unusually long? Moving erratically? In a restricted zone?
3. Crowd dynamics: Is density increasing/decreasing? Where are clusters forming?
4. Temporal patterns: How does current activity compare to the baseline?
5. Object analysis: Any abandoned items? Unusual objects?

RESPONSE FORMAT (JSON):
{
  "situation_assessment": {
    "activity_level": "low|moderate|high|critical",
    "crowd_density": N,
    "trend": "increasing|stable|decreasing",
    "overall_risk": "normal|elevated|high"
  },
  "patterns_detected": [
    {
      "type": "congestion|lingering|unusual_movement|abandoned_object|crowd_forming|perimeter_breach",
      "description": "...",
      "confidence": 0-1,
      "severity": "info|warning|alert",
      "location_in_frame": "left|center|right",
      "reasoning": "Step-by-step explanation of why this pattern was flagged"
    }
  ],
  "recommendations": [
    {
      "action": "track|investigate|alert|ignore",
      "target": "...",
      "reasoning": "..."
    }
  ],
  "spoken_summary": "Natural language summary (30-60 words) for voice narration",
  "narration_context": "detection|alert|summary"
}`
        },
        {
          role: 'user',
          content: `Recent detections (last 5 minutes):
${JSON.stringify(recentDetections, null, 2)}

Historical baseline:
${JSON.stringify(historicalContext, null, 2)}

Current sensor readings:
- Ultrasonic distances: front=${recentDetections.distances?.front}cm, left=${recentDetections.distances?.left}cm, right=${recentDetections.distances?.right}cm
- Sound level: ${recentDetections.sound_level}
- Perimeter breach: ${recentDetections.perimeter_breach ? 'YES' : 'No'}
- Vibration: ${recentDetections.vibration_level}`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content.replace(/```json|```/g, '').trim());
}
```

---

### 4. SPONSOR TRACK: JASECI LABS (Prize: 1-Year GPT Pro Subscription per member)

**SENTINEL is the ULTIMATE agentic AI showcase.** The agent doesn't just respond to prompts — it autonomously perceives, decides, and acts in the physical world. This is embodied AI.

**Agent Tool Kit — 12 tools, 3 categories:**

```javascript
// PERCEPTION TOOLS — Gathering information
const perceptionTools = {
  capture_frame: {
    description: 'Capture current camera frame and send to Gemini for object detection',
    execute: async () => await captureAndAnalyze(),
  },
  read_distances: {
    description: 'Read ultrasonic sensor array (front, left, right distances in cm)',
    execute: async () => await readUltrasonicArray(),
  },
  check_perimeter: {
    description: 'Check IR break beam perimeter sensor status',
    execute: async () => await checkIRBeams(),
  },
  read_sound_level: {
    description: 'Read ambient sound level from sound sensor',
    execute: async () => await readSoundLevel(),
  },
  read_vibration: {
    description: 'Read vibration/movement from 3-axis digital sensor',
    execute: async () => await readVibration(),
  },
  identify_color: {
    description: 'Read RGB color of object directly in front of color sensor',
    execute: async (params) => await readColorSensor(),
  },
};

// ACTION TOOLS — Controlling the physical world
const actionTools = {
  move_gimbal: {
    description: 'Rotate camera gimbal to specific pan/tilt angles (pan: -90 to 90, tilt: -45 to 45)',
    execute: async (params) => await moveGimbal(params.pan, params.tilt),
  },
  track_target: {
    description: 'Lock camera onto a detected target and follow it continuously',
    execute: async (params) => await startTracking(params.target_id),
  },
  scan_room: {
    description: 'Begin autonomous room scan pattern (sweep left-right, then tilt and repeat)',
    execute: async () => await startScanPattern(),
  },
  set_alert_level: {
    description: 'Set LED status color and buzzer state (green/yellow/red, buzzer on/off)',
    execute: async (params) => await setAlertLevel(params.color, params.buzzer),
  },
};

// INTELLIGENCE TOOLS — AI reasoning and communication
const intelligenceTools = {
  analyze_patterns: {
    description: 'Deep behavioral analysis of detection patterns using open-weight LLM',
    execute: async (params) => await featherlessAnalysis(params),
  },
  speak_finding: {
    description: 'Narrate a detection or analysis result via ElevenLabs voice',
    execute: async (params) => await voiceQueue.enqueue(params.text, params.context, params.priority),
  },
  query_memory: {
    description: 'Query detection history from MongoDB for temporal analysis',
    execute: async (params) => await queryDetectionHistory(params),
  },
  update_lcd: {
    description: 'Update the local LCD display with current status text',
    execute: async (params) => await updateLCD(params.line1, params.line2),
  },
};

const allTools = { ...perceptionTools, ...actionTools, ...intelligenceTools };
```

**The Autonomous Agent Loop:**
```javascript
class SentinelAgent {
  constructor() {
    this.mode = 'scanning'; // scanning | tracking | investigating | idle
    this.currentTarget = null;
    this.detectionBuffer = []; // Last N detections for pattern analysis
    this.analysisInterval = null;
  }

  async start() {
    console.log('SENTINEL Agent online.');
    
    // Continuous perception loop (runs every 2-3 seconds)
    this.perceptionLoop = setInterval(() => this.perceive(), 2500);
    
    // Pattern analysis loop (runs every 30 seconds)
    this.analysisLoop = setInterval(() => this.analyzePatterns(), 30000);
    
    // Start in scan mode
    await this.tools.scan_room.execute();
    await this.tools.speak_finding.execute({
      text: 'SENTINEL online. Beginning autonomous scan.',
      context: 'detection',
    });
    await this.tools.set_alert_level.execute({ color: 'green', buzzer: false });
    await this.tools.update_lcd.execute({ line1: 'SENTINEL ONLINE', line2: 'Mode: Scanning' });
  }

  async perceive() {
    // Step 1: Read ALL sensors simultaneously
    const [frame, distances, perimeter, sound, vibration] = await Promise.all([
      this.tools.capture_frame.execute(),
      this.tools.read_distances.execute(),
      this.tools.check_perimeter.execute(),
      this.tools.read_sound_level.execute(),
      this.tools.read_vibration.execute(),
    ]);

    // Step 2: Fuse sensor data into a unified perception state
    const perception = {
      timestamp: new Date(),
      vision: frame, // Gemini's analysis of what's in the frame
      distances,     // { front: 180, left: 250, right: 310 } in cm
      perimeter_breach: perimeter.triggered,
      sound_level: sound.db,
      vibration: vibration.magnitude,
    };

    // Step 3: Store in detection buffer and MongoDB
    this.detectionBuffer.push(perception);
    if (this.detectionBuffer.length > 100) this.detectionBuffer.shift();
    await this.storeDetection(perception);

    // Step 4: AUTONOMOUS DECISION MAKING
    await this.decide(perception);
  }

  async decide(perception) {
    const { vision, distances, perimeter_breach, sound_level } = perception;
    
    // Priority 1: Perimeter breach — immediate response
    if (perimeter_breach && this.mode !== 'investigating') {
      this.mode = 'investigating';
      await this.tools.set_alert_level.execute({ color: 'red', buzzer: true });
      await this.tools.speak_finding.execute({
        text: 'Perimeter breach detected. Investigating.',
        context: 'alert',
        priority: 'high',
      });
      await this.tools.update_lcd.execute({ line1: 'ALERT', line2: 'Perimeter Breach' });
      // Rotate toward breach direction based on which beam was broken
      return;
    }

    // Priority 2: New person detected within 3 meters
    if (vision.people?.length > 0 && distances.front < 300) {
      const closestPerson = vision.people[0];
      
      if (this.mode === 'scanning') {
        // Switch to tracking mode
        this.mode = 'tracking';
        this.currentTarget = closestPerson;
        
        // Calculate servo angles to center person in frame
        const { pan, tilt } = this.calculateTrackingAngles(closestPerson.bbox);
        await this.tools.move_gimbal.execute({ pan, tilt });
        
        await this.tools.set_alert_level.execute({ color: 'yellow', buzzer: false });
        await this.tools.speak_finding.execute({
          text: `Person detected at ${(distances.front / 100).toFixed(1)} meters. ${closestPerson.description}. Tracking.`,
          context: 'detection',
        });
        await this.tools.update_lcd.execute({ 
          line1: 'TRACKING', 
          line2: `Dist: ${(distances.front / 100).toFixed(1)}m` 
        });
      } else if (this.mode === 'tracking') {
        // Continue tracking — update servo position
        const { pan, tilt } = this.calculateTrackingAngles(closestPerson.bbox);
        await this.tools.move_gimbal.execute({ pan, tilt });
      }
      return;
    }

    // Priority 3: Interesting objects detected
    if (vision.objects?.length > 0 && vision.objects.some(o => o.interesting)) {
      const interesting = vision.objects.find(o => o.interesting);
      await this.tools.speak_finding.execute({
        text: `Interesting object detected: ${interesting.label}. ${interesting.description}`,
        context: 'detection',
      });
      return;
    }

    // Priority 4: Nothing happening — resume scanning
    if (this.mode !== 'scanning' && distances.front > 400) {
      this.mode = 'scanning';
      this.currentTarget = null;
      await this.tools.set_alert_level.execute({ color: 'green', buzzer: false });
      await this.tools.scan_room.execute();
      await this.tools.update_lcd.execute({ line1: 'SENTINEL', line2: 'Mode: Scanning' });
    }
  }

  calculateTrackingAngles(bbox) {
    // bbox = { x, y, width, height } normalized 0-1 from Gemini
    // Map center of bounding box to servo angles
    
    const centerX = bbox.x + bbox.width / 2;  // 0 = left, 1 = right
    const centerY = bbox.y + bbox.height / 2;  // 0 = top, 1 = bottom
    
    // Map to servo range
    // Pan: centerX 0→1 maps to -90→+90 degrees (left to right)
    const pan = Math.round((centerX - 0.5) * 180);
    // Tilt: centerY 0→1 maps to +45→-45 degrees (up to down)
    const tilt = Math.round((0.5 - centerY) * 90);
    
    return { 
      pan: Math.max(-90, Math.min(90, pan)), 
      tilt: Math.max(-45, Math.min(45, tilt)) 
    };
  }

  async analyzePatterns() {
    if (this.detectionBuffer.length < 5) return; // Need minimum data
    
    const recentDetections = this.detectionBuffer.slice(-20);
    const historicalBaseline = await this.tools.query_memory.execute({
      timerange: '1h',
      type: 'summary',
    });
    
    const analysis = await this.tools.analyze_patterns.execute({
      recentDetections,
      historicalContext: historicalBaseline,
    });
    
    // If analysis found something worth speaking about
    if (analysis.spoken_summary && analysis.situation_assessment.activity_level !== 'low') {
      await this.tools.speak_finding.execute({
        text: analysis.spoken_summary,
        context: analysis.narration_context || 'summary',
      });
    }
    
    // Store analysis in MongoDB
    await this.storeAnalysis(analysis);
  }

  // Handle voice queries from the user
  async handleVoiceQuery(query) {
    // Use Gemini to plan how to answer the query
    const plan = await this.planWithGemini({
      type: 'user_query',
      query,
      current_mode: this.mode,
      recent_detections: this.detectionBuffer.slice(-10),
    });
    
    const results = [];
    for (const step of plan.steps) {
      const result = await allTools[step.tool].execute(step.params);
      results.push({ tool: step.tool, result });
    }
    
    return results;
  }
}
```

---

### 5. MLH: BEST USE OF GOOGLE GEMINI API (Prize: Google Swag Kits)

**Gemini is the perception backbone — it's used in THREE critical ways:**

**A. Real-time object detection (Gemini Vision)**
Every captured frame gets sent to Gemini for analysis. This is the "eyes" of the system.

```javascript
// Gemini Vision: Analyze camera frame
async function analyzeFrame(imageBase64) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
            { text: `Analyze this camera frame from an autonomous monitoring system. Identify:

1. PEOPLE: Count, approximate distance (near/mid/far), activity (standing, sitting, walking, typing), what they're holding, notable features (wearing hat, carrying bag)
2. OBJECTS: Notable objects visible (laptops, phones, bags, cups, equipment)
3. ENVIRONMENT: Lighting level, crowd density, overall activity level
4. MOTION: Any visible motion blur indicating movement, direction of movement

CRITICAL: For each person, provide their approximate bounding box as normalized coordinates (0-1):
{ "x": left_edge, "y": top_edge, "width": bbox_width, "height": bbox_height }

Respond in JSON:
{
  "people": [
    {
      "id": 1,
      "bbox": { "x": 0.3, "y": 0.2, "width": 0.15, "height": 0.5 },
      "distance": "near|mid|far",
      "activity": "standing",
      "description": "Person in blue shirt, holding a clipboard",
      "facing": "toward_camera|away|left|right",
      "interesting": false
    }
  ],
  "objects": [
    {
      "label": "laptop",
      "bbox": { "x": 0.5, "y": 0.6, "width": 0.1, "height": 0.08 },
      "description": "Silver laptop, open, screen visible",
      "interesting": false
    }
  ],
  "environment": {
    "lighting": "bright|moderate|dim",
    "crowd_density": "empty|sparse|moderate|dense",
    "activity_level": "idle|low|moderate|high",
    "scene_description": "One sentence describing the overall scene"
  },
  "motion_detected": false,
  "motion_direction": null
}` }
          ]
        }],
        generationConfig: { 
          temperature: 0.2,
          maxOutputTokens: 1500,
        },
      }),
    }
  );

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}
```

**B. Agent orchestration**
Gemini plans which tools to call when the agent needs to make decisions.

**C. Voice query understanding**
When a user asks SENTINEL a question, Gemini interprets the query and maps it to tool calls.

---

### 6. MLH: BEST USE OF ELEVENLABS (Prize: Wireless Earbuds)
- Auto-qualifies from sponsor track

---

### 7. MLH: BEST USE OF MONGODB ATLAS (Prize: M5Stack IoT Kit)

**SENTINEL generates a LOT of data. MongoDB handles all of it.**

```javascript
// detections collection — every perception event
{
  _id: ObjectId,
  timestamp: ISODate("2026-03-15T14:30:15Z"),
  device_id: "sentinel-001",
  frame_id: "frame_20260315_143015",
  vision: {
    people: [
      {
        id: 1,
        bbox: { x: 0.3, y: 0.2, width: 0.15, height: 0.5 },
        distance: "near",
        activity: "standing",
        description: "Person in blue shirt, holding clipboard",
        facing: "toward_camera"
      }
    ],
    objects: [
      { label: "laptop", bbox: { x: 0.5, y: 0.6, width: 0.1, height: 0.08 } }
    ],
    environment: {
      lighting: "bright",
      crowd_density: "moderate",
      activity_level: "high",
      scene_description: "Busy hackathon floor with multiple teams at tables"
    }
  },
  sensors: {
    distances: { front: 180, left: 250, right: 310 },
    perimeter_breach: false,
    sound_level_db: 62,
    vibration_magnitude: 0.3,
    color_detected: { r: 120, g: 85, b: 200 }
  },
  gimbal_position: { pan: 15, tilt: -5 },
  agent_mode: "tracking",
  spoken_narration: "Person detected at 1.8 meters. Standing, holding clipboard."
}

// analyses collection — periodic pattern analysis
{
  _id: ObjectId,
  timestamp: ISODate("2026-03-15T14:30:00Z"),
  period_analyzed: "last_5_minutes",
  detections_analyzed: 12,
  analysis: {
    situation_assessment: {
      activity_level: "high",
      crowd_density: 8,
      trend: "increasing",
      overall_risk: "normal"
    },
    patterns_detected: [
      {
        type: "crowd_forming",
        description: "Group of 4 people gathered at position center-left for 3+ minutes",
        confidence: 0.87,
        severity: "info"
      }
    ],
    recommendations: [
      { action: "track", target: "crowd_cluster_1", reasoning: "Sustained gathering may indicate interest or issue" }
    ]
  },
  agent_tool_chain: ["capture_frame", "read_distances", "query_memory", "analyze_patterns", "speak_finding"],
  execution_time_ms: 4200
}

// tracking_sessions collection — continuous tracking data
{
  _id: ObjectId,
  session_start: ISODate,
  session_end: ISODate,
  target_description: "Person in blue shirt with clipboard",
  track_points: [
    { timestamp: ISODate, pan: 15, tilt: -5, distance_cm: 180, bbox: {...} },
    { timestamp: ISODate, pan: 22, tilt: -3, distance_cm: 165, bbox: {...} },
    // ... continuous tracking data
  ],
  duration_seconds: 28,
  average_distance_cm: 172,
  movement_pattern: "approach_then_linger"
}

// event_log collection — significant events for the timeline
{
  _id: ObjectId,
  timestamp: ISODate,
  event_type: "perimeter_breach|new_person|target_lost|anomaly|user_query",
  severity: "info|warning|alert",
  description: "Perimeter breach detected on east IR beam",
  spoken_narration: "Perimeter breach detected. Investigating.",
  agent_response: { action: "investigate", tool_chain: [...] }
}

// Aggregation: Activity heatmap by time
const activityByMinute = await db.collection('detections').aggregate([
  { $match: { timestamp: { $gte: lastHour } } },
  { $group: {
    _id: {
      minute: { $dateToString: { format: '%Y-%m-%dT%H:%M', date: '$timestamp' } }
    },
    avg_people: { $avg: { $size: '$vision.people' } },
    avg_distance: { $avg: '$sensors.distances.front' },
    max_people: { $max: { $size: '$vision.people' } },
    detections: { $sum: 1 },
    alerts: { $sum: { $cond: [{ $eq: ['$sensors.perimeter_breach', true] }, 1, 0] } }
  }},
  { $sort: { '_id': 1 } }
]).toArray();

// Aggregation: Person dwell time estimates
const dwellAnalysis = await db.collection('tracking_sessions').aggregate([
  { $match: { session_start: { $gte: lastHour } } },
  { $group: {
    _id: null,
    avg_dwell_seconds: { $avg: '$duration_seconds' },
    max_dwell_seconds: { $max: '$duration_seconds' },
    total_unique_targets: { $sum: 1 },
    total_tracking_time: { $sum: '$duration_seconds' }
  }}
]).toArray();
```

---

## COMPLETE TECH STACK

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Computing** | Raspberry Pi 4B | Camera capture, Gemini API calls, agent brain |
| **Microcontroller** | Arduino + Grove Shield | Servo control, sensor reading, LED/buzzer control |
| **Camera** | Logitech Webcam (USB) | Vision input — connected to RPi |
| **Gimbal** | 2x 9g Micro Servos | Pan (left-right) + Tilt (up-down) camera rotation |
| **Distance** | 3x Ultrasonic Distance Sensors | Spatial awareness — front, left, right |
| **Perimeter** | 2x IR Break Beam Sensors | Binary tripwire detection |
| **Feedback** | 20x Grove LEDs + Buzzer + LCD | Visual/audio status indicators |
| **Audio** | Grove Sound Sensor | Ambient noise level detection |
| **Color** | RGB Color Sensor with IR Filter | Object color identification |
| **Motion** | 3-Axis Digital Sensor | Vibration and tilt detection |
| **Communication** | USB serial (RPi ↔ Arduino) | Commands and sensor data exchange |
| **Frontend** | Next.js + React + Tailwind CSS | Command center dashboard |
| **Charts** | Recharts + Custom SVG | Live data visualization |
| **Vision AI** | Google Gemini 2.0 Flash | Real-time object detection |
| **Reasoning AI** | Featherless.AI (Llama 3.1 70B) | Behavioral pattern analysis |
| **Voice** | ElevenLabs API | Real-time narration |
| **Voice Input** | Web Speech API | User queries to SENTINEL |
| **Database** | MongoDB Atlas | All detection data, analyses, events |
| **Deployment** | Vercel (dashboard) + RPi local (hardware) | Web + physical |

---

## HARDWARE BUILD GUIDE

### The Servo Gimbal (The Most Important Physical Build)

**Parts needed from kit:**
- 2x 9g Micro Servos
- 1x Logitech Webcam
- Breadboard for mounting base
- Zip ties or tape for attachment
- Grove cables for servo connections

**Gimbal Assembly (15-20 minutes):**

```
SIDE VIEW:
                    [Webcam]
                       |
              [Tilt Servo Horn]
                  |        |
            [Tilt Servo Body]
                    |
           [Pan Servo Horn]  ← This horn rotates left/right
               |        |
         [Pan Servo Body]    ← This servo is fixed to the base
                 |
           [Breadboard base] ← Taped or zip-tied to table
```

**Step-by-step:**
1. **Base servo (PAN):** Tape or zip-tie the first servo to the breadboard with the horn pointing UP. This rotates the entire assembly left/right.
2. **Tilt servo:** Attach the second servo to the horn of the first servo using a zip tie or tape. Orient it so it rotates up/down (perpendicular to the pan servo).
3. **Camera mount:** Zip-tie or tape the Logitech webcam to the horn of the tilt servo. Make sure the USB cable has enough slack for full rotation.
4. **Test range of motion:** Pan should sweep ~180° (left to right). Tilt should sweep ~90° (up to down).

**The webcam's USB cable is your constraint.** Make sure it doesn't snag or pull tight at the extremes of rotation. Leave generous slack and loop it loosely.

### Arduino Wiring Guide

```
ARDUINO PIN ASSIGNMENTS:
========================

SERVOS (PWM pins):
  Pan Servo  → Pin 9  (PWM)
  Tilt Servo → Pin 10 (PWM)

ULTRASONIC SENSORS:
  Sensor 1 (Front):
    Trigger → Pin 2
    Echo    → Pin 3
  Sensor 2 (Left):
    Trigger → Pin 4
    Echo    → Pin 5
  Sensor 3 (Right):
    Trigger → Pin 6
    Echo    → Pin 7

IR BREAK BEAMS:
  Beam 1 (East perimeter) → Pin 8 (digital input, pull-up)
  Beam 2 (West perimeter) → Pin 11 (digital input, pull-up)

GROVE SHIELD (I2C/Analog):
  LEDs          → D12, D13 (or daisy-chain via Grove connectors)
  Buzzer        → D A0 (Grove analog)
  Sound Sensor  → A1 (Grove analog)
  RGB Color     → I2C (Grove I2C port)
  3-Axis Sensor → I2C (Grove I2C port)
  LCD           → I2C (Grove I2C port)

COMMUNICATION:
  Arduino USB → Raspberry Pi USB port (serial at 115200 baud)
```

### Arduino Firmware

```cpp
// sentinel_arduino.ino
// Controls servos, reads sensors, communicates with RPi via serial

#include <Servo.h>
#include <Wire.h>
#include <NewPing.h>  // Install via Library Manager

// ===== SERVO SETUP =====
Servo panServo;
Servo tiltServo;
const int PAN_PIN = 9;
const int TILT_PIN = 10;
int currentPan = 90;   // Center position
int currentTilt = 90;  // Center position

// ===== ULTRASONIC SETUP =====
#define FRONT_TRIG 2
#define FRONT_ECHO 3
#define LEFT_TRIG 4
#define LEFT_ECHO 5
#define RIGHT_TRIG 6
#define RIGHT_ECHO 7
#define MAX_DISTANCE 400  // cm

NewPing sonarFront(FRONT_TRIG, FRONT_ECHO, MAX_DISTANCE);
NewPing sonarLeft(LEFT_TRIG, LEFT_ECHO, MAX_DISTANCE);
NewPing sonarRight(RIGHT_TRIG, RIGHT_ECHO, MAX_DISTANCE);

// ===== IR BREAK BEAMS =====
#define IR_BEAM_1 8
#define IR_BEAM_2 11

// ===== GROVE COMPONENTS =====
#define BUZZER_PIN A0
#define SOUND_PIN A1
#define LED_PIN_1 12
#define LED_PIN_2 13

// ===== SCAN PATTERN =====
bool scanning = false;
int scanDirection = 1;  // 1 = right, -1 = left
int scanTiltStep = 0;
unsigned long lastScanStep = 0;
const int SCAN_INTERVAL = 100;  // ms between scan steps
const int SCAN_PAN_STEP = 3;    // degrees per step

// ===== COMMUNICATION PROTOCOL =====
// Commands FROM RPi (over serial):
//   "PAN:120"       → Move pan servo to 120 degrees
//   "TILT:75"       → Move tilt servo to 75 degrees
//   "MOVE:120,75"   → Move both servos
//   "SCAN:START"    → Begin scan pattern
//   "SCAN:STOP"     → Stop scanning
//   "LED:GREEN"     → Set LEDs to green
//   "LED:YELLOW"    → Set LEDs to yellow
//   "LED:RED"       → Set LEDs to red
//   "BUZZ:ON"       → Buzzer on
//   "BUZZ:OFF"      → Buzzer off
//   "READ"          → Request sensor readings
//
// Data TO RPi (JSON over serial):
//   {"d":{"f":180,"l":250,"r":310},"ir":[0,0],"s":512,"p":90,"t":90}

void setup() {
  Serial.begin(115200);
  
  // Servos
  panServo.attach(PAN_PIN);
  tiltServo.attach(TILT_PIN);
  panServo.write(90);   // Center
  tiltServo.write(90);  // Center
  
  // IR beams (active LOW with pull-up)
  pinMode(IR_BEAM_1, INPUT_PULLUP);
  pinMode(IR_BEAM_2, INPUT_PULLUP);
  
  // LEDs and buzzer
  pinMode(LED_PIN_1, OUTPUT);
  pinMode(LED_PIN_2, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Sound sensor
  pinMode(SOUND_PIN, INPUT);
  
  // I2C for Grove components
  Wire.begin();
  
  // Boot sequence
  digitalWrite(LED_PIN_1, HIGH);
  delay(200);
  digitalWrite(LED_PIN_2, HIGH);
  delay(200);
  
  Serial.println("{\"status\":\"SENTINEL_ARDUINO_READY\"}");
}

void loop() {
  // Handle serial commands from RPi
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    handleCommand(cmd);
  }
  
  // Run scan pattern if active
  if (scanning) {
    runScanPattern();
  }
  
  // Auto-send sensor data every 200ms
  static unsigned long lastSend = 0;
  if (millis() - lastSend > 200) {
    sendSensorData();
    lastSend = millis();
  }
}

void handleCommand(String cmd) {
  if (cmd.startsWith("MOVE:")) {
    // Parse "MOVE:pan,tilt"
    int commaIdx = cmd.indexOf(',', 5);
    int pan = cmd.substring(5, commaIdx).toInt();
    int tilt = cmd.substring(commaIdx + 1).toInt();
    moveServos(pan, tilt);
    scanning = false;  // Stop scanning when manual control
  }
  else if (cmd.startsWith("PAN:")) {
    int angle = cmd.substring(4).toInt();
    moveServos(angle, currentTilt);
    scanning = false;
  }
  else if (cmd.startsWith("TILT:")) {
    int angle = cmd.substring(5).toInt();
    moveServos(currentPan, angle);
    scanning = false;
  }
  else if (cmd == "SCAN:START") {
    scanning = true;
    scanDirection = 1;
    scanTiltStep = 0;
  }
  else if (cmd == "SCAN:STOP") {
    scanning = false;
  }
  else if (cmd == "LED:GREEN") {
    digitalWrite(LED_PIN_1, HIGH);
    digitalWrite(LED_PIN_2, LOW);
  }
  else if (cmd == "LED:YELLOW") {
    digitalWrite(LED_PIN_1, HIGH);
    digitalWrite(LED_PIN_2, HIGH);
  }
  else if (cmd == "LED:RED") {
    digitalWrite(LED_PIN_1, LOW);
    digitalWrite(LED_PIN_2, HIGH);
  }
  else if (cmd == "BUZZ:ON") {
    tone(BUZZER_PIN, 1000);
  }
  else if (cmd == "BUZZ:OFF") {
    noTone(BUZZER_PIN);
  }
  else if (cmd == "READ") {
    sendSensorData();
  }
}

void moveServos(int pan, int tilt) {
  // Constrain to safe ranges
  pan = constrain(pan, 0, 180);
  tilt = constrain(tilt, 45, 135);  // Limit tilt to prevent webcam cable snag
  
  // Smooth movement (step toward target)
  while (currentPan != pan || currentTilt != tilt) {
    if (currentPan < pan) currentPan = min(currentPan + 2, pan);
    else if (currentPan > pan) currentPan = max(currentPan - 2, pan);
    
    if (currentTilt < tilt) currentTilt = min(currentTilt + 2, tilt);
    else if (currentTilt > tilt) currentTilt = max(currentTilt - 2, tilt);
    
    panServo.write(currentPan);
    tiltServo.write(currentTilt);
    delay(15);  // Smooth movement speed
  }
}

void runScanPattern() {
  if (millis() - lastScanStep < SCAN_INTERVAL) return;
  lastScanStep = millis();
  
  currentPan += scanDirection * SCAN_PAN_STEP;
  
  if (currentPan >= 170) {
    scanDirection = -1;
    scanTiltStep++;
    // Tilt down slightly for next sweep
    currentTilt = constrain(90 + scanTiltStep * 10, 45, 135);
    tiltServo.write(currentTilt);
  }
  else if (currentPan <= 10) {
    scanDirection = 1;
    if (scanTiltStep >= 3) {
      scanTiltStep = 0;  // Reset tilt after full scan
      currentTilt = 90;
      tiltServo.write(currentTilt);
    }
  }
  
  panServo.write(currentPan);
}

void sendSensorData() {
  // Read ultrasonic distances
  unsigned int frontDist = sonarFront.ping_cm();
  unsigned int leftDist = sonarLeft.ping_cm();
  unsigned int rightDist = sonarRight.ping_cm();
  
  // Handle zero readings (out of range)
  if (frontDist == 0) frontDist = MAX_DISTANCE;
  if (leftDist == 0) leftDist = MAX_DISTANCE;
  if (rightDist == 0) rightDist = MAX_DISTANCE;
  
  // Read IR beams (LOW = beam broken)
  int ir1 = !digitalRead(IR_BEAM_1);
  int ir2 = !digitalRead(IR_BEAM_2);
  
  // Read sound level
  int soundLevel = analogRead(SOUND_PIN);
  
  // Send compact JSON
  Serial.print("{\"d\":{\"f\":");
  Serial.print(frontDist);
  Serial.print(",\"l\":");
  Serial.print(leftDist);
  Serial.print(",\"r\":");
  Serial.print(rightDist);
  Serial.print("},\"ir\":[");
  Serial.print(ir1);
  Serial.print(",");
  Serial.print(ir2);
  Serial.print("],\"s\":");
  Serial.print(soundLevel);
  Serial.print(",\"p\":");
  Serial.print(currentPan);
  Serial.print(",\"t\":");
  Serial.print(currentTilt);
  Serial.println("}");
}
```

### Raspberry Pi Software (Camera + Serial Bridge)

```python
#!/usr/bin/env python3
"""
SENTINEL - Raspberry Pi Controller
Handles: webcam capture, serial communication with Arduino,
         sending frames to Gemini API, relaying commands from web server.
"""

import cv2
import base64
import json
import time
import serial
import threading
import requests
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
import os

# ===== CONFIGURATION =====
ARDUINO_PORT = '/dev/ttyACM0'  # Adjust if different
ARDUINO_BAUD = 115200
CAMERA_INDEX = 0
CAPTURE_INTERVAL = 2.5  # seconds between vision analysis
SERVER_URL = os.getenv('SENTINEL_SERVER', 'http://localhost:3000/api/sentinel')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')

# ===== GLOBAL STATE =====
latest_sensor_data = {}
latest_frame = None
camera = None
arduino = None
running = True

# ===== CAMERA SETUP =====
def init_camera():
    global camera
    camera = cv2.VideoCapture(CAMERA_INDEX)
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    camera.set(cv2.CAP_PROP_FPS, 15)
    if not camera.isOpened():
        print("ERROR: Cannot open camera. Trying index 1...")
        camera = cv2.VideoCapture(1)
    print(f"Camera initialized: {camera.isOpened()}")

# ===== ARDUINO SERIAL =====
def init_arduino():
    global arduino
    try:
        arduino = serial.Serial(ARDUINO_PORT, ARDUINO_BAUD, timeout=1)
        time.sleep(2)  # Wait for Arduino reset
        print(f"Arduino connected on {ARDUINO_PORT}")
        # Read initial ready message
        line = arduino.readline().decode('utf-8', errors='ignore').strip()
        print(f"Arduino says: {line}")
    except Exception as e:
        print(f"Arduino connection failed: {e}")
        print("Running in SIMULATION mode — no physical hardware")
        arduino = None

def send_arduino_command(cmd):
    """Send a command to Arduino."""
    if arduino and arduino.is_open:
        arduino.write(f"{cmd}\n".encode())
    else:
        print(f"[SIM] Arduino command: {cmd}")

def read_arduino_data():
    """Continuously read sensor data from Arduino."""
    global latest_sensor_data
    while running:
        try:
            if arduino and arduino.in_waiting > 0:
                line = arduino.readline().decode('utf-8', errors='ignore').strip()
                if line.startswith('{'):
                    latest_sensor_data = json.loads(line)
            else:
                time.sleep(0.05)
        except (json.JSONDecodeError, serial.SerialException) as e:
            pass
        except Exception as e:
            print(f"Serial read error: {e}")
            time.sleep(0.1)

# ===== FRAME CAPTURE =====
def capture_frame():
    """Capture a frame from the webcam and return as base64 JPEG."""
    global latest_frame
    if camera and camera.isOpened():
        ret, frame = camera.read()
        if ret:
            latest_frame = frame
            # Encode to JPEG
            _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 75])
            return base64.b64encode(buffer).decode('utf-8')
    return None

# ===== GEMINI VISION =====
def analyze_frame_with_gemini(image_base64):
    """Send frame to Gemini Vision API for analysis."""
    try:
        response = requests.post(
            f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}',
            headers={'Content-Type': 'application/json'},
            json={
                'contents': [{
                    'parts': [
                        {'inlineData': {'mimeType': 'image/jpeg', 'data': image_base64}},
                        {'text': '''Analyze this camera frame from an autonomous monitoring system. Identify all people and notable objects.

For each person, provide approximate bounding box as normalized coordinates (0-1).

Respond ONLY in JSON (no markdown):
{
  "people": [{"id": 1, "bbox": {"x": 0.3, "y": 0.2, "width": 0.15, "height": 0.5}, "distance": "near", "activity": "standing", "description": "short description", "facing": "toward_camera"}],
  "objects": [{"label": "laptop", "bbox": {"x": 0.5, "y": 0.6, "width": 0.1, "height": 0.08}}],
  "environment": {"crowd_density": "sparse", "activity_level": "moderate", "scene_description": "one sentence"},
  "motion_detected": false
}'''}
                    ]
                }],
                'generationConfig': {'temperature': 0.2, 'maxOutputTokens': 1000},
            },
            timeout=10,
        )
        
        data = response.json()
        text = data['candidates'][0]['content']['parts'][0]['text']
        return json.loads(text.replace('```json', '').replace('```', '').strip())
    except Exception as e:
        print(f"Gemini API error: {e}")
        return None

# ===== MAIN PERCEPTION LOOP =====
def perception_loop():
    """Main loop: capture frame → analyze → send to web server."""
    while running:
        try:
            # Capture frame
            frame_b64 = capture_frame()
            if not frame_b64:
                time.sleep(1)
                continue
            
            # Analyze with Gemini
            vision = analyze_frame_with_gemini(frame_b64)
            
            # Package everything
            perception = {
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'device_id': 'sentinel-001',
                'vision': vision,
                'sensors': latest_sensor_data,
                'frame_thumbnail': frame_b64[:1000] + '...',  # Truncated for logging
                'frame_full': frame_b64,  # Full frame for dashboard
            }
            
            # Send to web server
            try:
                requests.post(
                    f'{SERVER_URL}/perception',
                    json=perception,
                    timeout=5,
                )
            except requests.exceptions.RequestException as e:
                print(f"Failed to send to server: {e}")
            
            # Log
            people_count = len(vision.get('people', [])) if vision else 0
            print(f"[{datetime.now().strftime('%H:%M:%S')}] "
                  f"People: {people_count} | "
                  f"Front: {latest_sensor_data.get('d', {}).get('f', '?')}cm | "
                  f"Gimbal: P{latest_sensor_data.get('p', '?')} T{latest_sensor_data.get('t', '?')}")
            
            time.sleep(CAPTURE_INTERVAL)
            
        except Exception as e:
            print(f"Perception loop error: {e}")
            time.sleep(2)

# ===== LOCAL HTTP SERVER (for receiving commands from web app) =====
class CommandHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = json.loads(self.rfile.read(content_length))
        
        if self.path == '/command':
            cmd = body.get('command', '')
            send_arduino_command(cmd)
            self.send_response(200)
            self.end_headers()
            self.wfile.write(json.dumps({'ok': True}).encode())
        
        elif self.path == '/gimbal':
            pan = body.get('pan', 90)
            tilt = body.get('tilt', 90)
            send_arduino_command(f"MOVE:{pan},{tilt}")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(json.dumps({'ok': True, 'pan': pan, 'tilt': tilt}).encode())
        
        elif self.path == '/scan':
            action = body.get('action', 'start')
            send_arduino_command(f"SCAN:{'START' if action == 'start' else 'STOP'}")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(json.dumps({'ok': True}).encode())
        
        elif self.path == '/alert':
            color = body.get('color', 'green').upper()
            buzzer = body.get('buzzer', False)
            send_arduino_command(f"LED:{color}")
            send_arduino_command(f"BUZZ:{'ON' if buzzer else 'OFF'}")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(json.dumps({'ok': True}).encode())
    
    def do_GET(self):
        if self.path == '/status':
            self.send_response(200)
            self.end_headers()
            self.wfile.write(json.dumps({
                'sensors': latest_sensor_data,
                'camera': camera.isOpened() if camera else False,
                'arduino': arduino.is_open if arduino else False,
            }).encode())
    
    def log_message(self, format, *args):
        pass  # Suppress request logging

def start_http_server(port=5000):
    server = HTTPServer(('0.0.0.0', port), CommandHandler)
    print(f"Command server listening on port {port}")
    server.serve_forever()

# ===== MAIN =====
def main():
    global running
    
    print("=" * 50)
    print("SENTINEL - Autonomous Perception Station")
    print("=" * 50)
    
    # Initialize hardware
    init_camera()
    init_arduino()
    
    # Start Arduino reader thread
    arduino_thread = threading.Thread(target=read_arduino_data, daemon=True)
    arduino_thread.start()
    
    # Start command server thread
    server_thread = threading.Thread(target=start_http_server, daemon=True)
    server_thread.start()
    
    # Start perception loop (main thread)
    try:
        # Center the gimbal
        send_arduino_command("MOVE:90,90")
        time.sleep(1)
        
        print("Starting perception loop...")
        perception_loop()
    except KeyboardInterrupt:
        print("\nShutting down SENTINEL...")
        running = False
        send_arduino_command("MOVE:90,90")  # Center gimbal
        send_arduino_command("LED:GREEN")
        send_arduino_command("BUZZ:OFF")
        if camera:
            camera.release()
        if arduino:
            arduino.close()

if __name__ == '__main__':
    main()
```

---

## NEXT.JS API ROUTES

### `/api/sentinel/perception` — Receive perception data from RPi

```javascript
// app/api/sentinel/perception/route.js
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
let cachedDb = null;

async function getDb() {
  if (cachedDb) return cachedDb;
  await client.connect();
  cachedDb = client.db('sentinel');
  return cachedDb;
}

// In-memory latest state for real-time dashboard
let latestPerception = null;
let perceptionListeners = [];

export async function POST(request) {
  try {
    const perception = await request.json();
    latestPerception = perception;
    
    const db = await getDb();
    
    // Store in MongoDB
    await db.collection('detections').insertOne({
      ...perception,
      timestamp: new Date(perception.timestamp),
      received_at: new Date(),
    });
    
    // Check if this needs agent processing
    const needsAgent = shouldTriggerAgent(perception);
    
    if (needsAgent) {
      // Fire agent analysis (don't block)
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sentinel/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger: needsAgent.trigger,
          perception,
        }),
      }).catch(console.error);
    }
    
    return Response.json({ status: 'ok', agent_triggered: !!needsAgent });
  } catch (error) {
    console.error('Perception error:', error);
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function GET() {
  // Return latest perception for dashboard polling
  return Response.json({ perception: latestPerception });
}

function shouldTriggerAgent(perception) {
  const { vision, sensors } = perception;
  
  // Perimeter breach — always trigger
  if (sensors?.ir?.[0] === 1 || sensors?.ir?.[1] === 1) {
    return { trigger: 'perimeter_breach' };
  }
  
  // New person detected close
  if (vision?.people?.length > 0 && sensors?.d?.f < 200) {
    return { trigger: 'person_close', distance: sensors.d.f };
  }
  
  // Crowd increase
  if (vision?.people?.length >= 3) {
    return { trigger: 'crowd_detected', count: vision.people.length };
  }
  
  return null;
}
```

### `/api/sentinel/agent` — Agent processing endpoint

```javascript
// app/api/sentinel/agent/route.js
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);

export async function POST(request) {
  const { trigger, perception } = await request.json();
  
  // Step 1: Gemini plans the response
  const plan = await planResponse(trigger, perception);
  
  // Step 2: Execute tool chain
  const results = [];
  for (const step of plan.steps) {
    let result;
    switch (step.tool) {
      case 'move_gimbal':
        result = await sendToRPi('/gimbal', step.params);
        break;
      case 'set_alert':
        result = await sendToRPi('/alert', step.params);
        break;
      case 'analyze_patterns':
        result = await featherlessAnalysis(perception, trigger);
        break;
      case 'speak':
        result = await generateSpeech(step.params.text, step.params.context);
        break;
      case 'query_memory':
        result = await queryDetectionHistory(step.params);
        break;
      case 'start_tracking':
        result = await initiateTracking(perception, step.params);
        break;
    }
    results.push({ tool: step.tool, result });
  }
  
  // Step 3: Store agent decision in MongoDB
  await client.connect();
  const db = client.db('sentinel');
  await db.collection('agent_decisions').insertOne({
    timestamp: new Date(),
    trigger,
    plan,
    results,
    perception_snapshot: {
      people_count: perception.vision?.people?.length || 0,
      distances: perception.sensors?.d,
      perimeter: perception.sensors?.ir,
    },
  });
  
  return Response.json({ plan, results });
}

async function sendToRPi(path, params) {
  try {
    const response = await fetch(`${process.env.RPI_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(3000),
    });
    return await response.json();
  } catch (e) {
    console.error(`RPi command failed: ${e.message}`);
    return { error: e.message };
  }
}

async function planResponse(trigger, perception) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are SENTINEL's autonomous decision engine. A trigger event occurred.

TRIGGER: ${trigger}

CURRENT PERCEPTION:
- People detected: ${perception.vision?.people?.length || 0}
- Objects: ${JSON.stringify(perception.vision?.objects?.map(o => o.label) || [])}
- Distances: front=${perception.sensors?.d?.f}cm, left=${perception.sensors?.d?.l}cm, right=${perception.sensors?.d?.r}cm
- Perimeter beams: ${JSON.stringify(perception.sensors?.ir)}
- Sound level: ${perception.sensors?.s}
- Gimbal position: pan=${perception.sensors?.p}, tilt=${perception.sensors?.t}

${perception.vision?.people?.length > 0 ? `Closest person: ${JSON.stringify(perception.vision.people[0])}` : 'No people detected'}

AVAILABLE TOOLS:
- move_gimbal: { pan: 0-180, tilt: 45-135 } — Rotate camera
- set_alert: { color: "green"|"yellow"|"red", buzzer: true|false } — Set status
- analyze_patterns: {} — Deep pattern analysis via Featherless.AI
- speak: { text: "...", context: "detection"|"alert"|"summary" } — Speak via ElevenLabs
- query_memory: { timerange: "5m"|"15m"|"1h" } — Query detection history
- start_tracking: { target_id: N } — Lock camera on a person

Decide what SENTINEL should do. Respond in JSON:
{
  "reasoning": "Why SENTINEL should take these actions",
  "steps": [
    { "tool": "tool_name", "params": { ... } }
  ]
}`
          }]
        }],
        generationConfig: { temperature: 0.2 },
      }),
    }
  );
  
  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

async function generateSpeech(text, context) {
  const VOICE_ID = 'onwK4e9ZLuTAKqWW03F9';
  const profiles = {
    detection: { stability: 0.8, similarity_boost: 0.8, style: 0.15 },
    alert: { stability: 0.55, similarity_boost: 0.85, style: 0.4 },
    summary: { stability: 0.75, similarity_boost: 0.75, style: 0.2 },
  };
  
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2',
        voice_settings: profiles[context] || profiles.detection,
      }),
    }
  );
  
  // Return audio as base64 for the dashboard to play
  const buffer = await response.arrayBuffer();
  return { audio_base64: Buffer.from(buffer).toString('base64') };
}

async function featherlessAnalysis(perception, trigger) {
  const response = await fetch('https://api.featherless.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.FEATHERLESS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
      messages: [
        {
          role: 'system',
          content: 'You are SENTINEL\'s behavioral analysis engine. Analyze detection patterns and identify anomalies, trends, and insights. Respond in JSON with: situation_assessment, patterns_detected, recommendations, spoken_summary (30-50 words), narration_context.',
        },
        {
          role: 'user',
          content: `Trigger: ${trigger}\nPerception: ${JSON.stringify(perception.vision)}\nSensors: ${JSON.stringify(perception.sensors)}`,
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });
  
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content.replace(/```json|```/g, '').trim());
}
```

---

## FRONTEND DASHBOARD — COMMAND CENTER

### Project Structure
```
src/
├── app/
│   ├── page.jsx                          # Main command center
│   ├── api/sentinel/
│   │   ├── perception/route.js           # Receive perception data
│   │   ├── agent/route.js                # Agent decisions
│   │   ├── speak/route.js                # ElevenLabs TTS
│   │   ├── history/route.js              # GET detection history
│   │   └── command/route.js              # Send commands to RPi
│   └── layout.jsx
├── components/
│   ├── LiveFeed.jsx                      # Camera feed with detection overlays
│   ├── SensorPanel.jsx                   # Real-time distance/IR/sound readings
│   ├── GimbalControl.jsx                 # Manual pan-tilt control (joystick UI)
│   ├── DetectionTimeline.jsx             # Scrolling event feed
│   ├── AgentReasoningLog.jsx             # Shows tool chain decisions
│   ├── DetectionMap.jsx                  # Overhead spatial map of detections
│   ├── StatsPanel.jsx                    # People count, avg distance, alerts
│   ├── VoiceInterface.jsx                # Talk to SENTINEL + hear responses
│   ├── ModeControl.jsx                   # Scan / Track / Idle toggle
│   └── AlertBar.jsx                      # Current alert level indicator
```

### Key Dashboard Component — The Live Feed with Detection Overlay:
```jsx
'use client';
import { useState, useEffect, useRef } from 'react';

export default function LiveFeed() {
  const [perception, setPerception] = useState(null);
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('/api/sentinel/perception');
      const data = await res.json();
      if (data.perception) {
        setPerception(data.perception);
        drawOverlays(data.perception);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function drawOverlays(p) {
    const canvas = canvasRef.current;
    if (!canvas || !p.vision) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    
    ctx.clearRect(0, 0, W, H);
    
    // Draw person bounding boxes
    if (p.vision.people) {
      p.vision.people.forEach((person, i) => {
        const { x, y, width, height } = person.bbox;
        const bx = x * W, by = y * H, bw = width * W, bh = height * H;
        
        // Bounding box
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);
        
        // Label background
        const label = `Person ${i + 1} • ${person.distance}`;
        ctx.font = '12px system-ui';
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(34, 197, 94, 0.85)';
        ctx.fillRect(bx, by - 20, textWidth + 8, 18);
        
        // Label text
        ctx.fillStyle = '#fff';
        ctx.fillText(label, bx + 4, by - 6);
        
        // Tracking crosshair on closest person
        if (i === 0) {
          const cx = bx + bw / 2;
          const cy = by + bh / 2;
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, cy, 20, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx - 30, cy); ctx.lineTo(cx + 30, cy);
          ctx.moveTo(cx, cy - 30); ctx.lineTo(cx, cy + 30);
          ctx.stroke();
        }
      });
    }
    
    // Draw object bounding boxes
    if (p.vision.objects) {
      p.vision.objects.forEach(obj => {
        const { x, y, width, height } = obj.bbox;
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(x * W, y * H, width * W, height * H);
        ctx.setLineDash([]);
        
        ctx.font = '11px system-ui';
        ctx.fillStyle = 'rgba(59, 130, 246, 0.85)';
        ctx.fillText(obj.label, x * W + 4, y * H - 4);
      });
    }
  }

  return (
    <div className="relative bg-black rounded-xl overflow-hidden">
      {/* Camera frame as background image */}
      {perception?.frame_full && (
        <img
          src={`data:image/jpeg;base64,${perception.frame_full}`}
          alt="SENTINEL feed"
          className="w-full h-auto"
        />
      )}
      {/* Detection overlay canvas */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute inset-0 w-full h-full"
      />
      {/* Mode indicator */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          perception ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`} />
        <span className="text-white text-xs font-medium bg-black/60 px-2 py-0.5 rounded">
          {perception ? 'LIVE' : 'OFFLINE'}
        </span>
      </div>
      {/* People count */}
      <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
        {perception?.vision?.people?.length || 0} people detected
      </div>
    </div>
  );
}
```

---

## 24-HOUR EXECUTION TIMELINE

### FRIDAY NIGHT (TONIGHT — Pre-Hackathon Prep)

**7:00 - 8:00 PM — Account Setup (1 hour)**
- [ ] ElevenLabs account + API key + test voice + pick voice ID
- [ ] Featherless.AI account + API key + get promo code from hackathon Discord
- [ ] MongoDB Atlas account + free cluster + connection string
- [ ] Gemini API key verified
- [ ] Test ALL APIs with curl (copy from previous docs)

**8:00 - 9:30 PM — Scaffold Web App (1.5 hours)**
```bash
npx create-next-app@latest sentinel --typescript --tailwind --app --src-dir
cd sentinel
npm install mongodb
```
- [ ] Set up `.env.local` with all API keys
- [ ] Create full folder structure
- [ ] MongoDB connection utility
- [ ] `/api/sentinel/perception` POST endpoint
- [ ] Basic dashboard layout with placeholder panels
- [ ] Test: Can you POST fake perception data and see it in MongoDB?

**9:30 - 10:30 PM — Arduino Code (1 hour)**
- [ ] Write the full `sentinel_arduino.ino` (copy from this doc)
- [ ] If you have an Arduino at home, test it. If not, review the code carefully so you can upload it quickly Saturday.
- [ ] Write the `sentinel_rpi.py` script with simulation mode

**10:30 - 11:00 PM — Gemini Vision Prompt (30 min)**
- [ ] Test the Gemini Vision analysis prompt with a sample image
- [ ] Take a photo of your room with your phone, convert to base64, send to Gemini API
- [ ] Verify the JSON response format is correct
- [ ] Tweak the prompt until bounding boxes and descriptions are accurate

**11:00 PM — STOP. SLEEP.**

---

### SATURDAY, MARCH 14

**8:30 AM — Check In**
- **IMMEDIATELY get from the hardware kit:**
  - 1x Raspberry Pi 4B
  - 1x Arduino + Base Shield
  - 1x Logitech Webcam
  - 2x 9g Micro Servos
  - 3x Ultrasonic Distance Sensors
  - 2x IR Break Beam Sensors
  - Grove LEDs (grab 10+)
  - Grove Buzzer, LCD, Sound Sensor, RGB Color Sensor
  - Breadboard, cables, zip ties
  - SD Card + Reader

**9:00 - 10:00 AM — Opening Ceremony + Hardware Prep**
- While listening: Flash RPi SD card, connect to WiFi
- Partner: Set up pitch deck template

**10:00 - 11:00 AM — Build the Gimbal + Wire Everything (1 hour) — CRITICAL**
- BUILD THE GIMBAL FIRST (15 min):
  1. Tape pan servo to breadboard
  2. Attach tilt servo to pan servo horn
  3. Zip-tie webcam to tilt servo horn
  4. Test range of motion by hand
- Wire ultrasonic sensors (20 min)
- Wire IR break beams (10 min)
- Wire LEDs + buzzer (10 min)
- Upload Arduino firmware
- **HARD STOP AT 10:55.** If servos are responding to serial commands, you're golden. If not, debug for 5 more minutes max, then move on to software. You can fix hardware issues later.
- Partner: Research autonomous systems market, security/surveillance applications for pitch

**11:00 AM — HACKING STARTS**

**11:00 AM - 12:30 PM — RPi + Camera Pipeline (1.5 hours)**
- Get the Python script running on RPi (or your laptop in simulation)
- Camera captures → base64 → Gemini API → JSON detections
- Serial communication with Arduino working
- Test: Gemini can identify people in the room from webcam frames
- Partner: Pitch deck slides — problem, market, competition

**12:30 - 1:30 PM — Lunch (THE NODE). Eat. Quick demo check with partner.**

**1:30 - 3:30 PM — Agent Brain + Tracking (2 hours) — MOST CRITICAL**
- Build the agent decision loop (perceive → decide → act)
- Implement tracking: when Gemini detects person → calculate bbox center → map to servo angles → MOVE GIMBAL
- **THIS IS THE MAGIC MOMENT:** Hold your hand in front of the camera. Watch the gimbal rotate to follow it. When this works, you know you're going to win.
- Wire up perimeter detection: IR break beam triggers → agent responds
- Set up LED status changes: green (scanning) → yellow (detected) → red (perimeter breach)
- Partner: Demo script, practice pitch, build cost analysis for surveillance market

**3:30 - 5:30 PM — Dashboard Core (2 hours)**
- Build the live feed component with detection overlays
- Build the sensor panel (distances, IR status, sound)
- Build the detection timeline (scrolling event feed)
- Build the gimbal control component (manual joystick UI)
- Wire up real-time polling from backend
- Partner: Practice pitch with hardware on table, time it

**5:30 - 7:00 PM — Voice + Featherless Integration (1.5 hours)**
- ElevenLabs narration: agent speaks detections
- Featherless pattern analysis: analyze last N detections, find patterns
- Voice queries: "What did you see?" → query MongoDB → synthesize → speak
- Voice queue system (don't overlap speech)
- Partner: Finalize slides, prepare Q&A answers

**7:30 - 9:00 PM — Dinner (THE NODE). Real break.**

**9:00 PM - 12:00 AM — Polish + Demo Scenarios (3 hours)**
- Make the dashboard look like a military-grade command center (dark theme, clean panels)
- Agent reasoning log component (show judges the thinking chain)
- Stats panel (total detections, people tracked, alerts fired)
- Mode control UI (Scan / Track / Idle buttons)
- Build and rehearse 4 demo scenarios
- Test each demo 5+ times
- Partner: Final pitch rehearsal, create physical notecard

**12:00 AM - 3:00 AM — Final Polish**
- Edge case handling (what if Gemini returns malformed JSON?)
- Loading states, error states
- Deploy web app to Vercel
- Verify RPi is stable and won't crash during judging
- Clean up the physical build — neat wires, stable gimbal, labels on components

**3:00 - 6:00 AM — Sleep. Your pitch needs to be sharp.**

### SUNDAY, MARCH 15
**9:00 AM** — Breakfast
**9:30 AM** — Set up SENTINEL on your demo table. Power on RPi. Start scanning. Let it collect data for 2 hours before judging — you want a rich MongoDB history to query.
**10:00 - 11:00 AM** — Final testing, Devpost submission
**11:00 AM** — DEADLINE
**12:00 - 1:30 PM** — JUDGING

---

## PITCH STRATEGY (3 MINUTES)

### [0:00 - 0:15] The Hook (You)
*Point at SENTINEL. It's already scanning the room. The camera is moving.*
"This is SENTINEL. It's been watching this room for the last 2 hours. It's detected 87 people, tracked 23 of them, and identified 3 anomalies. And right now..." *pause as the camera rotates to face the judge* "...it's looking at you."

### [0:15 - 0:40] The Problem (Partner)
"Autonomous perception — the ability for machines to see, understand, and act in the physical world — is the foundation of self-driving cars, drone surveillance, and smart buildings. But building a perception stack costs hundreds of thousands of dollars and requires PhD-level engineering. Security cameras today are DUMB — they record, but they don't understand. SENTINEL changes that."

### [0:40 - 2:15] Live Demo (You drive, partner narrates)
**Demo 1 — Tracking (30s):**
Walk across the frame. The gimbal follows you. "SENTINEL is physically tracking me using Gemini Vision and servo control. Watch the dashboard — my bounding box updates in real-time."

**Demo 2 — Perimeter (20s):**
Break the IR beam. LEDs go red. Buzzer fires. Voice says "Perimeter breach detected." Show the agent reasoning chain on the dashboard.

**Demo 3 — Voice Query (20s):**
"SENTINEL, what's the busiest period you've seen today?" Listen to the spoken answer with stats from MongoDB.

**Demo 4 — Dashboard tour (20s):**
Quick tour: live feed with overlays, detection timeline, sensor readings, agent log, stats.

### [2:15 - 2:40] Architecture (You)
"12 hardware components. 4 AI systems. Gemini Vision for real-time detection. Featherless.AI for transparent behavioral analysis using open-weight models. ElevenLabs for voice. MongoDB for memory. The agent runs 12 tools — perception, action, and intelligence — making autonomous decisions about what to watch, what to track, and what to report."

### [2:40 - 3:00] Impact (Partner)
"The global smart surveillance market is $60 billion. Current systems require proprietary hardware and cloud subscriptions. SENTINEL runs on $50 in off-the-shelf parts and open APIs. As a mechanical engineering student, I can tell you — the physical build is simple. The intelligence is what makes it extraordinary. This is autonomous perception, democratized."

### Talking points for each judge category:
- **Hardware judges:** "12+ physical components, 2 microcontrollers, a custom servo gimbal, 3-sensor distance array, IR perimeter system. This is ROBOTICS."
- **ElevenLabs judges:** "Voice is SENTINEL's primary output. It narrates detections, responds to queries, and adapts tone to urgency. It's not a monitoring system with voice — it's a conversational autonomous agent."
- **Featherless judges:** "Autonomous systems need transparent reasoning. When SENTINEL says someone is acting suspiciously, the open-weight reasoning chain shows exactly why. Trust through transparency."
- **Jaseci judges:** "12 tools across 3 categories — perception, action, intelligence. The agent autonomously decides what to look at, when to track, and how to respond. 30 points of autonomy."
- **Gemini judges:** "Gemini is the perception backbone. Every frame analyzed for people, objects, environment, and motion. Plus it orchestrates the agent's tool selection."
- **MongoDB judges:** "Thousands of detection records, tracking sessions, pattern analyses, and event logs. Aggregation pipelines for activity heatmaps and dwell time analysis."

---

## EMERGENCY FALLBACKS

| What Breaks | Fallback | Impact |
|------------|----------|--------|
| Servos won't work | Use fixed camera angle + Gemini Vision still works | Lose the WOW of movement, everything else intact |
| Webcam fails | Use a phone as a webcam (IP camera app) | Slightly awkward but works |
| Arduino dies | Run ultrasonic on RPi GPIO directly (fewer sensors) | Lose some sensors, keep the critical ones |
| RPi can't connect to WiFi | Phone hotspot | Standard fix |
| Gemini Vision too slow | Cache recent analysis, lower frame rate to every 5s | Still functional, slightly less real-time |
| Featherless down | Route all reasoning through Gemini | Lose open-weight narrative |
| ElevenLabs down | Browser SpeechSynthesis | Robotic but functional |
| MongoDB down | In-memory arrays | Lose history queries |
| EVERYTHING hardware fails | Run webcam on laptop + Gemini Vision + dashboard | Pure software demo that still qualifies for 5 tracks |

**The nuclear fallback:** If all hardware dies, plug the webcam directly into your laptop, run the Python script locally with simulated sensor data, and present it as "the perception stack with simulated hardware input." You still have Gemini Vision, the agent, the dashboard, the voice, and everything else. It's less impressive, but still a strong project.

---

## DEVPOST SUBMISSION TEMPLATE

**Title:** SENTINEL — Autonomous AI Perception & Tracking Station

**Tagline:** A robot that sees, thinks, tracks, and speaks. $50 in parts. Infinite intelligence.

**Tracks:** Hardware, ElevenLabs, Featherless.AI, Jaseci Labs, MLH Best Use of Gemini API, MLH Best Use of ElevenLabs, MLH Best Use of MongoDB Atlas

**Description:**
SENTINEL is a fully autonomous perception station that combines physical robotics with AI vision to scan, detect, track, and reason about its environment in real-time. A motorized camera gimbal rotates to physically track targets, an ultrasonic sensor array provides spatial awareness, and IR break beams create a perimeter detection system. The AI stack uses Gemini Vision for real-time object detection, Featherless.AI for transparent behavioral pattern analysis, ElevenLabs for spoken narration, and MongoDB Atlas for temporal data storage and analysis. An autonomous agent with 12 tools across perception, action, and intelligence categories makes real-time decisions about what to observe and how to respond.

**How we built it:**
- Custom 2-axis servo gimbal for camera tracking (pan + tilt)
- Raspberry Pi 4B for vision processing and agent orchestration
- Arduino for servo control and sensor reading (serial bridge)
- 3-sensor ultrasonic array for spatial distance mapping
- IR break beam perimeter detection system
- 20+ LEDs, buzzer, and LCD for physical status feedback
- Next.js real-time command center dashboard with detection overlays
- Google Gemini Vision API for frame-by-frame object detection
- Featherless.AI open-weight LLM for behavioral pattern reasoning
- ElevenLabs for real-time voice narration and query responses
- MongoDB Atlas for detection storage, tracking sessions, and event history

**Built with:** Raspberry Pi, Arduino, Servo Motors, Ultrasonic Sensors, IR Break Beams, Grove Sensors, Logitech Webcam, Next.js, React, Tailwind CSS, Google Gemini API, Featherless.AI, ElevenLabs, MongoDB Atlas, Python, OpenCV, Node.js, Vercel

---

## WHY SENTINEL WINS

1. **Nobody else will have a ROBOT on their table.** Every team has a laptop. You have a machine that moves, sees, and speaks. That's a sensory experience judges don't forget.

2. **Your partner is a MechE.** She can explain the gimbal geometry, servo selection, and sensor placement with genuine engineering credibility. No other team at this hackathon has that combination.

3. **12 hardware components working together.** The hardware track judges will notice that you used more components than every other team combined. And they're not random — they form a cohesive perception system.

4. **The tracking moment is UNFORGETTABLE.** When the camera physically turns to look at the judge, the project sells itself. That one moment is worth more than any slide deck.

5. **Four AI systems with a clear separation of concerns.** Gemini sees. Featherless reasons. ElevenLabs speaks. MongoDB remembers. Jaseci judges will appreciate the clean architecture.

6. **You built a 3D flight engine in C.** The servo angle math, the real-time control loop, the sensor fusion — this is YOUR wheelhouse. You've done harder things than this.

7. **MechE + Full-Stack Coder = The Perfect Hackathon Team for Hardware Track.** This is the team composition the hardware track was designed for.

Go build SENTINEL. Make it move. Make it see. Make it speak. 

Win everything.
