// ============================================================
// FILE:    scheduler/src/pipeline/llm.js
// STAGE:   STAGE 2 of 3 - AI PIPELINE
// ACTION:  NEW FILE - create scheduler/src/pipeline/llm.js
// PURPOSE: The only file that calls Groq. Handles retired models, rate limits and daily limits.
// NOTE:    ranker.js and summarizer.js both import this file, so it must exist.
// ============================================================

// llm.js — the only place that talks to Groq.
//  - Asks Groq which models exist right now and uses the preferred ones that do.
//  - Skips a model for the rest of the run if it vanishes or hits its daily limit.
//  - Waits out per-minute rate limits using the retry time Groq reports.
//  - If NONE of the preferred models exist it throws an error that lists what Groq
//    offers, so the fix is changing GROQ_MODELS, not a code change.

const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const PREFERRED = (
  process.env.GROQ_MODELS ||
  "openai/gpt-oss-20b,openai/gpt-oss-120b,llama-3.3-70b-versatile,llama-3.1-8b-instant"
)
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let usable = null;
const exhausted = new Set();
let sendReasoningEffort = true;

async function resolveModels() {
  if (usable) return usable;

  let available = null;
  try {
    const list = await groq.models.list();
    available = new Set(list.data.map((m) => m.id));
  } catch (err) {
    console.warn(`  Could not list Groq models (${err.message}); using configured list as-is`);
  }

  usable = available ? PREFERRED.filter((m) => available.has(m)) : [...PREFERRED];
  if (usable.length === 0) {
    throw new Error(
      `None of the configured models exist on Groq. Configured: ${PREFERRED.join(", ")}. ` +
        `Groq offers: ${[...available].join(", ")}. Set GROQ_MODELS to one or more of these.`
    );
  }
  console.log(`  LLM models in use: ${usable.join(" -> ")}`);
  return usable;
}

function classify(err) {
  const msg = String((err && err.message) || "");
  if (err.status === 404 || msg.includes("model_not_found")) return "gone";
  if (err.status === 429) {
    return /per day|\(TPD\)|\(RPD\)/i.test(msg) ? "daily_limit" : "rate_limit";
  }
  if (err.status === 400 && /reasoning/i.test(msg)) return "bad_reasoning_param";
  return "other";
}

function retryAfterMs(err, fallback) {
  const m = /try again in (?:(\d+)m)?(?:([\d.]+)s)?/i.exec(String(err.message));
  if (!m) return fallback;
  const ms = (Number(m[1] || 0) * 60 + Number(m[2] || 0)) * 1000;
  return Math.min(Math.max(ms, 1000) + 500, 90_000);
}

async function chat({ system, user, maxTokens, temperature = 0.1 }) {
  const models = await resolveModels();
  let lastErr = null;

  for (const model of models) {
    if (exhausted.has(model)) continue;

    for (let attempt = 1; attempt <= 3; attempt++) {
      const body = {
        model,
        // gpt-oss models are reasoning models: reasoning tokens count against this limit.
        max_tokens: maxTokens,
        temperature,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      };
      if (sendReasoningEffort && model.startsWith("openai/gpt-oss")) {
        body.reasoning_effort = "low";
      }

      try {
        const res = await groq.chat.completions.create(body);
        const text = ((res.choices && res.choices[0] && res.choices[0].message.content) || "").trim();
        if (!text) throw Object.assign(new Error(`empty completion from ${model}`), { kind: "empty" });
        return text;
      } catch (err) {
        lastErr = err;
        const kind = err.kind || classify(err);

        if (kind === "gone" || kind === "daily_limit") {
          console.warn(`  ${model}: ${kind} - skipping it for the rest of this run`);
          exhausted.add(model);
          break; // move on to the next model
        }
        if (kind === "bad_reasoning_param") {
          sendReasoningEffort = false;
          continue;
        }
        if (kind === "rate_limit" || kind === "empty") {
          await sleep(retryAfterMs(err, 2000 * attempt));
          continue;
        }
        throw err; // auth, malformed request, network: a different model will not fix these
      }
    }
  }
  throw lastErr || new Error("All Groq models are unavailable");
}

module.exports = { chat, resolveModels };