// ranker.js — Relevance scoring using Gemini Flash
//
// Sends each item to gemini-1.5-flash with a scoring rubric.
// Returns a score 1-10 for developer relevance.
// Only items scoring >= MIN_RELEVANCE_SCORE survive.

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MIN_SCORE = parseInt(process.env.MIN_RELEVANCE_SCORE) || 7;

const SCORING_PROMPT = `You are an expert curator for a weekly newsletter aimed at software engineers and founders building AI-powered products.

Score the following item on a scale of 1-10 for relevance to this audience.

Scoring rubric:
- 9-10: Groundbreaking AI/ML release, major new developer tool, or highly practical implementation guide
- 7-8: Useful AI library, interesting ML paper with practical applications, solid developer tool
- 5-6: General software engineering content, tangentially related to AI
- 3-4: Viral but low-signal (meme repos, joke projects, personal portfolios)
- 1-2: Completely irrelevant (non-technical, marketing fluff, unrelated domain)

Respond ONLY with a valid JSON object in this exact format, no other text, no markdown:
{"score": <number 1-10>, "reason": "<one sentence explaining the score>"}`;

async function scoreItem(item) {
  const itemDescription = `
Title: ${item.title}
Description: ${item.description || "No description"}
Source: ${item.source}
${item.metadata?.language ? `Language: ${item.metadata.language}` : ""}
${item.metadata?.starsToday ? `Stars today: ${item.metadata.starsToday}` : ""}
`.trim();

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 100,
        responseMimeType: "application/json", // forces JSON output
      },
    });

    const result = await model.generateContent(
      `${SCORING_PROMPT}\n\nItem to score:\n${itemDescription}`
    );

    const text = result.response.text().trim();
    const parsed = JSON.parse(text);

    return {
      score: parsed.score,
      reason: parsed.reason,
    };
  } catch (err) {
    console.warn(`  ⚠️  Scoring failed for "${item.title}":`, err);
    return { score: 0, reason: "Scoring failed" };
  }
}

async function rankItems(items) {
  console.log(`\n🎯 Ranking: scoring ${items.length} items...`);

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