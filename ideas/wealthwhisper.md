# WEALTHWHISPER — Voice-First Autonomous Financial Research Agent
## RocketHacks Strategy Document

---

## ELEVATOR PITCH (Memorize This)

> "Individual investors are drowning in information but starving for insight. There are 10,000 financial newsletters, 500 stock screeners, and endless CNBC talking heads — but no one telling YOU what matters for YOUR portfolio. WealthWhisper is a voice-first financial research agent. You talk to it like a personal analyst: 'What should I know about my tech holdings this week?' It autonomously researches markets, analyzes filings, cross-references your portfolio, and speaks back a personalized research brief. Open-weight AI means your financial strategy never touches a black-box system you can't audit."

---

## THE CONCEPT IN DETAIL

WealthWhisper is a web application where users manage a portfolio and interact with an autonomous financial research agent through voice. The agent doesn't just answer questions — it proactively researches, identifies risks and opportunities, and delivers spoken briefings.

**Core user flow:**
1. User adds their portfolio holdings (stocks, ETFs, amounts)
2. User asks a question by voice: "How are my semiconductor stocks doing?" or "Should I be worried about the Fed meeting?"
3. The agent autonomously:
   - Identifies which holdings are relevant
   - Searches for recent news, earnings, and filings
   - Analyzes financial documents with Gemini vision (earnings charts, SEC filings)
   - Reasons about the implications using Featherless (open-weight, auditable)
   - Synthesizes a personalized research brief
   - Speaks the brief via ElevenLabs
4. Everything is stored in MongoDB for portfolio history and research continuity

**The demo moment that wins:** Judge says "Ask it something." You say: "Hey WealthWhisper, I'm thinking about adding more NVIDIA. What should I know?" The agent responds in a professional voice with a 30-second brief covering recent earnings, analyst sentiment, supply chain risks, and valuation relative to your existing portfolio weighting. The judge's jaw drops because it sounds like a real analyst.

---

## TRACK QUALIFICATION MAP (7 Prize Pools)

### 1. MAIN TRACK: FINANCE (Prize: Roku 24in Smart TV)

**Why it qualifies:** WealthWhisper rethinks how individual investors access financial research. It democratizes the kind of personalized analysis that hedge funds pay millions for — making it accessible through natural voice interaction.

**Pitch angle for finance judges:**
- "Goldman Sachs pays $500k/year for a junior analyst to do what WealthWhisper does in 30 seconds"
- "Financial literacy isn't a knowledge problem — it's an accessibility problem. Voice makes investing approachable for everyone, including people intimidated by Bloomberg terminals"
- "Open-weight AI means full transparency. Every investment insight comes with a reasoning chain you can audit. No black-box recommendations."

**Your partner's role:** She's going into IB. This is her moment. She explains why current retail investor tools fail, the market opportunity, and validates the financial reasoning with real domain knowledge. When judges push back on financial accuracy, she handles it.

---

### 2. SPONSOR TRACK: ELEVENLABS (Prize: 6-month Scale Plan, $330/mo per member)

**Requirement:** Meaningful TTS/voice integration, central to the product, live demo.

**How WealthWhisper qualifies:**
- Voice is the PRIMARY interface — WealthWhisper is designed for people who want financial insights while commuting, exercising, or cooking. They don't want to read a research report; they want to HEAR a briefing.
- **Morning briefing mode:** "Good morning. Here's your daily portfolio briefing. Your holdings are up 0.7% overall. Three things to watch today: First, NVIDIA reports earnings after the bell — you hold 15 shares worth approximately $1,800, representing 12% of your portfolio. Analysts expect revenue of $38 billion. Second..."
- **Conversational research:** The voice interaction feels like talking to a financial advisor, not querying a database
- **Tone adaptation:** Urgent news gets a more direct delivery; routine briefings are calm and measured

**Implementation:**
```javascript
// ElevenLabs integration with financial tone adaptation
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // "Sarah" — professional, articulate

async function speakBriefing(text, context = 'routine') {
  const voiceSettings = {
    routine: { stability: 0.8, similarity_boost: 0.75, style: 0.15 },     // Calm, measured
    alert: { stability: 0.6, similarity_boost: 0.8, style: 0.35 },        // More urgent
    opportunity: { stability: 0.7, similarity_boost: 0.8, style: 0.25 },  // Upbeat
  };

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
        model_id: 'eleven_turbo_v2',
        voice_settings: voiceSettings[context] || voiceSettings.routine,
      }),
    }
  );
  return response;
}

// Stream audio to frontend with chunked transfer
async function streamAudioToClient(res, elevenLabsStream) {
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Transfer-Encoding', 'chunked');
  
  const reader = elevenLabsStream.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(value);
  }
  res.end();
}
```

---

### 3. SPONSOR TRACK: FEATHERLESS.AI (Prize: $300 / $150 / $75 Scale Plan)

**Requirement:** Open-weight LLM via Featherless API, core to logic, deliberate model choice.

**How WealthWhisper qualifies:**
- **The trust narrative:** "Your investment strategy is private. With closed APIs, your portfolio details and financial questions flow through systems you can't audit. WealthWhisper uses open-weight models through Featherless.AI — your financial reasoning happens on transparent, auditable infrastructure."
- **Regulatory angle:** "As AI-assisted investing grows, regulators will require explainability. Open-weight models provide the reasoning transparency that future compliance demands."
- Featherless handles the **core financial analysis pipeline:**
  - Portfolio risk assessment
  - Earnings analysis and sentiment extraction
  - Cross-referencing news with portfolio holdings
  - Generating actionable research briefs

**Model choice justification:**
"We chose Llama 3.1 70B through Featherless.AI because: (1) Financial advice requires maximum transparency — investors need to see the reasoning chain, not just the conclusion. (2) Open-weight models can be fine-tuned for financial domain knowledge without vendor lock-in. (3) Featherless.AI's infrastructure handles the compute, letting us focus on financial logic rather than GPU management."

**Implementation:**
```javascript
// Featherless.AI financial analysis pipeline
async function analyzeFinancialQuery(query, portfolio, marketData, newsContext) {
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
          content: `You are a senior financial research analyst. You provide personalized, data-driven investment research.

RULES:
- Never give direct buy/sell recommendations. Instead, present relevant information and analysis.
- Always quantify: percentages, dollar amounts, ratios.
- Flag risks prominently.
- Reference specific data points from the provided context.
- Be concise — this will be spoken aloud, so aim for 30-60 seconds of speech (100-200 words).
- Include a disclaimer that this is AI-generated analysis, not financial advice.

Respond in JSON format:
{
  "analysis_type": "portfolio_review|stock_research|risk_alert|market_brief|earnings_analysis",
  "key_findings": [{"finding": "...", "impact": "positive|negative|neutral", "confidence": 0-1}],
  "portfolio_relevance": {"affected_holdings": ["TICKER"], "portfolio_impact_pct": N},
  "risk_factors": [{"risk": "...", "severity": "low|medium|high"}],
  "spoken_brief": "Natural language brief suitable for TTS (100-200 words)",
  "context": "routine|alert|opportunity",
  "sources_referenced": ["..."],
  "disclaimer": "This is AI-generated analysis for informational purposes only. Not financial advice."
}`
        },
        {
          role: 'user',
          content: `User query: "${query}"

User portfolio:
${JSON.stringify(portfolio, null, 2)}

Recent market data:
${JSON.stringify(marketData, null, 2)}

Recent relevant news:
${JSON.stringify(newsContext, null, 2)}`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content.replace(/```json|```/g, '').trim());
}
```

---

### 4. SPONSOR TRACK: JASECI LABS (Prize: 1-Year GPT Pro Subscription per member)

**Requirement:** Sophisticated agentic AI — autonomous decision-making, multi-step reasoning, tool use. 30 points for autonomy.

**How WealthWhisper qualifies:**

**Agent Tool Kit:**
```javascript
const agentTools = {
  search_market_news: {
    description: 'Search for recent financial news about a company or market topic',
    execute: async (params) => await searchFinancialNews(params.query),
  },
  get_stock_data: {
    description: 'Get current and historical stock price data',
    execute: async (params) => await getStockData(params.ticker, params.period),
  },
  analyze_document: {
    description: 'Analyze a financial document or chart image using Gemini vision',
    execute: async (params) => await geminiAnalyzeDocument(params.imageOrText),
  },
  query_portfolio: {
    description: 'Get user portfolio holdings, allocation, and performance',
    execute: async (params) => await getPortfolioFromMongoDB(params.userId),
  },
  calculate_risk: {
    description: 'Calculate portfolio risk metrics (concentration, sector exposure, beta)',
    execute: async (params) => await calculateRiskMetrics(params.portfolio),
  },
  financial_reasoning: {
    description: 'Deep financial analysis using open-weight LLM via Featherless.AI',
    execute: async (params) => await featherlessAnalysis(params),
  },
  speak_briefing: {
    description: 'Deliver a spoken briefing to the user via ElevenLabs',
    execute: async (params) => await speakBriefing(params.text, params.context),
  },
  compare_stocks: {
    description: 'Compare multiple stocks on key financial metrics',
    execute: async (params) => await compareStocks(params.tickers),
  },
};
```

**Autonomous Multi-Step Example:**
User asks: "Should I be worried about my tech holdings?"

The agent autonomously:
1. `query_portfolio` → Finds user holds AAPL, NVDA, MSFT, GOOGL (48% of portfolio)
2. `get_stock_data` → Pulls recent performance for all four
3. `search_market_news` → Searches for tech sector news, Fed policy, regulation
4. `calculate_risk` → Determines portfolio is overweight tech by 2x vs S&P 500
5. `financial_reasoning` → Featherless analyzes all data, generates findings
6. `speak_briefing` → ElevenLabs delivers the personalized brief

**Agent also triggers PROACTIVE alerts:**
- Portfolio concentration exceeds threshold → automatic risk alert
- Earnings date approaching for a major holding → preemptive briefing
- Major market event affecting sector → immediate notification

```javascript
// Proactive monitoring loop (runs on schedule)
async function proactiveMonitor(userId) {
  const portfolio = await getPortfolioFromMongoDB(userId);
  
  // Check for upcoming earnings
  for (const holding of portfolio.holdings) {
    const earnings = await checkEarningsDate(holding.ticker);
    if (earnings.daysUntil <= 3 && !earnings.briefingSent) {
      await runAgentLoop({
        trigger: 'upcoming_earnings',
        ticker: holding.ticker,
        userId,
        context: `${holding.ticker} reports earnings in ${earnings.daysUntil} days`,
      });
    }
  }
  
  // Check for concentration risk
  const risk = await calculateRiskMetrics(portfolio);
  if (risk.maxSectorWeight > 0.4) {
    await runAgentLoop({
      trigger: 'concentration_alert',
      userId,
      context: `Portfolio is ${Math.round(risk.maxSectorWeight * 100)}% concentrated in ${risk.maxSector}`,
    });
  }
}
```

---

### 5. MLH: BEST USE OF GOOGLE GEMINI API (Prize: Google Swag Kits)

**How WealthWhisper qualifies:**
- **Agent orchestrator** — Gemini plans which tools to call and in what order
- **Vision: Financial document analysis** — Upload earnings slides, annual reports, stock charts. Gemini reads them, extracts key numbers, identifies trends
- **Vision: Receipt/statement parsing** — Take a photo of a brokerage statement, Gemini extracts holdings for auto-portfolio setup
- **Multi-turn research** — Gemini maintains context across a research session ("Now compare that to AMD")

```javascript
// Gemini vision: analyze an earnings chart/slide
async function analyzeEarningsSlide(imageBase64) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
            { text: `Analyze this financial document or chart. Extract:
1. Key financial metrics (revenue, earnings, margins, growth rates)
2. Trends visible in any charts or graphs
3. Notable callouts, guidance, or forward-looking statements
4. Any red flags or concerns
5. How this compares to market expectations (if context is visible)

Respond in JSON format:
{
  "document_type": "earnings_slide|annual_report|stock_chart|financial_statement|other",
  "key_metrics": [{"metric": "...", "value": "...", "trend": "up|down|flat"}],
  "notable_findings": ["..."],
  "red_flags": ["..."],
  "summary": "2-3 sentence overview"
}` }
          ]
        }],
        generationConfig: { temperature: 0.2 },
      }),
    }
  );
  return response.json();
}
```

---

### 6. MLH: BEST USE OF ELEVENLABS (Prize: Wireless Earbuds)
- Same integration as sponsor track — auto-qualifies

---

### 7. MLH: BEST USE OF MONGODB ATLAS (Prize: M5Stack IoT Kit)

**Schema Design:**
```javascript
// portfolios collection
{
  _id: ObjectId,
  user_id: "demo_user",
  name: "My Portfolio",
  created: ISODate,
  holdings: [
    {
      ticker: "NVDA",
      shares: 15,
      avg_cost: 120.50,
      added_date: ISODate,
      sector: "Technology",
      industry: "Semiconductors"
    },
    {
      ticker: "AAPL",
      shares: 25,
      avg_cost: 175.00,
      added_date: ISODate,
      sector: "Technology",
      industry: "Consumer Electronics"
    }
  ],
  total_invested: 50000,
  risk_profile: "moderate"
}

// research_sessions collection
{
  _id: ObjectId,
  user_id: "demo_user",
  timestamp: ISODate,
  query: "Should I be worried about my tech holdings?",
  agent_plan: {
    tools_used: ["query_portfolio", "get_stock_data", "search_market_news", "calculate_risk", "financial_reasoning"],
    reasoning: "User asking about sector risk — need portfolio, prices, news, and risk analysis"
  },
  analysis: {
    type: "risk_alert",
    key_findings: [...],
    portfolio_relevance: { affected_holdings: ["AAPL", "NVDA", "MSFT", "GOOGL"], portfolio_impact_pct: 48 },
    risk_factors: [...],
    spoken_brief: "...",
    context: "alert"
  },
  audio_generated: true,
  audio_duration_seconds: 35
}

// market_data_cache collection
{
  _id: ObjectId,
  ticker: "NVDA",
  fetched_at: ISODate,
  price: 875.50,
  change_pct: 2.3,
  market_cap: "2.1T",
  pe_ratio: 65.2,
  earnings_date: ISODate,
  sector: "Technology",
  ttl: ISODate  // Auto-expire after 15 min
}

// Aggregation: Portfolio performance over time
const performanceHistory = await db.collection('portfolio_snapshots').aggregate([
  { $match: { user_id: 'demo_user' } },
  { $group: {
    _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
    total_value: { $last: '$total_value' },
    day_change_pct: { $last: '$day_change_pct' },
  }},
  { $sort: { _id: 1 } },
  { $limit: 30 }
]).toArray();
```

---

## COMPLETE TECH STACK

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js + React + Tailwind CSS | Your strongest stack |
| **Charts** | Recharts | Portfolio charts, stock price history |
| **Voice Input** | Web Speech API (browser native) | Free, zero setup |
| **Voice Output** | ElevenLabs API | Sponsor track, sounds professional |
| **Agent Orchestrator** | Gemini 2.0 Flash | Fast planning, multimodal |
| **Financial Reasoning** | Featherless.AI (Llama 3.1 70B) | Open-weight, privacy, sponsor track |
| **Document Analysis** | Gemini Vision | Earnings slides, charts, statements |
| **Stock Data** | Yahoo Finance API (yfinance) or Alpha Vantage (free) | Real market data |
| **News** | Gemini with web search grounding OR NewsAPI | Recent financial news |
| **Database** | MongoDB Atlas | Portfolio, research history, MLH track |
| **Deployment** | Vercel | Your comfort zone |

---

## DATA SOURCES FOR FINANCIAL DATA

**Free stock data options (no paid API needed for a hackathon):**

```javascript
// Option 1: Yahoo Finance via unofficial API (most reliable for hackathons)
async function getStockQuote(ticker) {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1mo`
  );
  const data = await response.json();
  const result = data.chart.result[0];
  const meta = result.meta;
  return {
    ticker,
    price: meta.regularMarketPrice,
    previousClose: meta.chartPreviousClose,
    change: meta.regularMarketPrice - meta.chartPreviousClose,
    changePct: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose * 100).toFixed(2),
    marketCap: meta.marketCap,
    currency: meta.currency,
    history: result.indicators.quote[0].close.map((close, i) => ({
      date: new Date(result.timestamp[i] * 1000).toISOString().split('T')[0],
      close: close ? parseFloat(close.toFixed(2)) : null,
    })).filter(d => d.close !== null),
  };
}

// Option 2: Alpha Vantage (free tier: 25 requests/day)
async function getStockDataAlphaVantage(ticker) {
  const response = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${process.env.ALPHA_VANTAGE_KEY}`
  );
  return response.json();
}

// Option 3: For the demo, pre-load realistic data into MongoDB
// This is the SAFEST option — no API rate limits during judging
async function seedDemoData(db) {
  const demoStocks = [
    { ticker: 'NVDA', price: 875.50, change_pct: 2.3, pe: 65.2, market_cap: '2.1T', sector: 'Technology' },
    { ticker: 'AAPL', price: 228.30, change_pct: -0.4, pe: 32.1, market_cap: '3.5T', sector: 'Technology' },
    { ticker: 'MSFT', price: 445.20, change_pct: 0.8, pe: 37.5, market_cap: '3.3T', sector: 'Technology' },
    { ticker: 'JPM', price: 198.40, change_pct: 1.1, pe: 12.3, market_cap: '570B', sector: 'Financials' },
    { ticker: 'JNJ', price: 162.80, change_pct: -0.2, pe: 18.7, market_cap: '392B', sector: 'Healthcare' },
  ];
  
  for (const stock of demoStocks) {
    await db.collection('market_data_cache').updateOne(
      { ticker: stock.ticker },
      { $set: { ...stock, fetched_at: new Date() } },
      { upsert: true }
    );
  }
}
```

---

## FRONTEND ARCHITECTURE

### Key Pages & Components

```
src/
├── app/
│   ├── page.jsx                    # Main dashboard: portfolio + voice interaction
│   ├── api/
│   │   ├── agent/research/route.js # Agent orchestration
│   │   ├── portfolio/route.js      # CRUD portfolio holdings
│   │   ├── speak/route.js          # ElevenLabs TTS proxy
│   │   ├── stock/[ticker]/route.js # Stock data lookup
│   │   └── vision/route.js         # Gemini document analysis
│   └── layout.jsx
├── components/
│   ├── VoiceInterface.jsx          # Mic button + waveform + transcript
│   ├── PortfolioOverview.jsx       # Holdings table with live prices
│   ├── PortfolioChart.jsx          # Allocation pie chart + performance line chart
│   ├── ResearchBrief.jsx           # Latest AI analysis card with key findings
│   ├── AgentReasoningLog.jsx       # Show the agent's tool chain for transparency
│   ├── StockCard.jsx               # Individual stock detail card
│   ├── AddHoldingModal.jsx         # Form to add a new holding
│   ├── DocumentUpload.jsx          # Upload earnings slides for Gemini analysis
│   └── AudioPlayer.jsx             # Play briefing audio with scrubbing
```

### Voice Interface Component:
```jsx
'use client';
import { useState, useRef, useEffect } from 'react';

export default function VoiceInterface({ onQueryResult }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const current = event.results[event.results.length - 1];
        setTranscript(current[0].transcript);
        if (current.isFinal) {
          handleQuery(current[0].transcript);
        }
      };

      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleQuery = async (query) => {
    setIsProcessing(true);
    try {
      // Call the agent
      const res = await fetch('/api/agent/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, userId: 'demo_user' }),
      });
      const data = await res.json();
      onQueryResult?.(data);

      // Play the spoken brief
      if (data.analysis?.spoken_brief) {
        const audioRes = await fetch('/api/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: data.analysis.spoken_brief,
            context: data.analysis.context || 'routine',
          }),
        });
        const audioBlob = await audioRes.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          setIsPlaying(true);
          audioRef.current.onended = () => setIsPlaying(false);
        }
      }
    } catch (error) {
      console.error('Agent error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Mic button with pulsing animation */}
      <button
        onClick={toggleListening}
        disabled={isProcessing}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all
          ${isListening 
            ? 'bg-red-500 animate-pulse scale-110' 
            : isProcessing 
              ? 'bg-yellow-500 animate-spin'
              : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
          }`}
      >
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      </button>
      
      {/* Status text */}
      <p className="text-sm text-gray-500 h-6">
        {isListening ? 'Listening...' : isProcessing ? 'Researching...' : isPlaying ? 'Speaking...' : 'Tap to ask'}
      </p>
      
      {/* Transcript */}
      {transcript && (
        <p className="text-center text-gray-700 max-w-md italic">"{transcript}"</p>
      )}
      
      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  );
}
```

---

## 24-HOUR EXECUTION TIMELINE

### FRIDAY NIGHT (TONIGHT — Pre-Hackathon Prep)

**7:00 - 8:00 PM — Account Setup (1 hour)**
- [ ] ElevenLabs account + API key + test voice
- [ ] Featherless.AI account + API key + promo code + test completion
- [ ] MongoDB Atlas account + free cluster + connection string
- [ ] Gemini API key (you have this)
- [ ] Alpha Vantage API key (free) or prepare Yahoo Finance scraping
- [ ] Test ALL APIs with curl (see GreenPulse doc for curl examples)

**8:00 - 9:30 PM — Scaffold + Seed Data (1.5 hours)**
```bash
npx create-next-app@latest wealthwhisper --typescript --tailwind --app --src-dir
cd wealthwhisper
npm install mongodb recharts
```
- [ ] Set up `.env.local` with all API keys
- [ ] Create project folder structure
- [ ] Set up MongoDB connection utility
- [ ] **Seed demo portfolio data** — this is critical. Pre-load a realistic portfolio into MongoDB so you never waste time during the hackathon setting up test data:

```javascript
// scripts/seed.js — run this TONIGHT
const { MongoClient } = require('mongodb');

async function seed() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('wealthwhisper');
  
  // Demo portfolio
  await db.collection('portfolios').insertOne({
    user_id: 'demo_user',
    name: 'Demo Portfolio',
    holdings: [
      { ticker: 'NVDA', shares: 15, avg_cost: 120.50, sector: 'Technology' },
      { ticker: 'AAPL', shares: 25, avg_cost: 175.00, sector: 'Technology' },
      { ticker: 'MSFT', shares: 10, avg_cost: 380.00, sector: 'Technology' },
      { ticker: 'GOOGL', shares: 8, avg_cost: 140.00, sector: 'Technology' },
      { ticker: 'JPM', shares: 20, avg_cost: 155.00, sector: 'Financials' },
      { ticker: 'JNJ', shares: 15, avg_cost: 158.00, sector: 'Healthcare' },
      { ticker: 'XOM', shares: 30, avg_cost: 105.00, sector: 'Energy' },
    ],
    created: new Date(),
  });
  
  // Pre-cache market data (so demo works even if APIs are slow)
  const marketData = [
    { ticker: 'NVDA', price: 875.50, change_pct: 2.3, pe: 65.2, market_cap: '2.1T' },
    { ticker: 'AAPL', price: 228.30, change_pct: -0.4, pe: 32.1, market_cap: '3.5T' },
    { ticker: 'MSFT', price: 445.20, change_pct: 0.8, pe: 37.5, market_cap: '3.3T' },
    { ticker: 'GOOGL', price: 178.90, change_pct: 1.2, pe: 25.4, market_cap: '2.2T' },
    { ticker: 'JPM', price: 198.40, change_pct: 1.1, pe: 12.3, market_cap: '570B' },
    { ticker: 'JNJ', price: 162.80, change_pct: -0.2, pe: 18.7, market_cap: '392B' },
    { ticker: 'XOM', price: 112.50, change_pct: -0.8, pe: 13.5, market_cap: '475B' },
  ];
  
  for (const stock of marketData) {
    await db.collection('market_data_cache').insertOne({
      ...stock,
      fetched_at: new Date(),
    });
  }
  
  console.log('Demo data seeded successfully');
  await client.close();
}

seed();
```

**9:30 - 10:30 PM — Basic Frontend (1 hour)**
- [ ] Create the main dashboard layout
- [ ] Build the portfolio overview component with seeded data
- [ ] Set up the voice interface component (mic button + Web Speech API)
- [ ] Verify speech recognition works in your browser

**10:30 PM — STOP. Sleep.**

---

### SATURDAY, MARCH 14

**8:30 AM** — Check in
**9:00 - 10:00 AM** — Opening ceremony
**10:00 - 11:00 AM** — Team setup, partner starts pitch deck

**11:00 AM — HACKING STARTS**

**11:00 AM - 1:00 PM — Agent Architecture (2 hours) — CRITICAL**
- Build Gemini orchestrator (tool planning)
- Build all tool functions (stock data, portfolio query, risk calculation)
- Build Featherless financial reasoning pipeline
- Wire the agent loop end-to-end
- Test: "How are my tech stocks doing?" → agent plans → tools execute → Featherless reasons → JSON result
- Partner: Pitch deck — problem slide, market size, competitive landscape

**12:30 - 1:30 PM — Lunch**

**1:30 - 3:30 PM — Voice + Audio Integration (2 hours)**
- ElevenLabs TTS integration
- Audio streaming to frontend
- Voice input → agent → voice output full loop
- Add the audio player component with scrubbing
- Partner: Business model slide, demo script writing

**3:30 - 5:30 PM — Dashboard Polish + Gemini Vision (2 hours)**
- Portfolio allocation pie chart
- Performance line chart
- Research brief display cards
- Agent reasoning log (show the thinking chain)
- Gemini vision: upload earnings slides → extract data
- Partner: Practice pitch, prepare judge Q&A answers

**5:30 - 7:30 PM — Demo Scenarios (2 hours)**
Build and test 3 golden paths:
1. Voice: "How are my tech holdings?" → full research brief spoken aloud
2. Voice: "I'm thinking about adding more NVIDIA" → analysis with portfolio context
3. Upload earnings chart → Gemini extracts data → agent incorporates into analysis

**7:30 - 9:00 PM — Dinner**

**9:00 PM - 12:00 AM — Polish + Edge Cases (3 hours)**
- Add proactive alerts (portfolio concentration warning)
- Improve error handling and loading states
- Make the UI look professional — dark theme option, smooth animations
- Add the "morning briefing" demo mode
- Partner: Finalize slides, create physical notecard for judging

**12:00 AM - 3:00 AM — Final polish, deploy to Vercel**

**3:00 - 6:00 AM — Sleep or grind (your call)**

### SUNDAY, MARCH 15
**9:00 AM** — Breakfast
**10:00 - 11:00 AM** — Final testing + Devpost submission
**12:00 - 1:30 PM** — JUDGING

---

## PITCH STRATEGY (3 MINUTES)

### [0:00 - 0:25] The Problem (Partner)
"There are 60 million retail investors in the US. The average one spends 3 hours a week reading financial news and still makes emotional decisions. Professional analysts have Bloomberg terminals, research teams, and AI tools. Retail investors have Reddit and CNBC. That gap is why 80% of active retail investors underperform the S&P 500."

### [0:25 - 0:50] The Solution (Partner introduces, you take over)
"WealthWhisper gives every investor a personal research analyst they can simply talk to. No screens to navigate, no reports to read. Ask a question, get a personalized, data-driven brief spoken in plain English. Let me show you."

### [0:50 - 2:10] Live Demo (You drive, partner adds color)
- Show the portfolio dashboard: "This is a demo portfolio — 7 holdings across tech, financials, healthcare, and energy."
- Press the mic: "How should I think about my tech concentration?"
- Show the agent reasoning chain appearing in real-time
- Let ElevenLabs speak the brief — judges HEAR the answer
- Optional: Upload an earnings slide, show Gemini extracting data

### [2:10 - 2:40] Architecture (You)
"Under the hood: Gemini orchestrates — it decides what to research. Featherless.AI runs the financial analysis on an open-weight model — your portfolio strategy never touches a black box. ElevenLabs delivers the brief. MongoDB stores everything. The agent runs 6 autonomous research steps in under 10 seconds."

### [2:40 - 3:00] Business + Impact (Partner closes)
"The robo-advisor market is $2.8 trillion. WealthWhisper isn't a robo-advisor — it's a robo-analyst. It doesn't manage your money; it makes you smarter about it. With open-weight AI, it's the first financial research tool that's fully transparent. And my background in investment banking tells me: this is the tool I wish existed when I was learning markets."

### Key phrases for different judges:
- **Finance judges:** "Democratizing institutional-grade research for retail investors"
- **ElevenLabs judges:** "Voice isn't a feature — it's the interface. Financial briefings you can listen to while commuting"
- **Featherless judges:** "Your financial strategy is private. Open-weight means auditable, transparent analysis"
- **Jaseci judges:** "6-step autonomous research pipeline — tool selection, multi-step reasoning, proactive alerts"
- **Gemini judges:** "Multimodal: reads earnings slides, analyzes charts, orchestrates the research flow"
- **MongoDB judges:** "Portfolio persistence, research history, market data caching, aggregation pipelines for performance tracking"

---

## EMERGENCY FALLBACKS

| What Breaks | Fallback | Impact |
|------------|----------|--------|
| Stock data API rate limited | Use pre-seeded MongoDB cache | Demo works perfectly — judges won't know |
| ElevenLabs down | Browser SpeechSynthesis | Robotic but functional |
| Featherless down | Route through Gemini | Lose privacy narrative |
| MongoDB down | In-memory portfolio object | Lose persistence, demo still works |
| Voice input fails (noisy room) | Text input box below mic | Most hackathon demos have mic issues |
| Partner's pitch goes long | Cut architecture section to 15 seconds | Demo is more important than tech explanation |

---

## DEVPOST SUBMISSION TEMPLATE

**Title:** WealthWhisper — Your Personal AI Financial Research Analyst

**Tagline:** Talk to your portfolio. Get institutional-grade research in seconds.

**Tracks:** Finance, ElevenLabs, Featherless.AI, Jaseci Labs, MLH Best Use of Gemini, MLH Best Use of ElevenLabs, MLH Best Use of MongoDB Atlas

**Built with:** Next.js, React, Tailwind CSS, Google Gemini API, Featherless.AI, ElevenLabs, MongoDB Atlas, Web Speech API, Yahoo Finance API, Vercel
