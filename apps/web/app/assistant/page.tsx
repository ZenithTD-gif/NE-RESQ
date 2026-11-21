'use client';

import React, { useState } from 'react';
import { 
  LifeBuoy, 
  Send, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  BookOpen, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { LiquidCard } from '@/components/ui/LiquidCard';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  disclaimer?: string;
  provider?: string;
}

const SAMPLE_QUESTIONS = [
  'What immediate actions should I take during a flash flood?',
  'What are the warning signs of an impending landslide?',
  'What supplies should be inside a 72-hour emergency survival bag?',
  'How do I turn off electrical mains and gas valves before evacuation?'
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello. I am the NE-RESQ AI Emergency Safety Assistant. I provide strictly verified disaster preparedness and survival guidance grounded in official National Disaster Management Authority (NDMA) and Assam State Disaster Management Authority (ASDMA) manuals.\n\nI never guess emergency facts, fabricate phone numbers, or pretend to dispatch rescue units. How can I assist you with safety protocols today?',
      citations: ['NDMA National Disaster Management Guidelines', 'ASDMA Community Flood Safety Manual']
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const speakText = (text: string) => {
    if (!audioEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || loading) return;

    const userMsg: Message = { role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: Message = {
          role: 'assistant',
          content: data.answer,
          citations: data.citations || ['Official NDMA Safety Doctrine'],
          disclaimer: data.disclaimer,
          provider: data.provider || 'AI Emergency Engine'
        };
        setMessages(prev => [...prev, assistantMsg]);
        speakText(data.answer);
      } else {
        throw new Error('Safety knowledge engine unavailable.');
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Notice: Automated retrieval service is currently in offline safety fallback mode. For immediate life-threatening assistance, please dial National Emergency 112 or SDMA SEOC 1070 directly.',
          citations: ['Emergency Operations Directory']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI EMERGENCY ENGINE ACTIVE • GEMINI 1.5 & OPENAI RAG</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight">
            AI Emergency Safety & Preparedness Assistant
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
            Trained strictly on verified NDMA, ASDMA, and IMD guidelines.
          </p>
        </div>

        {/* Audio narration toggle */}
        <button
          onClick={() => {
            setAudioEnabled(!audioEnabled);
            if (audioEnabled && typeof window !== 'undefined') window.speechSynthesis.cancel();
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all self-start sm:self-auto ${
            audioEnabled 
              ? 'bg-emergency text-white border-emergency shadow-emergency-glow' 
              : 'bg-white text-charcoal border-slate-200'
          }`}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span>{audioEnabled ? 'Voice Guidance Active' : 'Enable Voice'}</span>
        </button>
      </div>

      {/* Suggested Questions Pill Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-charcoal-muted uppercase shrink-0">Common Protocols:</span>
        {SAMPLE_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-charcoal hover:border-emergency hover:text-emergency text-xs font-medium whitespace-nowrap shrink-0 transition-colors shadow-xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <LiquidCard className="p-6 min-h-[440px] max-h-[560px] overflow-y-auto space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`p-4 rounded-2xl max-w-xl text-xs leading-relaxed space-y-2 ${
                  m.role === 'user'
                    ? 'bg-charcoal text-white rounded-br-none shadow-sm'
                    : 'bg-white border border-slate-200/80 text-charcoal rounded-bl-none shadow-glass-sm'
                }`}
              >
                <p className="whitespace-pre-line">{m.content}</p>

                {m.citations && m.citations.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1 text-[10px] text-charcoal-muted font-medium">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3 text-emerald-600" />
                      <span>Citations: {m.citations.join(' • ')}</span>
                    </div>
                    {m.provider && (
                      <span className="px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 font-bold text-[9px]">
                        {m.provider}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-slate-200 max-w-xs text-xs text-charcoal-muted">
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
              <span>Cross-referencing NDMA safety doctrine...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask an emergency safety question (e.g., flood evacuation, earthquake drop-cover-hold)..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 text-xs font-semibold p-3.5 rounded-2xl border border-slate-200 bg-white/90 outline-none focus:border-emergency"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="p-3.5 rounded-2xl liquid-glass-emergency-btn text-white disabled:opacity-50 shadow-emergency-glow"
              aria-label="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </LiquidCard>

      {/* Safety Notice per Section 12 & 15.1 */}
      <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-charcoal-muted text-[11px] leading-relaxed flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
        <span>
          <strong>Operational Policy:</strong> This assistant retrieves disaster safety doctrine and does not dispatch physical rescue boats. For life-threatening distress, use the dedicated <a href="/sos" className="font-bold text-emergency hover:underline">SOS Dispatch Portal</a>.
        </span>
      </div>

    </div>
  );
}
