"use client";

import { title } from "process";
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
      setMessage("Something went wrong. Please try again.");
    }
  }

  const picks = [
    { tag: "TOOL", score: "9/10", title: "bytedance / deer-flow", desc: "Open-source SuperAgent harness for long-horizon AI tasks." },
    { tag: "REPO", score: "8/10", title: "alibaba / open-code-review", desc: "LLM-powered code review with deterministic pipelines." },
    { tag: "RESEARCH", score: "9/10", title: "DeusData / codebase-memory-mcp", desc: "Indexes codebases into a persistent knowledge graph." },
    { tag: "TOOL", score: "8/10", title: "supermemoryai / supermemory", desc: "Memory engine and API for AI applications." },
  ];

  const tagColors: Record<string, string> = {
    TOOL: "#C8F135",
    REPO: "#6B7280",
    RESEARCH: "#A78BFA",
    RELEASE: "#F87171",
    TUTORIAL: "#34D399",
  };

  return (
    <>
     <style>
      {`
       @import url('https://fonts.googleapis.com/css2?
       family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600&display=swap');

       *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

       body {
        background: #0A0A0A;
        color: #F5F5F0;
        font-family: 'Inter', sans-serif;
        min-height: 100vh;
        -webkit-font-smoothing: antialiased;
       }

       .mono { font-family: 'JetBrains Mono', monospace; }

       .page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
       }

      /* NAV */
      .nav {
        display: flex;
        align-items: center;
        justify-content: spae-between;
        padding: 28px 0 0;
        border-bottom: 1px solid #1E1E1E;
        padding-bottom: 20px;
      }
        .nav-brand { font-size: 13px; color: #6B7280; letter-spacing: 0.08em; }
        .nav-issue {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #4B5563;
          letter-spacing: 0.05em;
        }

        /* HERO */
        .hero {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: start;
          padding: 64px 0 80px;
        }

        @media (max-width: 768px) {
          .hero { grid-template-columns: 1fr; gap; 48px; }
        }

        /* LEFT */
        .left {}

        .eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #485563;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-buttom: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .eyebrow-dot {
          width: 6px; height: 6px;
          background: #C8F135;
          border-radius: 50%;
        }

        .masthead {
          font-family: 'JetBrains Mono', monospace;
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 700;
          line-height: 1.1;
          color: #F8F5F0;
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }
          .masthead-prompt { color: #C8F135; }
          .masthead-cursor {
            display: inline-block;
            width: 3px;
            height: 1em;
            background: #C8F135;
            vertical-align: middle;
            margin-left: 4px;
            transition: opacity 0.1s;
          }

          .tagline {
            font-size: 16px;
            color: #9CA3AF;
            line-height: 1.6;
            margin-bottom: 40px;
            max-width: 420px;
          }
          .tagline strong { color: #E8E4DC; font-weight: 500; }
          
          /* FORM */
          .form-label {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            color: #4B5563;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            margin-bottom: 12px;
          }

          .form-row {
            display: flex;
            gap: 8px;
            margin-bottom: 8px;
          }

          @media (max-width: 520px) {
            .form-row { flex-direction: column; }
          }

          .input {
            flex: 1;
            background: #111111;
            border: 1px solid #2A2A2A;
            color: #F5F5F0;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            padding: 12px 16px;
            outline: none;
            transition: border-color 0.15s;
            border-radius: 0;
            -webkit-appearance: none;
          }
           .input::placeholder { color: #3D3D3D; }
           .input:focus { border-color: #C8F135; }
           
           .btn {
            background: #C8F135;
            color: #0A0A0A;
            border: none;
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            letter-spacing: 0.08em;
            padding: 12px 24px;
            cursor: pointer;
            white-space: nowrap;
            transition: background 0.15s, opacity 0.15s;
            border-radius: 0;
           }
           .btn:hover { background: #D4F547; } 
      `}
     </style>
    </>
  )

  return (
    <main className="min-h-screen bg-white">
      {/* Top rule */}
      <div className="h-px bg-black w-full" />

      {/* Nav */}
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <span className="text-sm font-medium tracking-tight text-black">AI Dev Roundup</span>
        <span className="text-xs text-gray-400 tracking-widest uppercase">Weekly</span>
      </nav>

      <div className="h-px bg-gray-100 w-full" />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left — copy */}
        <div>
          <p className="text-xs tracking-widest uppercase text-gray-400 mb-6">
            Issue 001 — June 2026
          </p>

          <h1 className="text-5xl font-bold tracking-tight text-black leading-[1.1] mb-8">
            The developer&apos;s<br />
            guide to AI<br />
            that matters.
          </h1>

          <p className="text-base text-gray-500 leading-relaxed mb-6 max-w-sm">
            Every week, our pipeline scrapes GitHub Trending, Hacker News, and arXiv —
            filters for signal, and delivers the 8–10 items worth your time.
          </p>

          <p className="text-base text-gray-500 leading-relaxed max-w-sm">
            Written for engineers building real products.
            No opinion pieces, no hype, no &quot;top 10 AI tools&quot; lists.
          </p>

          {/* Stats row */}
          <div className="mt-12 flex gap-10 border-t border-gray-100 pt-8">
            {[
              { n: "Weekly", label: "cadence" },
              { n: "AI", label: "curated" },
              { n: "Free", label: "always" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-xl font-bold text-black">{s.n}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div className="lg:pt-2">
          <div className="border border-gray-200 p-8">
            {status === "success" ? (
              <div className="py-8">
                <div className="text-2xl font-bold text-black mb-2">You&apos;re in.</div>
                <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
                <p className="text-gray-400 text-xs mt-4">
                  First issue arrives this Sunday.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-black mb-1">Subscribe</h2>
                <p className="text-sm text-gray-400 mb-6">
                  Join engineers who read this every week.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                      className="w-full border border-gray-200 px-4 py-3 text-sm text-black placeholder-gray-300 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="w-full border border-gray-200 px-4 py-3 text-sm text-black placeholder-gray-300 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  {status === "error" && (
                    <p className="text-red-500 text-xs">{message}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full bg-black text-white text-sm font-medium py-3 px-6 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {status === "loading" ? "Subscribing..." : "Subscribe — free"}
                  </button>

                  <p className="text-xs text-gray-300 text-center">
                    No spam. One-click unsubscribe.
                  </p>
                </form>
              </>
            )}
          </div>

          {/* Sample items */}
          <div className="mt-6 space-y-0">
            <p className="text-xs uppercase tracking-widest text-gray-300 mb-3">
              This week&apos;s picks
            </p>
            {[
              { tag: "Repo", title: "microsoft / TypeScript — v5.8 released with infer improvements" },
              { tag: "Research", title: "Anthropic publishes interpretability findings on attention heads" },
              { tag: "Tool", title: "Vercel AI SDK 4.0 — unified streaming across all providers" },
            ].map((item, i) => (
              <div key={i} className="py-3 border-b border-gray-100 flex items-start gap-3">
                <span className="text-xs border border-gray-200 text-gray-400 px-1.5 py-0.5 shrink-0 mt-0.5">
                  {item.tag}
                </span>
                <span className="text-sm text-gray-600 leading-snug">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom rule + footer */}
      <div className="h-px bg-gray-100 w-full mt-16" />
      <footer className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
        <span className="text-xs text-gray-300">© 2026 AI Dev Roundup</span>
        <span className="text-xs text-gray-300">Built with Node.js · MongoDB · Groq · Resend</span>
      </footer>
    </main>
  );
}