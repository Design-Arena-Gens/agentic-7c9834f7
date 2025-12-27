'use client';

import { useMemo, useState } from 'react';
import type { AgentResponse, Channel, Message } from '@/types/conversation';

const channels: { id: Channel; label: string; description: string }[] = [
  { id: 'whatsapp', label: 'WhatsApp', description: 'রিয়েল-টাইম কমার্স চ্যাট' },
  { id: 'facebook', label: 'Facebook', description: 'পেজ ইনবক্স ম্যাসেজ' },
  { id: 'instagram', label: 'Instagram', description: 'DM অটোমেশন' },
];

const quickPrompts = [
  { label: 'মূল্য জানতে চাই', text: 'হ্যালো, এই পণ্যের দাম কত?' },
  {
    label: 'Discount Query',
    text: 'Can I get a discount if I order two pieces?',
  },
  {
    label: 'ডেলিভারি তথ্য',
    text: 'ডেলিভারি করতে কতদিন লাগবে আর ক্যাশ অন ডেলিভারি আছে তো?',
  },
  {
    label: 'অর্ডার কনফার্ম',
    text: 'আচ্ছা, আমি অর্ডার করতে চাই, কীভাবে কনফার্ম করব?',
  },
];

type HistoryState = Record<Channel, Message[]>;

interface SheetData {
  response: AgentResponse | null;
  channel: Channel | null;
}

const formatTime = (timestamp: string) =>
  new Intl.DateTimeFormat('bn-BD', { timeStyle: 'short' }).format(
    new Date(timestamp),
  );

export default function Home() {
  const [selectedChannel, setSelectedChannel] = useState<Channel>('whatsapp');
  const [input, setInput] = useState('');
  const [customerName, setCustomerName] = useState('রিমন');
  const [history, setHistory] = useState<HistoryState>({
    whatsapp: [],
    facebook: [],
    instagram: [],
  });
  const [sheet, setSheet] = useState<SheetData>({ response: null, channel: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentHistory = history[selectedChannel];

  const recentInsight = useMemo(() => {
    const record = history[selectedChannel];
    const agentMessage = [...record].reverse().find((msg) => msg.type === 'agent');
    if (!agentMessage || !sheet.response) return null;
    return {
      cta: agentMessage.cta,
      sentiment: sheet.response.sentiment,
      strategy: sheet.response.strategyNotes,
      confidence: sheet.response.confidence,
    };
  }, [history, selectedChannel, sheet.response]);

  async function handleSend() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const payload = {
        channel: selectedChannel,
        message: input.trim(),
        customerName,
        preferredLanguage: /[\u0980-\u09FF]/.test(input) ? 'bn' : 'en',
        history: currentHistory,
        context: {
          customerName,
        },
      };

      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Agent service unavailable');

      const data = (await res.json()) as AgentResponse & { history: Message[] };

      setHistory((prev) => ({
        ...prev,
        [selectedChannel]: data.history,
      }));

      setSheet({ response: data, channel: selectedChannel });
      setInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-16 font-sans text-slate-100">
      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-300">
              Aura Omnichannel Agent
            </p>
            <h1 className="text-3xl font-semibold sm:text-4xl">
              স্বয়ংক্রিয় কনভার্সন ফানেল এজেন্ট
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              WhatsApp, Facebook এবং Instagram এর ইনবক্স এক জায়গায় এনে গ্রাহকের
              প্রশ্ন বিশ্লেষণ করে CTA প্রস্তুত করে।
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-200 shadow-lg shadow-indigo-500/10">
            <p className="font-semibold text-slate-100">Conversion Scoreboard</p>
            <p className="text-emerald-300">Smart CTA Automation • 94% match</p>
            <p className="text-xs text-slate-400">Live Agent Intelligence</p>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-8 grid max-w-6xl gap-6 px-6 lg:grid-cols-[1.65fr_1fr]">
        <section className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl shadow-indigo-500/5">
          <div className="flex flex-wrap gap-3">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel.id)}
                className={`flex min-w-[9rem] flex-1 items-start gap-3 rounded-2xl border px-4 py-4 text-left transition ${
                  selectedChannel === channel.id
                    ? 'border-indigo-500/70 bg-indigo-500/20 shadow-lg shadow-indigo-500/40'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <span
                  className={`mt-1 h-2.5 w-2.5 rounded-full ${
                    selectedChannel === channel.id ? 'bg-emerald-400' : 'bg-slate-500'
                  }`}
                />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-slate-100">
                    {channel.label}
                  </p>
                  <p className="text-xs text-slate-400">{channel.description}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/80">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {customerName} •{' '}
                  {channels.find((item) => item.id === selectedChannel)?.label}
                </p>
                <p className="text-xs text-slate-500">
                  Omni context ধরে রেখে কথোপকথন চালিত হয়।
                </p>
              </div>
              <select
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 shadow-inner focus:border-indigo-400 focus:outline-none"
              >
                <option value="রিমন">রিমন</option>
                <option value="মেহজাবিন">মেহজাবিন</option>
                <option value="Sadia">Sadia</option>
              </select>
            </div>

            <div className="space-y-3 px-6 py-6">
              {currentHistory.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-slate-500">
                  প্রথম কাস্টমার ম্যাসেজ লিখুন অথবা নিচের স্যাম্পল ব্যবহার করুন।
                </div>
              )}
              {currentHistory.map((message) => (
                <article
                  key={message.id}
                  className={`flex flex-col gap-2 rounded-2xl border px-5 py-4 ${
                    message.type === 'agent'
                      ? 'border-indigo-500/40 bg-indigo-500/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <header className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-200">
                      {message.author.name}
                    </span>
                    <span>{formatTime(message.timestamp)}</span>
                  </header>
                  <p className="text-sm leading-relaxed text-slate-100">{message.text}</p>
                  {message.cta && (
                    <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200">
                      <p className="font-medium uppercase tracking-wide text-emerald-200">
                        CTA • {message.cta.label}
                      </p>
                      <p className="mt-1 text-emerald-100">{message.cta.summary}</p>
                      <p className="mt-2 text-[11px] uppercase text-emerald-300">
                        Urgency: {message.cta.urgency.toUpperCase()} • {message.cta.url}
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <div className="border-t border-white/5 bg-slate-950/90 px-6 py-5">
              <div className="flex flex-wrap items-center gap-2 pb-3 text-xs text-slate-400">
                <span className="rounded-full border border-white/10 px-3 py-1">
                  🔍 ইনটেন্ট ডিটেকশন
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1">
                  🎯 CTA Automation
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1">
                  🤖 কথোপকথন বুদ্ধিমত্তা
                </span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="এখানে গ্রাহকের প্রশ্ন টাইপ করুন..."
                  className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  rows={3}
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="shrink-0 rounded-2xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-500/40"
                >
                  {loading ? 'প্রসেসিং...' : 'এজেন্ট রিপ্লাই নিন'}
                </button>
              </div>
              {error && (
                <p className="mt-3 text-xs text-rose-300">সমস্যা হয়েছে: {error}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span className="text-slate-500">Quick Intents:</span>
            {quickPrompts.map((prompt) => (
              <button
                key={prompt.label}
                onClick={() => setInput(prompt.text)}
                className="rounded-full border border-white/10 px-4 py-2 transition hover:border-indigo-400 hover:text-white"
              >
                {prompt.label}
              </button>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-indigo-500/5">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
              Intelligence Layer
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              কনভার্সন স্ট্রাটেজি ও অন্তর্দৃষ্টি
            </h2>

            {recentInsight ? (
              <div className="mt-6 space-y-4 text-sm text-slate-200">
                <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-4">
                  <p className="text-xs uppercase tracking-widest text-indigo-200">
                    Strategy Notes
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-indigo-100">
                    {recentInsight.strategy}
                  </p>
                </div>

                {recentInsight.cta && (
                  <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                    <p className="text-xs uppercase tracking-widest text-emerald-200">
                      Recommended CTA
                    </p>
                    <p className="mt-2 text-lg font-semibold text-emerald-100">
                      {recentInsight.cta.label}
                    </p>
                    <p className="text-xs uppercase text-emerald-200">
                      Urgency: {recentInsight.cta.urgency.toUpperCase()}
                    </p>
                    <p className="mt-2 text-sm text-emerald-100">
                      {recentInsight.cta.summary}
                    </p>
                    <p className="mt-3 text-[11px] text-emerald-200">
                      Destination: {recentInsight.cta.url}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">
                      Sentiment
                    </p>
                    <p className="mt-1 text-lg font-semibold capitalize text-white">
                      {recentInsight.sentiment}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">
                      Confidence
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {(recentInsight.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-slate-400">
                কথোপকথন শুরু হলে এজেন্টের বুদ্ধিমত্তার সারসংক্ষেপ এখানে দেখা যাবে।
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-indigo-500/5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Conversion Labs
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">অটোমেশন প্লেবুক</h3>
            <div className="mt-4 space-y-4 text-xs text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-slate-100">⚙️ Cross-channel Sync</p>
                <p className="mt-2">
                  WhatsApp, Facebook, Instagram ইনবক্সকে এক ড্যাশবোর্ডে এনে গ্রাহক
                  যাত্রার পূর্ণ মানচিত্র দেখুন।
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-slate-100">🤝 Value Pitch Engine</p>
                <p className="mt-2">
                  ইনটেন্ট শনাক্ত করে ভ্যালু স্টেটমেন্ট ও CTA ইনস্ট্যান্টলি তৈরি করে
                  কনভার্সন ফানেল এগিয়ে নিন।
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-slate-100">📈 Conversion Signals</p>
                <p className="mt-2">
                  স্কোরিং মডেলের মাধ্যমে কোন লিডকে কখন ফলো আপ দিলে ক্লোজ হওয়ার
                  সম্ভাবনা বাড়বে তা নির্দেশ করে।
                </p>
              </div>
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}
