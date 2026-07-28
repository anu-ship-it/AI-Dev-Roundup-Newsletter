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
           .btn:disabled { opacity: 0.4; cursor: not-allowed; }
           
           .form-note {
              font-size: 12px;
              color: #3D3D3D;
              margin-top: 10px;
           }

           .form-error { color: #F87171; font-size: 13px; margin-top: 8px; }

           .success-state { padding: 24px 0; }
           .success-title {
              font-family: 'JetBrains Mono', monospae;
              font-size: 18px;
              color: #C8F135;
              margin-bottom: 8px;
           }
            .success-body { font-size: 14px; color: #9CA3AF; }
            
            /* STATS */
            .stats {
              display: flex;
              gap: 32px;
              margin-top: 40px;
              padding-top: 32px;
              border-top: 1px solid #1A1A1A;
            }
            .stat-value {
              font-family: 'JetBrains Mono', monospace;
              font-size: 20px;
              font-weight: 700;
              color: #F5F5F0;
            }
            .stat-label {
              font-size: 11px;
              color: #485563;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              margin-top: 2px;
            }

            /* RIGHT - PICKS */
            .right {}

            .picks-header {
              font-family: 'JetBrains Mono', monospace;
              font-size: 10px;
              color: #3D3D3D;
              letter-spacing: 0.15em;
              text-transform: uppercase;
              margin-bottom: 16px;
              padding-bottom: 12px;
              border-bottom: 1px solid #1A1A1A;
            }

            .pick {
              padding: 16px 0;
              border-bottom: 1px solid #141414;
            }
            .pick:ladt-child { border-bottom: none; }
            
            .pick-meta {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 6px;
            }

            .pick-tag {
              font-family: 'JetBrains Mono', monospace;
              font-size: 9px;
              font-weight: 700;
              letter-spacing: 0.12em;
              padding: 2px 6px;
            }

            .pick-score {
              font-family: 'JetBrains Mono', monospace;
              font-size: 10px;
              color: #485563;
            }

            .pick-title {
              font-size: 13px;
              font-weight: 600;
              color: #E8E4DC;
              margin-bottom: 4px;
              line-height: 1.3;
            }

            .pick-desc {
              font-size: 12px;
              color: #6B7280;
              line-height: 1.5;
            }

            .picks-footer {
              margin-top: 20px;
              font-family: 'JetBrains Mono', monospace;
              font-size: 10px;
              color: #2A2A2A;
              letter-spacing: 0.08em;
            }

            /* FOOTER */
            .footer {
              border-top: 1px solid #1A1A1A;
              padding: 24px 0;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .footer-left {
              font-family: 'JetBrains Mono', monospace;
              font-size: 11px;
              color: #2A2A2A;
            }
            .footer-right { font-size: 11px; color: #2A2A2A; }  
      `}</style>

      <div className="page">
        {/* NAV */}
        <nav className="nav">
          <span className="nav-brand mono">AI DEV ROUNDUP</span>
          <span className="nav-issue">by Anoop · Every Sunday</span>
        </nav>

        {/* HERO */}
        <div className="hero">
          {/* LEFT */}
          <div className="left">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Weekly · AI · Developer Intelligence 
            </div>

            <h1 className="masthead">
              <span className="masthead-prompt">&gt: </span>
              AI Dev<br />Roundup
              <span
                className="masthead-cursor"
                style={{ opacity: cursor ? 1 : 0 }}
              />
            </h1>

            <p className="tagline" style={{ marginTop: "24px"}}>
              The <strong>8 things worth your time</strong> this week - pulled from GitHub Trending, Hacker News, and arXiv.
              Filtered by AI. No opinion pieces. No hype. No lists.
            </p>

            {status === "success" ? (
              <div className="success-state">
                <div className="success-title">subscribed.</div>
                <p className="success-body">{message}<br />First issue lands Sunday.</p>
              </div>
            ) : (
              <>
              <div className="form-label">Join engineers who read this every week</div>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <input
                    className="input"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <input
                    className="input"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button className="btn" type="submit" disabled={status === "loading"}>
                    {status === "loading" ? "..." : "SUBSCRIBE"}
                    </button> 
                </div>
                {status === "error" && <p className="form-error">{message}</p>}
                <p className="form-note">Free. One-click unsubscribe.</p>
              </form>
              </>
            )}

            <div className="stats">
              {[
                { value: "4", label: "Sources" },
                { value: "Weekly", label: "Cadence" },
                { value: "Free", label: "Always" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-value">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT - SAMPLE PICKS */}
          <div className="right">
            <div className="picks-header">this week&apos;s picks</div>
            {picks.map((pick, i) => (
              <div className="pick" key={i}>
                <div className="pick-meta">
                  <span
                    className="pick-tag mono"
                    style={{
                      background: tagColors[pick.tag] + "20",
                      color: tagColors[pick.tag],
                    }}
                  >
                    {pick.tag}
                  </span>
                  <span className="pick-score">{pick.score}</span>
                </div>
                <div className="pick-title">{pick.title}</div>
                <div className="pick-desc">{pick.desc}</div>
              </div>
            ))}
            <div className="picks-footer">+ more every Sunday</div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="footer">
          <span className="footer-left mono">@ 2026 AI Dev Roundup</span>
          <span className="footer-right">Node.js · MongoDB · Groq · AWS · Resend</span>
        </footer>
      </div>
    </>
  );
}  
