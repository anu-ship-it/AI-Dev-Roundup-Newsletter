"use client";

import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

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

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 py-24">
        <div className="mb-6">
          <span className="text-xs font-semibold tracking-widest text-blue-400 uppercase">
            Weekly Newsletter
          </span>
        </div>

        <h1 className="text-5xl font-bold leading-tight mb-6 text-white">
          AI Dev Roundup
        </h1>

        <p className="text-xl text-slate-400 leading-relaxed mb-4 max-w-2xl">
          The highest-signal AI and developer content, curated weekly for
          engineers and founders building real products.
        </p>

        <p className="text-base text-slate-500 mb-12 max-w-2xl">
          Every week: trending repos, practical tools, research that actually
          matters — filtered by AI, summarized for developers. No noise, no fluff.
        </p>

        {/* Subscribe form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md">
          {status === "success" ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">🎉</div>
              <p className="text-green-400 font-medium text-lg">{message}</p>
              <p className="text-slate-500 text-sm mt-2">
                Check your inbox every week.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Your name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {status === "error" && (
                <p className="text-red-400 text-sm">{message}</p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {status === "loading" ? "Subscribing..." : "Subscribe — it's free"}
              </button>

              <p className="text-xs text-slate-600 text-center">
                No spam. Unsubscribe anytime with one click.
              </p>
            </form>
          )}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-md">
          {[
            { value: "Weekly", label: "delivery" },
            { value: "AI", label: "curated" },
            { value: "Free", label: "forever" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
