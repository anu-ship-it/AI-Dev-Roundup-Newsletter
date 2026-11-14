// ============================================================
// FILE:    scheduler/src/pipeline/ranker.js
// STAGE:   STAGE 2 of 3 - AI PIPELINE
// ACTION:  REPLACE the existing scheduler/src/pipeline/ranker.js
// PURPOSE: Scores items 1-10 and reports which items got a real verdict.
// NOTE:    Imports ./llm.js (new file above).
// ============================================================

// ranker.js — relevance scoring.
// Returns which items got a REAL verdict (evaluatedIds). Items whose scoring failed
// are NOT in that list, so the caller leaves them queued instead of discarding them.

const { chat } = require("./llm");

const MIN_SCORE = parseInt(process.env.MIN_RELEVANCE_SCORE, 10) || 7;
const MAX_CONSECUTIVE_FAILURES = 5;

const SCORING_PROMPT = `You are an expert curator for a weekly newsletter aimed at software engineers and founders building AI-powered products.

Score the following item on a scale of 1-10 for relevance to this audience.

Scoring rubric:
- 9-10: Groundbreaking AI/ML release, major new developer tool, or highly practical implementation guide
- 7-8: Useful AI library, interesting ML paper with practical applications, solid developer tool
- 5-6: General software engineering content, tangentially related to AI
- 3-4: Viral but low-signal (meme repos, joke projects, personal portfolios)
- 1-2: Completely irrelevant (non-technical, marketing fluff, unrelated domain)

Respond ONLY with a valid JSON object, no markdown, no extra text:
{"score": <number 1-10>, "reason": "<one sentence explaining the score>"}`;

function parseJson(text) {
  const cleaned = text.replace(/```json|```/g, "");
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`no JSON object in model output: ${text.slice(0, 120)}`);
  return JSON.parse(match[0]);
}

async function scoreItem(item) {
  const user = [
    `Title: ${item.title}`,
    `Description: ${item.description || "No description"}`,
    `Source: ${item.source}`,
    item.metadata && item.metadata.language ? `Language: ${item.metadata.language}` : "",
    item.metadata && item.metadata.starsToday ? `Stars today: ${item.metadata.starsToday}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const text = await chat({ system: SCORING_PROMPT, user, maxTokens: 600, temperature: 0 });
  const parsed = parseJson(text);
  const score = Number(parsed.score);
  if (!Number.isFinite(score)) throw new Error("model output has no numeric score");
  return { score: Math.min(10, Math.max(0, score)), reason: String(parsed.reason || "") };
}

async function rankItems(items) {
  console.log(`\nRanking: scoring ${items.length} items...`);

  const passed = [];
  const evaluatedIds = [];
  let failed = 0;
  let consecutive = 0;
  let lastError = null;
  let aborted = false;

  for (const item of items) {
    try {
      const { score, reason } = await scoreItem(item);
      consecutive = 0;
      evaluatedIds.push(item._id);
      const ok = score >= MIN_SCORE;
      console.log(`  ${ok ? "PASS" : "skip"} ${score}/10 - ${item.title.slice(0, 70)}`);
      if (ok) passed.push({ ...item, relevanceScore: score, scoreReason: reason });
    } catch (err) {
      failed++;
      consecutive++;
      lastError = err.message;
      console.warn(`  FAILED to score "${item.title.slice(0, 70)}": ${err.message}`);
      if (consecutive >= MAX_CONSECUTIVE_FAILURES) {
        aborted = true;
        console.error(`  Aborting ranking after ${consecutive} consecutive failures`);
        break;
      }
    }
  }

  passed.sort((a, b) => b.relevanceScore - a.relevanceScore);
  console.log(
    `\n  Ranking done: ${passed.length} passed (min ${MIN_SCORE}), ` +
      `${evaluatedIds.length} evaluated, ${failed} failed`
  );
  return { passed, evaluatedIds, failed, aborted, lastError };
}

module.exports = { rankItems };