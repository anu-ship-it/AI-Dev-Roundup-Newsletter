// ranker.js — Relevance scoring with automatic model fallback
//
// Tries models in order — if one is deprecated, moves to the next.
// No manual intervention needed when Groq updates their model lineup.

const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MIN_SCORE = parseInt(process.env.MIN_RELEVANCE_SCORE) || 7;

// Models tried in order — update this list when Groq adds new ones
const GROQ_MODELS = [
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
];

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

async function callGroq(userContent, maxTokens = 100) {
  for (const model of GROQ_MODELS) {
    try {
      const response = await groq.chat.completions.create({
        model,
        max_tokens: maxTokens,
        temperature: 0.1,
        messages: [
          { role: "system", content: SCORING_PROMPT },
          { role: "user", content: userContent },
        ],
      });
      return response.choices[0].message.content;
    } catch (err) {
      if (
        err.message.includes("model_not_found") ||
        err.message.includes("does not exist") ||
        err.message.includes("404")
      ) {
        console.warn(`  Model ${model} unavailable, trying next...`);
        continue;
      }
      throw err;
    }
  }
  throw new Error("All Groq models failed");
}

async function scoreItem(item) {
  const itemDescription = `
Title: ${item.title}
Description: ${item.description || "No description"}
Source: ${item.source}
${item.metadata?.language ? `Language: ${item.metadata.language}` : ""}
${item.metadata?.starsToday ? `Stars today: ${item.metadata.starsToday}` : ""}
`.trim();

  try {
    const text = await callGroq(itemDescription);
    // Strip markdown fences if model returns them
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return { score: parsed.score, reason: parsed.reason };
  } catch (err) {
    console.warn(`  Scoring failed for "${item.title}": ${err.message}`);
    return { score: 0, reason: "Scoring failed" };
  }
}

async function rankItems(items) {
  console.log(`\nRanking: scoring ${items.length} items...`);

  const scoredItems = [];

  for (const item of items) {
    const { score, reason } = await scoreItem(item);
    console.log(`  ${score >= MIN_SCORE ? "✅" : "❌"} Score ${score}/10 — ${item.title.substring(0, 50)}...`);
    console.log(`     Reason: ${reason}`);

    if (score >= MIN_SCORE) {
      scoredItems.push({ ...item, relevanceScore: score });
    }
  }

  scoredItems.sort((a, b) => b.relevanceScore - a.relevanceScore);
  console.log(`\n  ✅ ${scoredItems.length} items passed ranking (minimum score: ${MIN_SCORE})`);
  return scoredItems;
}

module.exports = { rankItems };