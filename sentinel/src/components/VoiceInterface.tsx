'use client';

import { useEffect, useRef, useState } from 'react';

interface TranscriptEntry {
  id: number;
  role: 'user' | 'sentinel';
  text: string;
  timestamp: string;
}

// Web Speech API types (not in all TS libs)
interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

let entryCounter = 0;

/** Creates a timestamped transcript entry. */
function makeEntry(role: 'user' | 'sentinel', text: string): TranscriptEntry {
  return {
    id: ++entryCounter,
    role,
    text,
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
  };
}

/**
 * Sends a query to the SENTINEL speak API, plays the returned audio, and
 * returns the response text.
 */
async function querySpeak(userQuery: string): Promise<string> {
  const res = await fetch('/api/sentinel/speak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: userQuery }),
  });

  if (!res.ok) throw new Error(`API error ${res.status}`);

  const data = await res.json();

  if (data.audio_base64) {
    const audio = new Audio(`data:audio/mp3;base64,${data.audio_base64}`);
    audio.play();
  }

  return data.text ?? 'No response received.';
}

/**
 * Voice + text interface for querying SENTINEL.
 * Supports Web Speech API for STT input and plays back audio responses.
 */
export default function VoiceInterface() {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [typedQuery, setTypedQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when transcript updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const addEntry = (role: 'user' | 'sentinel', text: string) => {
    setTranscript((prev) => [...prev, makeEntry(role, text)]);
  };

  const handleQuery = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;

    addEntry('user', trimmed);
    setTypedQuery('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await querySpeak(trimmed);
      addEntry('sentinel', response);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      addEntry('sentinel', `[ERROR] ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) {
      setError('SpeechRecognition is not supported in this browser.');
      return;
    }

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => {
      setIsListening(false);
      setError(`Mic error: ${e.error}`);
    };
    recognition.onresult = (e) => {
      const spoken = e.results[0][0].transcript;
      handleQuery(spoken);
    };

    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleQuery(typedQuery);
  };

  return (
    <div className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase">
          SENTINEL Interface
        </h2>
        {isLoading && (
          <span className="flex items-center gap-1.5 text-xs font-mono text-green-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            Processing
          </span>
        )}
      </div>

      {/* Transcript scroll area */}
      <div
        ref={scrollRef}
        className="flex flex-col gap-3 overflow-y-auto p-4 font-mono text-sm min-h-[220px] max-h-[340px]"
      >
        {transcript.length === 0 && (
          <p className="text-zinc-600 text-xs italic text-center mt-8">
            Speak or type to query SENTINEL...
          </p>
        )}

        {transcript.map((entry) => (
          <div
            key={entry.id}
            className={`flex flex-col gap-0.5 ${
              entry.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <span className="text-[10px] tracking-widest text-zinc-600">
              {entry.role === 'user' ? 'YOU' : 'SENTINEL'} · {entry.timestamp}
            </span>
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                entry.role === 'user'
                  ? 'bg-zinc-800 text-zinc-200 rounded-tr-none'
                  : 'bg-zinc-900 border border-green-900/60 text-green-300 rounded-tl-none'
              }`}
            >
              {entry.text}
            </div>
          </div>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mb-2 rounded border border-red-800 bg-red-950/50 px-3 py-1.5 text-xs font-mono text-red-400">
          {error}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-center gap-2 border-t border-zinc-800 px-4 py-3">
        {/* Mic button */}
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isLoading}
          className={`
            relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-200
            ${isListening
              ? 'border-red-500 bg-red-900/30 text-red-400'
              : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'}
            disabled:opacity-40 disabled:cursor-not-allowed
          `}
          title={isListening ? 'Stop listening' : 'Talk to SENTINEL'}
        >
          {/* Pulse ring when listening */}
          {isListening && (
            <span className="absolute inset-0 rounded-full border border-red-500 animate-ping opacity-60" />
          )}
          {/* Mic icon (SVG) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-6 11a6 6 0 0 0 12 0h2a8 8 0 0 1-7 7.938V22h-2v-2.062A8 8 0 0 1 4 12H6z" />
          </svg>
        </button>

        {/* Text input */}
        <input
          type="text"
          value={typedQuery}
          onChange={(e) => setTypedQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a query..."
          disabled={isLoading || isListening}
          className="
            flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2
            text-xs font-mono text-zinc-200 placeholder-zinc-600
            focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-900
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-colors duration-150
          "
        />

        {/* Send button */}
        <button
          onClick={() => handleQuery(typedQuery)}
          disabled={isLoading || isListening || !typedQuery.trim()}
          className="
            flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border
            border-zinc-700 bg-zinc-900 text-zinc-400
            hover:border-green-700 hover:text-green-400
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-150
          "
          title="Send"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 rotate-90"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
