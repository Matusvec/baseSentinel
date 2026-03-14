#!/bin/bash
# ============================================================
# ROCKETHACKS BATTLE STATION — FULL SETUP SCRIPT
# Run this on your Arch Linux machine tonight.
# ============================================================

set -e
echo "🚀 Setting up RocketHacks Battle Station..."

# ============================================================
# 1. FIX GITHUB — Skip the broken MCP plugin, use gh CLI
# ============================================================
# The GitHub MCP plugin has a KNOWN BUG on Linux:
# "Incompatible auth server: does not support dynamic client registration"
# This affects Claude Code on Linux/Arch. The fix: use `gh` CLI instead.
# Claude Code natively knows how to use `gh` for PRs, issues, commits.

#echo "📦 Installing GitHub CLI..."
#sudo pacman -S --needed --noconfirm github-cli

#echo "🔐 Authenticating GitHub CLI..."
#echo "Follow the browser prompts to log in:"
#gh auth login

# Verify it worked
#echo "✅ GitHub auth status:"
#gh auth status

# Install ripgrep (needed for Claude Code search/skills/agents)
#echo "📦 Installing ripgrep..."
#sudo pacman -S --needed --noconfirm ripgrep

# Set env var so Claude Code uses system ripgrep
#echo 'export USE_BUILTIN_RIPGREP=0' >> ~/.bashrc
#echo 'export USE_BUILTIN_RIPGREP=0' >> ~/.zshrc 2>/dev/null || true

# Remove the broken GitHub MCP if you added it
#echo "🧹 Removing broken GitHub MCP (if present)..."
#claude mcp remove github 2>/dev/null || true
#claude mcp remove github-server 2>/dev/null || true

# ============================================================
# 2. ADD WORKING MCP SERVERS
# ============================================================
echo "🔌 Adding MCP servers..."

# Context7 — real-time library documentation
#claude mcp add context7 --scope user -- npx -y @upstash/context7-mcp@latest

# Sequential Thinking — complex problem decomposition
#claude mcp add sequential-thinking --scope user -- npx -y @modelcontextprotocol/server-sequential-thinking

echo "✅ MCP servers configured. Verify with: claude mcp list"

# ============================================================
# 3. GLOBAL CLAUDE.md
# ============================================================
echo "📝 Creating global CLAUDE.md..."
mkdir -p ~/.claude

cat > ~/.claude/CLAUDE.md << 'CLAUDE_EOF'
# System Context

## Machine
- OS: Arch Linux (rolling release)
- Shell: bash/zsh
- Package manager: pacman / yay (AUR)
- Node version manager: fnm
- System ripgrep installed (USE_BUILTIN_RIPGREP=0)

## Developer Profile
- Full-stack developer, comfortable with low-level (C, C++) through high-level (React, Python)
- Experience: shipped iOS apps, full-stack web apps with real users, 3D game engine in C, voice AI assistants, RAG pipelines
- Current focus: hackathon projects, fintech, AI-powered applications
- Preferred workflow: build fast, iterate, ship

## Defaults (use unless project CLAUDE.md overrides)
- Package manager: pnpm (NOT npm)
- Styling: Tailwind CSS
- Frontend: React with hooks, functional components only
- Language: TypeScript when the project supports it, otherwise JavaScript
- Backend: Node.js with ES modules (import/export, NOT require)
- Async: always async/await, never .then() chains
- Database: MongoDB Atlas or Supabase (project-dependent)
- Deployment: Vercel
- Git: conventional commits (feat:, fix:, chore:, docs:)

## Coding Rules
- No class components in React — functional + hooks only
- Always handle errors with try/catch — never let API calls fail silently
- Never hardcode API keys — always use environment variables
- Keep files under 300 lines — split if larger
- Name things clearly — avoid abbreviations except common ones (btn, msg, env, auth)
- Write JSDoc comments for exported functions
- Prefer composition over inheritance

## When Compacting
Always preserve:
- List of all modified files
- Current test/build commands
- API endpoints and their status
- Any error messages being debugged
- The current task and next steps

## Tools Available
- gh CLI: authenticated GitHub — use for PRs, issues, repos (NOT the MCP plugin)
- pnpm: package management
- ripgrep (rg): fast file search
- Context7 MCP: up-to-date library documentation
- Sequential Thinking MCP: complex problem decomposition

## Important
- I'm on Arch Linux. Use pacman for system packages, NOT apt/brew.
- When suggesting terminal commands, use Linux syntax (not macOS).
- My terminal supports true color and Unicode.
- Don't ask for confirmation on routine file edits — just do them.
- If a framework/library isn't in my defaults, that's fine — I learn fast. Don't limit suggestions to only my known stack.
CLAUDE_EOF

echo "✅ Global CLAUDE.md created"

# ============================================================
# 4. SKILLS
# ============================================================
echo "🎯 Creating skills..."
mkdir -p ~/.claude/skills/frontend-design
mkdir -p ~/.claude/skills/backend-api
mkdir -p ~/.claude/skills/voice-integration
mkdir -p ~/.claude/skills/agent-architecture
mkdir -p ~/.claude/skills/rapid-prototype
mkdir -p ~/.claude/skills/demo-polish

# --- SKILL: Frontend Design ---
cat > ~/.claude/skills/frontend-design/SKILL.md << 'SKILL_EOF'
---
name: frontend-design
description: Build beautiful, production-quality frontend interfaces. Use when creating UI components, pages, dashboards, landing pages, or any visual web interface. Triggers on words like "build a page", "create a component", "make a dashboard", "design the UI", "frontend", "beautiful", "polished".
---

# Frontend Design Skill

## Philosophy
Build interfaces that look like a real product, not a hackathon prototype. Every component should feel intentional.

## Design System (Default)
Use these unless the user specifies otherwise:

### Colors
- Background: white (#ffffff) / slate-50 for subtle sections
- Text: slate-900 (primary), slate-500 (secondary), slate-400 (muted)
- Accent: Pick ONE bold color and use it consistently (blue-600, emerald-600, violet-600)
- Cards: white with border border-slate-200 and rounded-xl shadow-sm

### Typography (Tailwind)
- Headings: font-semibold, text-2xl to text-4xl, tracking-tight
- Body: text-base text-slate-600 leading-relaxed
- Labels: text-sm font-medium text-slate-500 uppercase tracking-wider
- Numbers/stats: text-3xl font-bold tabular-nums

### Layout
- Max content width: max-w-6xl mx-auto
- Section padding: py-12 px-6
- Card padding: p-6
- Grid gaps: gap-6 (cards), gap-4 (form elements), gap-2 (inline items)
- Always use CSS Grid or Flexbox — never floats

### Components
- Buttons: rounded-lg px-4 py-2.5 font-medium transition-colors. Primary = bg-accent text-white hover:bg-accent/90. Secondary = border border-slate-300 hover:bg-slate-50
- Inputs: rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-accent/20 focus:border-accent
- Cards: bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow
- Badges: inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium
- Metric cards: bg-slate-50 rounded-xl p-6 — label on top (text-sm text-slate-500), big number below (text-3xl font-bold)

### Animations
- Page transitions: animate-in (fade + slight slide up)
- Hover states: transition-all duration-200
- Loading: skeleton pulse with animate-pulse on bg-slate-200 shapes
- Never use bounce or excessive animations

## Step-by-Step Process
1. **Layout first**: Establish the page structure with semantic HTML (header, main, sections, aside)
2. **Content hierarchy**: Place headings, text, and data. Make sure the visual hierarchy matches importance
3. **Component build**: Build each component with proper Tailwind classes
4. **Responsive**: Mobile-first. Use sm:, md:, lg: breakpoints. Test at 375px and 1280px
5. **Polish**: Add hover states, focus rings, transitions, loading skeletons
6. **Accessibility**: Proper alt text, aria-labels on icon buttons, focus-visible rings, semantic elements

## Anti-Patterns (Never Do)
- Generic gray boxes with no visual hierarchy
- Walls of text without spacing
- Inconsistent border-radius (pick rounded-lg OR rounded-xl and stick with it)
- Using more than 2 accent colors
- Missing hover/focus states on interactive elements
- No responsive design
- Using px instead of Tailwind spacing scale
SKILL_EOF

# --- SKILL: Backend API ---
cat > ~/.claude/skills/backend-api/SKILL.md << 'SKILL_EOF'
---
name: backend-api
description: Build robust backend APIs and server-side logic. Use when creating API routes, server functions, database integrations, authentication, or any backend service. Triggers on "API route", "endpoint", "server", "backend", "database", "CRUD".
---

# Backend API Skill

## Architecture Pattern
Use Next.js API routes (app/api/) for hackathon speed. Each route is a self-contained file.

## API Route Template
```javascript
// app/api/[resource]/route.js
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    // ... logic
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error(`[GET /api/resource]`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    // ... validate, process, store
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error(`[POST /api/resource]`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Rules
1. **Always try/catch** every route handler
2. **Always log errors** with the route path: `console.error(`[METHOD /api/path]`, error)`
3. **Validate input** before processing — check required fields exist
4. **Return consistent shapes**: `{ data }` for success, `{ error: "message" }` for errors
5. **Use proper status codes**: 200 (ok), 201 (created), 400 (bad input), 404 (not found), 500 (server error)
6. **Keep routes thin** — business logic goes in lib/ files, routes just orchestrate
7. **Environment variables** for all secrets — never import from a config file with hardcoded values

## Database Pattern (MongoDB Atlas)
```javascript
// lib/mongodb.js — singleton connection
import { MongoClient } from "mongodb";
let client, db;
export async function getDB() {
  if (!db) {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db(process.env.MONGODB_DB || "app");
  }
  return db;
}
```

## External API Pattern
```javascript
// lib/[service].js
export async function callService(params) {
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Authorization": `Bearer ${process.env.SERVICE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Service error: ${res.status}`);
  return res.json();
}
```
Always wrap external calls in their own lib/ file. Never inline fetch() in route handlers.

## Streaming Responses (for AI/voice)
```javascript
export async function POST(request) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // ... get data chunks
      controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
}
```
SKILL_EOF

# --- SKILL: Voice Integration ---
cat > ~/.claude/skills/voice-integration/SKILL.md << 'SKILL_EOF'
---
name: voice-integration
description: Integrate voice input (speech-to-text) and voice output (text-to-speech) into web apps. Use when adding voice features, ElevenLabs, Web Speech API, or any audio interaction. Triggers on "voice", "speak", "TTS", "speech", "ElevenLabs", "talk", "audio".
---

# Voice Integration Skill

## Architecture: Two-Way Voice Pipeline
```
User speaks → Web Speech API (STT, free) → text
text → AI processing → response text
response text → ElevenLabs API (TTS) → audio → User hears
```

## Speech-to-Text: Web Speech API (Browser Native)
```javascript
// hooks/useSpeechRecognition.js
export function useSpeechRecognition(onResult) {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);

  const start = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported");
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      onResult(text);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stop = () => { recognitionRef.current?.stop(); setIsListening(false); };
  return { start, stop, isListening };
}
```

## Text-to-Speech: ElevenLabs API
```javascript
// lib/elevenlabs.js
export async function speak(text) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID}`, {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: "eleven_turbo_v2", voice_settings: { stability: 0.7, similarity_boost: 0.8 } }),
  });
  const audioBuffer = await res.arrayBuffer();
  const blob = new Blob([audioBuffer], { type: "audio/mpeg" });
  const audio = new Audio(URL.createObjectURL(blob));
  audio.play();
  return audio;
}
```

## UI Pattern: Voice Button Component
```jsx
function VoiceButton({ onTranscript }) {
  const { start, stop, isListening } = useSpeechRecognition(onTranscript);
  return (
    <button onClick={isListening ? stop : start}
      className={`rounded-full p-4 transition-all ${isListening ? "bg-red-500 animate-pulse scale-110" : "bg-blue-600 hover:bg-blue-700"} text-white shadow-lg`}>
      {isListening ? <MicOff size={24} /> : <Mic size={24} />}
    </button>
  );
}
```

## Voice Feedback States
Always show visual feedback during voice interactions:
- **Idle**: Mic icon, static
- **Listening**: Pulsing red circle, "Listening..." text
- **Processing**: Spinner, "Thinking..." text
- **Speaking**: Animated waveform or pulsing speaker icon

## Demo Tips
- Pre-test in the venue — background noise affects STT accuracy
- Have a text input fallback for when voice fails during demo
- Keep spoken responses under 3 sentences — judges lose attention on long audio
- Use a warm, professional ElevenLabs voice (Rachel or similar)
SKILL_EOF

# --- SKILL: Agent Architecture ---
cat > ~/.claude/skills/agent-architecture/SKILL.md << 'SKILL_EOF'
---
name: agent-architecture
description: Build autonomous AI agent systems with tool use, multi-step reasoning, and orchestration. Use when creating agent loops, tool-calling systems, LLM orchestration, or agentic AI. Triggers on "agent", "autonomous", "tool use", "orchestrate", "multi-step", "reasoning chain", "agentic".
---

# Agent Architecture Skill

## Pattern: Orchestrator + Tool Executor

The agent has three layers:
1. **Orchestrator** (Gemini): Receives user input, decides which tools to call and in what order
2. **Tool Executor**: Routes tool calls to actual implementations
3. **Synthesizer**: Combines tool results into a coherent response

## Orchestrator Prompt Template
```
You are an autonomous agent orchestrator.
Given the user's query and available data, decide which tools to invoke.
Chain tools when later steps depend on earlier results.

Available tools:
- tool_name: description
- tool_name: description

Respond with JSON only:
{
  "reasoning": "Why these tools in this order",
  "steps": [
    { "tool": "name", "params": {...}, "depends_on": null },
    { "tool": "name", "params": {...}, "depends_on": 0 }
  ]
}

Rules:
- Use at least 2 tools per query (demonstrates multi-step reasoning)
- Chain dependencies when a step needs results from a previous step
- Include your reasoning for tool selection
```

## Tool Definition Pattern
```javascript
const TOOLS = [
  {
    name: "tool_name",
    description: "What this tool does — be specific",
    handler: async (params, context) => {
      // Implementation
      return { result: data, needsFollowUp: false };
    },
  },
];
```

## Agent Loop
```javascript
async function runAgent(input, tools) {
  // 1. Orchestrate — decide tools
  const plan = await orchestrate(input, tools);

  // 2. Execute — run tools in dependency order
  const results = [];
  for (const step of plan.steps) {
    const context = step.depends_on !== null ? results[step.depends_on] : {};
    const tool = tools.find(t => t.name === step.tool);
    const result = await tool.handler(step.params, context);
    results.push({ tool: step.tool, result });

    // 3. Adaptive — agent can add more steps based on results
    if (result.needsFollowUp) {
      const followUp = await orchestrate(
        `Follow up on: ${JSON.stringify(result)}`, tools
      );
      plan.steps.push(...followUp.steps);
    }
  }

  // 4. Synthesize — combine into final response
  return synthesize(input, results);
}
```

## Jaseci Labs Scoring (30 pts for autonomy)
To score maximum points:
- Agent MUST decide tools autonomously (not hardcoded)
- Agent MUST chain 2+ tools with dependency resolution
- Agent MUST handle follow-up reasoning (adaptive tool calls)
- Agent MUST explain its reasoning chain in the response
- Show the plan/reasoning in the UI so judges can see the autonomy
SKILL_EOF

# --- SKILL: Rapid Prototype ---
cat > ~/.claude/skills/rapid-prototype/SKILL.md << 'SKILL_EOF'
---
name: rapid-prototype
description: Quickly scaffold and build a full working prototype. Use when starting a new project, bootstrapping a hackathon app, or going from zero to working demo fast. Triggers on "scaffold", "bootstrap", "new project", "prototype", "start building", "set up".
---

# Rapid Prototype Skill

## Step 1: Scaffold (5 minutes)
```bash
pnpm create next-app@latest PROJECT_NAME --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
cd PROJECT_NAME
pnpm add mongodb @google/generative-ai recharts lucide-react
```

## Step 2: Environment
Create `.env.local` with all API keys. NEVER commit this file.

## Step 3: Project Structure
```
src/
├── app/
│   ├── layout.tsx        # Root layout with fonts + metadata
│   ├── page.tsx           # Main page
│   ├── globals.css        # Tailwind imports
│   └── api/
│       ├── sensors/route.ts    # Receive data
│       ├── analyze/route.ts    # AI analysis
│       └── speak/route.ts      # TTS endpoint
├── components/
│   ├── Dashboard.tsx      # Main dashboard
│   ├── VoiceButton.tsx    # Voice input
│   ├── SensorGauge.tsx    # Real-time gauge
│   └── RecommendationCard.tsx
├── lib/
│   ├── mongodb.ts         # DB connection
│   ├── elevenlabs.ts      # Voice TTS
│   ├── featherless.ts     # Open-weight LLM
│   ├── agent.ts           # Orchestrator
│   └── gemini.ts          # Multimodal AI
└── hooks/
    ├── useSpeechRecognition.ts
    └── useSensorData.ts
```

## Step 4: Build Order (for hackathons)
1. Get data flowing (API route that receives + stores data) — 30 min
2. Display data (dashboard with live gauges) — 1 hour
3. AI reasoning (agent + LLM integration) — 2 hours
4. Voice (ElevenLabs TTS + Web Speech STT) — 1.5 hours
5. Polish (animations, loading states, error handling) — 1 hour
6. Demo prep (golden path scenarios, fallbacks) — 1 hour

## Speed Tips
- Use `lucide-react` for icons (tree-shakeable, consistent)
- Use `recharts` for charts (React-native, simple API)
- Copy-paste component patterns from the frontend-design skill
- Don't build auth — use a demo mode with hardcoded user
- Don't build a landing page — go straight to the dashboard
- Deploy to Vercel after every major feature (catch deploy bugs early)
SKILL_EOF

# --- SKILL: Demo Polish ---
cat > ~/.claude/skills/demo-polish/SKILL.md << 'SKILL_EOF'
---
name: demo-polish
description: Polish a project for demo and presentation. Use when preparing for a hackathon demo, fixing visual bugs, adding loading states, or making something look production-ready. Triggers on "polish", "demo", "present", "cleanup", "make it look good", "judge", "hackathon submission".
---

# Demo Polish Skill

## Checklist (Run Through Every Item)

### Visual Polish
- [ ] Consistent spacing everywhere (no cramped sections)
- [ ] All text has proper hierarchy (headings > subheadings > body > muted)
- [ ] No orphan text (single words on their own line)
- [ ] Cards have hover states
- [ ] Buttons have hover + active states
- [ ] Focus rings on all interactive elements
- [ ] Loading skeletons for async data (not blank space or spinners)
- [ ] Error states show friendly messages (not raw error text)
- [ ] Empty states ("No data yet" with an icon, not blank)

### Functionality
- [ ] All demo scenarios work end-to-end 5 times in a row
- [ ] Voice input works in noisy room (test with music playing)
- [ ] Voice output is audible (test speaker volume)
- [ ] API fallbacks work (simulate ElevenLabs being slow)
- [ ] Page loads in under 3 seconds
- [ ] No console errors in browser DevTools

### Demo Readiness
- [ ] Browser bookmarked to the app URL
- [ ] Browser in fullscreen/presentation mode (hide bookmarks bar)
- [ ] Font size visible from 6 feet away (increase if needed)
- [ ] Dark mode / light mode — pick one, make sure it's consistent
- [ ] Pre-populate some data so the demo isn't empty when judges arrive

### Devpost Submission
- [ ] Screenshots taken (3-4 key screens)
- [ ] Demo video recorded (1-2 min backup)
- [ ] Description mentions ALL technologies and tracks
- [ ] All team members listed
- [ ] Table number included
SKILL_EOF

echo "✅ All skills created"

# ============================================================
# 5. AGENTS
# ============================================================
echo "🤖 Creating agents..."
mkdir -p ~/.claude/agents

# --- AGENT: Research ---
cat > ~/.claude/agents/research.md << 'AGENT_EOF'
---
name: research
description: Researches a topic by exploring the codebase and documentation
model: sonnet
tools:
  - Read
  - Glob
  - Grep
  - LS
  - Bash(rg:*)
  - Bash(cat:*)
  - Bash(find:*)
allowedTools:
  - Read
  - Glob
  - Grep
  - LS
  - Bash
---

You are a research agent. When given a topic:

1. Search the codebase for relevant files using Glob and Grep
2. Read and analyze those files thoroughly
3. Check documentation files (README, CLAUDE.md, docs/) for context
4. Summarize your findings with:
   - Specific file paths and line numbers
   - How the pieces connect
   - Any potential issues or gaps you noticed
5. Suggest concrete next steps

Be thorough but concise. Reference specific code, don't just describe it abstractly.
AGENT_EOF

# --- AGENT: Implement ---
cat > ~/.claude/agents/implement.md << 'AGENT_EOF'
---
name: implement
description: Implements a feature from start to finish with proper structure
model: sonnet
---

You are an implementation agent. When given a feature to build:

1. **Plan**: Identify all files that need to change. List them.
2. **Dependencies**: Check if any new packages are needed. Install them.
3. **Build**: Implement the feature file by file, starting with:
   - lib/ utilities first (data layer)
   - API routes second (server layer)
   - Components third (UI layer)
   - Page integration last (wiring)
4. **Verify**: After implementation, read back the key files to confirm they're correct.
5. **Test**: Run `pnpm build` to catch TypeScript/import errors.

Rules:
- Follow the project's CLAUDE.md coding conventions
- Use existing lib/ patterns — don't reinvent the wheel
- Handle all error cases with try/catch
- Add JSDoc comments to exported functions
- Keep each file under 200 lines
AGENT_EOF

# --- AGENT: Debug ---
cat > ~/.claude/agents/debug.md << 'AGENT_EOF'
---
name: debug
description: Debugs issues systematically by reading errors, tracing code, and fixing root causes
model: sonnet
---

You are a debugging agent. When given a bug or error:

1. **Reproduce**: Understand the exact error message and where it occurs
2. **Trace**: Follow the code path from the error backwards:
   - Read the file with the error
   - Find where the problematic value comes from
   - Check the function that produces it
   - Check the API route or data source feeding it
3. **Root cause**: Identify the ACTUAL problem (not just the symptom)
4. **Fix**: Make the minimal change that fixes the root cause
5. **Verify**: Check for similar patterns elsewhere that might have the same bug
6. **Explain**: Tell me what was wrong and why the fix works (1-2 sentences)

Rules:
- Fix the ROOT CAUSE, not the symptom
- Prefer minimal changes over rewrites
- Never suppress errors with try/catch unless you handle them properly
- If the bug is in a dependency, say so and suggest a workaround
AGENT_EOF

# --- AGENT: Review ---
cat > ~/.claude/agents/review.md << 'AGENT_EOF'
---
name: review
description: Reviews code changes for quality, bugs, and best practices
model: sonnet
tools:
  - Read
  - Glob
  - Grep
  - Bash(git:*)
---

You are a code review agent. When invoked:

1. Run `git diff --stat` to see what files changed
2. Run `git diff` to see the actual changes
3. For each changed file, check:
   - **Bugs**: Logic errors, off-by-one, null checks, race conditions
   - **Security**: Exposed secrets, SQL injection, XSS, unsanitized input
   - **Performance**: N+1 queries, unnecessary re-renders, memory leaks
   - **Style**: Matches project conventions from CLAUDE.md
   - **Missing**: Error handling, edge cases, loading states
4. Provide feedback as:
   - 🔴 Must fix (bugs, security)
   - 🟡 Should fix (performance, style)
   - 🟢 Nice to have (minor improvements)
5. If everything looks good, say so! Don't invent problems.
AGENT_EOF

echo "✅ All agents created"

# ============================================================
# 6. VERIFY EVERYTHING
# ============================================================
echo ""
echo "============================================"
echo "✅ SETUP COMPLETE — Verification:"
echo "============================================"
echo ""
echo "GitHub CLI:"
gh auth status 2>&1 | head -3
echo ""
echo "MCP Servers:"
claude mcp list 2>&1 || echo "(Run 'claude mcp list' inside Claude Code to verify)"
echo ""
echo "Skills created:"
ls -1 ~/.claude/skills/
echo ""
echo "Agents created:"
ls -1 ~/.claude/agents/
echo ""
echo "CLAUDE.md:"
wc -l ~/.claude/CLAUDE.md
echo ""
echo "============================================"
echo "🎯 NEXT STEPS:"
echo "  1. Run 'claude' and type /usage to check your limits"
echo "  2. Run /mcp to verify MCP servers connected"
echo "  3. Test a skill: ask Claude to 'build a dashboard component'"
echo "  4. Test an agent: type /research or /implement"
echo "  5. Go to sleep. You're ready."
echo "============================================"
