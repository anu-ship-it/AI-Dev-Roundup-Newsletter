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
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2? family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />

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
            
          </div>
        </div>
      </div>
    </div>
  )