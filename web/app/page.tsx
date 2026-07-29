"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [cursor, setCursor] = useState(true);

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => setCursor((c) => !c), 530);
    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        setName("");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error);
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Try again.");
    }
  }

  const picks = [
    { tag: "TOOL", score: "9/10", color: "-[#C8F135] bg-[#C8F135]/10", title: "bytedance / deer-flow", desc: "Open-source SuperAgent harness for long-horizon AI tasks." },
    { tag: "REPO", score: "8/10", color: "text-gray-400 bg-gray-400/10", title: "alibaba / open-code-review", desc: "LLM-powered code review with deterministic pipelines." },
    { tag: "RESEARCH", score: "9/10", color: "text-purple-400 bg-purple-400/10", title: "DeusData / codebase-memory-mcp", desc: "Indexes codebases into a persistent knowledge graph." },
    { tag: "TOOL", score: "8/10", color: "text-[#C8F135] bg-[#C8F135]/10", title: "supermemoryai / supermemory", desc: "Memory engine and API for AI applications." },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-5xl mx-auto px-6">

        {/* NAV */}
        <nav className="flex items-center justify-between py-6 border-b border-[#1E1E1E]">
          <span className="text-xs text-gray-500 tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            AI DEV ROUNDUP
          </span>
          <span className="text-xs text-[#2A2A2A]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            by Anoop · Every Sunday
          </span>
        </nav>

        {/* HERO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 py-16 lg:py-20">
          {/* LEFT */}
          <div>
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8F135]" />
              <span className="text-[10px] text-gray-600 tracking-[0.15em] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                Weekly · AI · Developer Intelligence
              </span>
            </div>

            {/* Masthead */}
            <h1 className="text-5x1 lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <span className="text-[#C8F135]">&gt; </span>
              AI Dev<br />Roundup
              <span
                className="inline-block w-0.75 bg-[#C8F135] ml-1 align-middle" style={{ height: "0.85em", opacity: cursor ? 1 : 0, transition: "opacity 0.1s" }}
              />
            </h1>

            {/* Tagline */}
            <p className="text-base text-gray-500 leading-relaxed mb-10 max-w-sm">
              The <span className="text-[#E8E4DC] font-medium">8 things worth your time</span> this week -
              pulled from GitHub Trending, Hacker News, and arXiv.
              Filtered by AI. No opinion pieces. No hype. No lists.
            </p>

            {/* Form */}
            {status === "success" ? (
              <div className="py-6">
                <div className="text-lg font-bold text-[#C8F135] mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {`// subscribed.`}
                </div>
                <p className="text-sm text-gray-500">{message}<br />First issue lands Sunday.</p>
              </div>
            ) : (
            <div>
              <div className="text-[10px] text-gray-600 tracking-widest uppercase mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                Join engineers who read this every week
              </div>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="flex-1 bg-[#111111] border border-[#2A2A2A] text-[#F5F5F0] text-sm px-4 py-3 outline-none focus:border-[#C8F135] placeholder-[#3D3D3D] transition-colors rounded-none"
                  />
                  <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="flex-1 bg-[#111111] border border-[#2A2A2A] text-[#F5F5F0] text-sm px-4 py-3 outline-none focus:border-[#C8F135] placeholder-[#3D3D3D] transition-colors rounded-none"  
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="bg-[#C8F135] text-[#0A0A0A] text-bold tracking-widest px-6 py-3 hover:bg-[#D4F547] disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-none whitespace-nowrap"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {status === "loading" ? "..." :"SUBSCRIBE"}
                  </button>
                </div>
                {status === "error" && (
                  <p className="text-red-400 text-xs mt-2">{message}</p>
                )}
                <p className="text-xs text-[#3D3D3D] mt-2">Free. One-click unsubscribe.</p>
              </form>
            </div>
          )}

          {/* Stats */}
          <div className="flex gap-8 mt-10 pt-8 border-t border-[#1A1A1A]">
            {[
              { value: "4", label: "Sources" },
              { value: "Weekly", label: "Cadence" },
              { value: "Free", label: "Always" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-x1 font-bold text-[#F5F5F0]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {s.value}
                </div>
                <div className="text-[10px] text-gray-600 uppercase tracking-widest mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT - PICKS */}
        <div className="lg:pt-2">
          <div className="text-[10px] text-[#3D3D3D] tracking-[0.15em] uppercase mb-4 pb-3 border-[#1A1A1A]" style={{ fontFamily: "'JetBrains Mono',monospace" }}>
            {`// this week's picks`}
          </div>

          <div className="space-y-0">
            {picks.map((pick, i) => (
              <div key={i} className="py-4 border-b border-[#141414] last:border-none">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[9px] font-bold tracking-widest px-1.5 py-0.5 ${pick.color}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {pick.tag}
                  </span>
                  <span className="text-[10px] text-gray-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {pick.score}
                  </span>
                </div>
                <div className="text-sm font-semibold text-[#E8E4DC] mb-1 leading-snug">
                  {pick.title}
                </div>
                <div className="text-xs text-gray-600 leading-relaxed">
                  {pick.desc}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-[10px] text-[#2A2A2A] tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            + more every Sunday
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-[#1A1A1A] py-6 flex items-center justify-between">
        <span className="text-[11px] text-[#2A2A2A]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          @ 2026 AI Dev Roundup
        </span>
        <span className="text-[11px] text-[#2A2A2A]">
          Node.js · MongoDB · Groq · AWS · Resend
        </span>
      </footer>

    </div>
   </div> 
  );
}
