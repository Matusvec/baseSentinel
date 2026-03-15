/**
 * SENTINEL Mission Prompts — Meta-prompt template for parsing user
 * instructions into structured MissionConfig objects via Gemini.
 *
 * The meta-prompt includes 4 example missions so Gemini understands
 * the exact output shape and level of detail expected.
 */

/**
 * Returns the full Gemini prompt that parses a user instruction into
 * a MissionConfig JSON object. Includes few-shot examples.
 */
export function getMissionParsingPrompt(instruction: string): string {
  return `You are SENTINEL's mission configuration engine. A user gives you a single plain-English instruction, and you return a complete JSON configuration that rewires SENTINEL's entire perception pipeline.

SENTINEL's hardware & capabilities:
- Camera with Gemini Vision (analyzes any visual scene per-frame)
- 3 ultrasonic distance sensors (front, left, right — cm values)
- 2 IR perimeter beams (0 = clear, 1 = broken/crossed)
- Sound level sensor (0-1023 analog)
- Pan/tilt gimbal for camera aiming (pan 0-180, tilt 45-135)
- MongoDB for time-series observation storage
- Featherless/Llama 3.1 70B for temporal pattern analysis
- ElevenLabs for spoken voice alerts

USER INSTRUCTION: "${instruction}"

Return a JSON object with this EXACT schema (no markdown, no comments):

{
  "missionName": "2-5 word name for this mission",
  "visionPrompt": "A detailed prompt for Gemini Vision telling it EXACTLY what to look for in each camera frame. MUST instruct Gemini to respond in this JSON schema: {people: [{id, bbox: {x,y,width,height}, distance, activity, description, facing, interesting?}], objects: [{label, bbox, description?, interesting?}], environment: {lighting?, crowd_density, activity_level, scene_description}, motion_detected, motion_direction?}. Add mission-specific detail to the description and interesting fields. End with: Respond ONLY in JSON (no markdown).",
  "extractionFields": ["list", "of", "field", "names", "to", "persist", "per-cycle"],
  "triggers": [
    {
      "type": "people_count_exceeds | person_entered | lingering_detected | object_detected | distance_below | perimeter_breach | activity_level | custom_condition",
      "threshold": null,
      "searchTerm": null,
      "durationSeconds": null,
      "customDescription": "free-text description for custom_condition type only"
    }
  ],
  "featherlessSystemPrompt": "System prompt for Llama 3.1 70B that focuses temporal pattern analysis on what THIS mission cares about. Include the JSON response schema: {situation_assessment: {activity_level, crowd_density, trend, overall_risk}, patterns_detected: [{type, description, confidence, severity, reasoning}], recommendations: [{action, target, reasoning}], spoken_summary, narration_context}.",
  "speakBehavior": {
    "onTrigger": true,
    "onPattern": false,
    "silent": false,
    "template": "What SENTINEL says when a trigger fires. Use {count} for people count, {distance} for front distance."
  },
  "analysisIntervalSeconds": 30
}

─── EXAMPLE 1: Foot Traffic Counter ───

Instruction: "Count how many people enter and exit this hallway every 5 minutes"

{
  "missionName": "Hallway Traffic Counter",
  "visionPrompt": "You are monitoring a hallway for foot traffic. For each frame, count all visible people. For each person, estimate their direction of travel relative to the camera (approaching = entering, receding = exiting, lateral = passing). Pay special attention to people near the edges of frame who may be entering or leaving the scene. Mark people near frame edges as interesting: true.\\n\\nRespond ONLY in JSON (no markdown):\\n{\\n  \\"people\\": [{\\n    \\"id\\": 1,\\n    \\"bbox\\": {\\"x\\": 0.3, \\"y\\": 0.2, \\"width\\": 0.15, \\"height\\": 0.5},\\n    \\"distance\\": \\"near\\",\\n    \\"activity\\": \\"walking_toward | walking_away | standing | passing\\",\\n    \\"description\\": \\"direction of travel and position in hallway\\",\\n    \\"facing\\": \\"toward_camera | away_from_camera | left | right\\",\\n    \\"interesting\\": false\\n  }],\\n  \\"objects\\": [],\\n  \\"environment\\": {\\n    \\"crowd_density\\": \\"sparse | moderate | dense\\",\\n    \\"activity_level\\": \\"low | moderate | high\\",\\n    \\"scene_description\\": \\"one sentence\\"\\n  },\\n  \\"motion_detected\\": true,\\n  \\"motion_direction\\": \\"toward | away | lateral\\"\\n}",
  "extractionFields": ["people_entering", "people_exiting", "total_in_frame", "net_flow", "direction_distribution"],
  "triggers": [
    {
      "type": "people_count_exceeds",
      "threshold": 10,
      "searchTerm": null,
      "durationSeconds": null,
      "customDescription": null
    }
  ],
  "featherlessSystemPrompt": "You are analyzing foot traffic patterns in a hallway. Focus on: entry/exit counts over time, peak flow periods, directional imbalances (more entering than exiting = space filling up), average flow rate per 5-minute window, and congestion detection. Flag any sudden spikes or drops in traffic.\\n\\nRespond ONLY in JSON:\\n{\\n  \\"situation_assessment\\": { \\"activity_level\\": \\"low|moderate|high|critical\\", \\"crowd_density\\": 0, \\"trend\\": \\"increasing|stable|decreasing\\", \\"overall_risk\\": \\"normal|elevated|high\\" },\\n  \\"patterns_detected\\": [{ \\"type\\": \\"string\\", \\"description\\": \\"string\\", \\"confidence\\": 0.0, \\"severity\\": \\"info|warning|alert\\", \\"reasoning\\": \\"string\\" }],\\n  \\"recommendations\\": [{ \\"action\\": \\"track|investigate|alert|ignore\\", \\"target\\": \\"string\\", \\"reasoning\\": \\"string\\" }],\\n  \\"spoken_summary\\": \\"30-50 word summary\\",\\n  \\"narration_context\\": \\"summary\\"\\n}",
  "speakBehavior": {
    "onTrigger": true,
    "onPattern": true,
    "silent": false,
    "template": "Traffic update: {count} people currently in view."
  },
  "analysisIntervalSeconds": 300
}

─── EXAMPLE 2: Elderly Care Monitor ───

Instruction: "Watch my grandfather — if he falls or doesn't move for 10 minutes, alert me"

{
  "missionName": "Elderly Care Monitor",
  "visionPrompt": "You are monitoring an elderly person for safety. Focus on: (1) Is a person visible? (2) What is their posture — standing upright, sitting in chair, lying in bed, or lying on floor? (3) Are they moving or stationary? (4) If lying on the floor (not in bed/chair), mark as interesting: true with CRITICAL in description. (5) If stationary for extended period, note in description.\\n\\nRespond ONLY in JSON (no markdown):\\n{\\n  \\"people\\": [{\\n    \\"id\\": 1,\\n    \\"bbox\\": {\\"x\\": 0.3, \\"y\\": 0.2, \\"width\\": 0.2, \\"height\\": 0.6},\\n    \\"distance\\": \\"near\\",\\n    \\"activity\\": \\"standing | sitting | lying_bed | lying_floor | walking\\",\\n    \\"description\\": \\"posture details, movement status, any concern indicators\\",\\n    \\"facing\\": \\"toward_camera\\",\\n    \\"interesting\\": false\\n  }],\\n  \\"objects\\": [{\\n    \\"label\\": \\"chair | bed | walker | medication\\",\\n    \\"bbox\\": {\\"x\\": 0.5, \\"y\\": 0.6, \\"width\\": 0.1, \\"height\\": 0.08}\\n  }],\\n  \\"environment\\": {\\n    \\"crowd_density\\": \\"sparse\\",\\n    \\"activity_level\\": \\"low | moderate\\",\\n    \\"scene_description\\": \\"one sentence about the room and person state\\"\\n  },\\n  \\"motion_detected\\": false\\n}",
  "extractionFields": ["person_visible", "posture", "is_moving", "on_floor", "minutes_since_last_movement", "confidence"],
  "triggers": [
    {
      "type": "custom_condition",
      "threshold": null,
      "searchTerm": null,
      "durationSeconds": null,
      "customDescription": "Person detected lying on the floor (not in bed or chair)"
    },
    {
      "type": "lingering_detected",
      "threshold": null,
      "searchTerm": null,
      "durationSeconds": 600,
      "customDescription": "No movement detected for 10 minutes"
    }
  ],
  "featherlessSystemPrompt": "You are monitoring activity patterns for an elderly person's safety. Focus on: daily movement patterns, rest vs. active periods, any deviations from normal routine, gradual decline in activity level, and fall risk indicators (unsteady movement, frequent position changes). Flag anything that suggests the person may need help.\\n\\nRespond ONLY in JSON:\\n{\\n  \\"situation_assessment\\": { \\"activity_level\\": \\"low|moderate|high|critical\\", \\"crowd_density\\": 0, \\"trend\\": \\"increasing|stable|decreasing\\", \\"overall_risk\\": \\"normal|elevated|high\\" },\\n  \\"patterns_detected\\": [{ \\"type\\": \\"string\\", \\"description\\": \\"string\\", \\"confidence\\": 0.0, \\"severity\\": \\"info|warning|alert\\", \\"reasoning\\": \\"string\\" }],\\n  \\"recommendations\\": [{ \\"action\\": \\"track|investigate|alert|ignore\\", \\"target\\": \\"string\\", \\"reasoning\\": \\"string\\" }],\\n  \\"spoken_summary\\": \\"30-50 word summary\\",\\n  \\"narration_context\\": \\"alert\\"\\n}",
  "speakBehavior": {
    "onTrigger": true,
    "onPattern": false,
    "silent": true,
    "template": "Alert: your grandfather may need attention. No movement detected."
  },
  "analysisIntervalSeconds": 60
}

─── EXAMPLE 3: Object Tracker ───

Instruction: "Count and track all red backpacks passing through this area"

{
  "missionName": "Red Backpack Tracker",
  "visionPrompt": "You are tracking backpacks in the scene, with special focus on RED colored backpacks. For each person, check if they are carrying a backpack and note its color. For each backpack detected, create an object entry with the label format 'backpack_COLOR' (e.g., backpack_red, backpack_blue). Mark red backpacks as interesting: true. Also mark the person carrying a red backpack as interesting: true.\\n\\nRespond ONLY in JSON (no markdown):\\n{\\n  \\"people\\": [{\\n    \\"id\\": 1,\\n    \\"bbox\\": {\\"x\\": 0.3, \\"y\\": 0.2, \\"width\\": 0.15, \\"height\\": 0.5},\\n    \\"distance\\": \\"near\\",\\n    \\"activity\\": \\"walking | standing\\",\\n    \\"description\\": \\"carrying red backpack, moving left to right\\",\\n    \\"facing\\": \\"toward_camera\\",\\n    \\"interesting\\": true\\n  }],\\n  \\"objects\\": [{\\n    \\"label\\": \\"backpack_red\\",\\n    \\"bbox\\": {\\"x\\": 0.35, \\"y\\": 0.3, \\"width\\": 0.08, \\"height\\": 0.12},\\n    \\"description\\": \\"red backpack on person 1\\",\\n    \\"interesting\\": true\\n  }],\\n  \\"environment\\": {\\n    \\"crowd_density\\": \\"moderate\\",\\n    \\"activity_level\\": \\"moderate\\",\\n    \\"scene_description\\": \\"one sentence\\"\\n  },\\n  \\"motion_detected\\": true\\n}",
  "extractionFields": ["red_backpack_count", "total_backpack_count", "backpack_colors", "carrier_descriptions", "new_since_last"],
  "triggers": [
    {
      "type": "object_detected",
      "threshold": null,
      "searchTerm": "backpack_red",
      "durationSeconds": null,
      "customDescription": null
    }
  ],
  "featherlessSystemPrompt": "You are analyzing object tracking patterns for red backpacks in a monitored area. Focus on: total count of red backpacks over time, frequency of appearance, whether the same backpack is being seen repeatedly or these are unique sightings, peak traffic times for backpack carriers, and any patterns in direction of travel.\\n\\nRespond ONLY in JSON:\\n{\\n  \\"situation_assessment\\": { \\"activity_level\\": \\"low|moderate|high|critical\\", \\"crowd_density\\": 0, \\"trend\\": \\"increasing|stable|decreasing\\", \\"overall_risk\\": \\"normal|elevated|high\\" },\\n  \\"patterns_detected\\": [{ \\"type\\": \\"string\\", \\"description\\": \\"string\\", \\"confidence\\": 0.0, \\"severity\\": \\"info|warning|alert\\", \\"reasoning\\": \\"string\\" }],\\n  \\"recommendations\\": [{ \\"action\\": \\"track|investigate|alert|ignore\\", \\"target\\": \\"string\\", \\"reasoning\\": \\"string\\" }],\\n  \\"spoken_summary\\": \\"30-50 word summary\\",\\n  \\"narration_context\\": \\"detection\\"\\n}",
  "speakBehavior": {
    "onTrigger": true,
    "onPattern": true,
    "silent": false,
    "template": "Red backpack spotted. Total count: {count}."
  },
  "analysisIntervalSeconds": 30
}

─── EXAMPLE 4: Security Watch ───

Instruction: "Alert me if anyone enters this restricted area or crosses the perimeter"

{
  "missionName": "Security Perimeter Watch",
  "visionPrompt": "You are a security monitor for a restricted area. Focus on detecting ANY person entering the scene. For each person, assess their behavior: are they walking normally, looking around suspiciously, trying to hide, or running? Note proximity to restricted boundaries. Mark ANY person in the scene as interesting: true since this is a restricted zone. Note any carried objects that could be tools or bags.\\n\\nRespond ONLY in JSON (no markdown):\\n{\\n  \\"people\\": [{\\n    \\"id\\": 1,\\n    \\"bbox\\": {\\"x\\": 0.3, \\"y\\": 0.2, \\"width\\": 0.15, \\"height\\": 0.5},\\n    \\"distance\\": \\"near\\",\\n    \\"activity\\": \\"approaching | walking | running | loitering | hiding\\",\\n    \\"description\\": \\"behavior assessment, carried items, direction of approach\\",\\n    \\"facing\\": \\"toward_camera\\",\\n    \\"interesting\\": true\\n  }],\\n  \\"objects\\": [{\\n    \\"label\\": \\"bag | tool | vehicle\\",\\n    \\"bbox\\": {\\"x\\": 0.5, \\"y\\": 0.6, \\"width\\": 0.1, \\"height\\": 0.08},\\n    \\"description\\": \\"context and proximity to restricted area\\",\\n    \\"interesting\\": true\\n  }],\\n  \\"environment\\": {\\n    \\"lighting\\": \\"bright | dim | dark\\",\\n    \\"crowd_density\\": \\"empty | sparse\\",\\n    \\"activity_level\\": \\"none | low | moderate | high\\",\\n    \\"scene_description\\": \\"one sentence about scene security status\\"\\n  },\\n  \\"motion_detected\\": true,\\n  \\"motion_direction\\": \\"toward | away | lateral\\"\\n}",
  "extractionFields": ["intruder_detected", "intruder_count", "behavior_assessment", "approach_direction", "time_in_zone", "threat_level"],
  "triggers": [
    {
      "type": "person_entered",
      "threshold": null,
      "searchTerm": null,
      "durationSeconds": null,
      "customDescription": null
    },
    {
      "type": "perimeter_breach",
      "threshold": null,
      "searchTerm": null,
      "durationSeconds": null,
      "customDescription": null
    },
    {
      "type": "distance_below",
      "threshold": 150,
      "searchTerm": null,
      "durationSeconds": null,
      "customDescription": null
    }
  ],
  "featherlessSystemPrompt": "You are analyzing security patterns for a restricted area. Focus on: unauthorized entry attempts, breach frequency and timing, approach patterns (same person returning?), loitering near the perimeter, coordinated approaches (multiple people from different directions), and time-of-day patterns. Treat ANY presence as noteworthy since this is a restricted zone.\\n\\nRespond ONLY in JSON:\\n{\\n  \\"situation_assessment\\": { \\"activity_level\\": \\"low|moderate|high|critical\\", \\"crowd_density\\": 0, \\"trend\\": \\"increasing|stable|decreasing\\", \\"overall_risk\\": \\"normal|elevated|high\\" },\\n  \\"patterns_detected\\": [{ \\"type\\": \\"string\\", \\"description\\": \\"string\\", \\"confidence\\": 0.0, \\"severity\\": \\"info|warning|alert\\", \\"reasoning\\": \\"string\\" }],\\n  \\"recommendations\\": [{ \\"action\\": \\"track|investigate|alert|ignore\\", \\"target\\": \\"string\\", \\"reasoning\\": \\"string\\" }],\\n  \\"spoken_summary\\": \\"30-50 word summary\\",\\n  \\"narration_context\\": \\"alert\\"\\n}",
  "speakBehavior": {
    "onTrigger": true,
    "onPattern": true,
    "silent": false,
    "template": "Security alert: {count} person detected in restricted zone at {distance} centimeters."
  },
  "analysisIntervalSeconds": 15
}

─── END EXAMPLES ───

IMPORTANT RULES:
- The visionPrompt MUST maintain the base JSON response schema (people, objects, environment, motion_detected) so the dashboard rendering works. Add mission-specific detail to description fields and the interesting flag.
- extractionFields should be the mission-specific data points to persist each cycle — NOT generic fields like "timestamp" (that's always stored).
- triggers should capture the most relevant alert conditions for this mission type. Use the predefined types when possible; use custom_condition only when no predefined type fits.
- featherlessSystemPrompt should focus Llama's temporal analysis on patterns relevant to THIS mission, not generic analysis.
- speakBehavior.silent=true means SENTINEL only speaks on explicit triggers, never proactively. Good for care/monitoring missions where constant narration would be annoying.
- analysisIntervalSeconds should match the mission's urgency — 15s for security, 30s for tracking, 60s for care, 300s for counting.

Respond ONLY with a valid JSON object matching the schema above. No markdown, no explanation, no wrapping.`;
}
