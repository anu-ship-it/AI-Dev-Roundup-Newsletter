"use client";

import { useState, useEffect } from "react";
import { JetBrains_Mono, Inter } from "next/font/google";

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

const picks = [
  {
    tag: "TOOL",
    tagClass: "text-[#C8F135] bg-[#C8F135]/10 border border-[#C8F135]/20",
    score: "9/10",
    title: "bytedance / deer-flow",
    desc: "Open-source SuperAgent harness for long-horizon AI tasks with built-in tool use.",
  },
  {
    tag: "REPO",
    tagClass: "text-gray-400 bg-gray-400/10 border border-gray-400/20",
    score: "8/10",
    title: "alibaba / open-code-review",
    desc: "LLM-powered code review combining deterministic pipelines with precise line-level comments.",
  },
  {
    tag: "RESEARCH",
    tagClass: "text-purple-400 bg-purple-400/10 border border-purple-400/20",
    score: "9/10",
    title: "DeusData / codebase-memory-mcp",
    desc: "Indexes entire codebases into a persistent knowledge graph for AI-powered code intelligence.",
  },
  {
    tag: "TOOL",
    tagClass: "text-[#C8F135] bg-[#C8F135]/10 border border-[#C8F135]/20",
    score: "8/10",
    title: "supermemoryai / supermemory",
    desc: "Memory engine and API purpose-built for AI applications and agents.",
  },
];

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setCursor((c) => !c), 530);
    return () => clearInterval(t);
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

  return (
    <div className={`${jetbrains.variable} ${inter.variable} min-h-screen bg-[#0A0A0A] text-[#F5F5F0] font-sans`}>
      <div className="max-w-5xl mx-auto px-6">

        {/* NAV */}
        <nav className="flex items-center justify-between py-5 border-b border-[#1C1C1C]">
          <span className="font-mono text-[11px] text-gray-500 tracking-[0.2em] uppercase">
            AI DEV ROUNDUP
          </span>
          <span className="font-mono text-[11px] text-[#333333] tracking-wider">
            by Anoop · Every Sunday
          </span>
        </nav>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-16 pt-14 pb-16">

          {/* ── LEFT ── */}
          <div className="flex flex-col">

            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-7">
              <span className="w-[6px] h-[6px] rounded-full bg-[#C8F135] shrink-0" />
              <span className="font-mono text-[10px] text-gray-600 tracking-[0.18em] uppercase">
                Weekly · AI · Developer Intelligence
              </span>
            </div>

            {/* Masthead */}
            <h1 className="font-mono font-bold text-[52px] leading-[1.08] tracking-[-0.03em] mb-7">
              <span className="text-[#C8F135]">&gt; </span>
              AI Dev<br />Roundup
              <span
                className="inline-block w-[3px] bg-[#C8F135] ml-[5px] align-middle"
                style={{ height: "0.82em", opacity: cursor ? 1 : 0 }}
              />
            </h1>

            {/* Tagline */}
            <p className="text-[15px] text-gray-500 leading-[1.7] mb-10 max-w-[400px]">
              The{" "}
              <span className="text-[#E8E4DC] font-medium">8 things worth your time</span>
              {" "}this week — pulled from GitHub Trending, Hacker News, and arXiv.
              Filtered by AI. No opinion pieces. No hype. No lists.
            </p>

            {/* Form / Success */}
            {status === "success" ? (
              <div className="py-2">
                <p className="font-mono text-[18px] font-bold text-[#C8F135] mb-2">
                  // subscribed.
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {message}<br />First issue lands Sunday.
                </p>
              </div>
            ) : (
              <div>
                <p className="font-mono text-[10px] text-gray-600 tracking-[0.12em] uppercase mb-3">
                  Join engineers who read this every week
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                      className="flex-1 bg-[#111111] border border-[#222222] text-[#F5F5F0] text-sm px-4 py-[11px] outline-none focus:border-[#C8F135] placeholder-[#383838] transition-colors"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="flex-1 bg-[#111111] border border-[#222222] text-[#F5F5F0] text-sm px-4 py-[11px] outline-none focus:border-[#C8F135] placeholder-[#383838] transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="font-mono text-[11px] font-bold tracking-[0.12em] bg-[#C8F135] text-[#0A0A0A] px-7 py-[11px] hover:bg-[#D6F84A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                      {status === "loading" ? "..." : "SUBSCRIBE"}
                    </button>
                  </div>
                  {status === "error" && (
                    <p className="text-red-400 text-xs">{message}</p>
                  )}
                  <p className="text-xs text-[#333333] mt-1">
                    Free. One-click unsubscribe.
                  </p>
                </form>
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-10 mt-auto pt-10 border-t border-[#181818]" style={{ marginTop: "48px" }}>
              {[
                { value: "4", label: "Sources" },
                { value: "Weekly", label: "Cadence" },
                { value: "Free", label: "Always" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-mono text-[22px] font-bold text-[#F5F5F0]">
                    {s.value}
                  </div>
                  <div className="text-[10px] text-gray-600 uppercase tracking-[0.12em] mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT — PICKS ── */}
          <div className="lg:border-l lg:border-[#181818] lg:pl-12 pt-2">
            <p className="font-mono text-[10px] text-[#333333] tracking-[0.18em] uppercase mb-5 pb-4 border-b border-[#181818]">
              // this week&apos;s picks
            </p>

            <div>
              {picks.map((p, i) => (
                <div
                  key={i}
                  className="py-4 border-b border-[#131313] last:border-none"
                >
                  <div className="flex items-center gap-2 mb-[7px]">
                    <span className={`font-mono text-[9px] font-bold tracking-[0.14em] px-[6px] py-[2px] ${p.tagClass}`}>
                      {p.tag}
                    </span>
                    <span className="font-mono text-[10px] text-[#383838]">
                      {p.score}
                    </span>
                  </div>
                  <p className="text-[13px] font-semibold text-[#E0DDD8] mb-1 leading-snug">
                    {p.title}
                  </p>
                  <p className="text-[12px] text-gray-600 leading-[1.6]">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>

            <p className="font-mono text-[10px] text-[#282828] tracking-wider mt-5">
              + more every Sunday
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="border-t border-[#181818] py-5 flex items-center justify-between">
          <span className="font-mono text-[11px] text-[#282828]">
            © 2026 AI Dev Roundup
          </span>
          <span className="text-[11px] text-[#282828]">
            Node.js · MongoDB · Groq · AWS · Resend
          </span>
        </footer>

      </div>
    </div>
  );
}
