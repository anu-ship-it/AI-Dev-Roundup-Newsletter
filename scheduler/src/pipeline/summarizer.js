// summarizer.js — Summarization with automatic model fallback

const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const GROQ_MODELS = [
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
];

const SUMMARY_PROMPT = `You are a technical writer for a weekly AI developer newsletter read by software engineers and founders.

Write a concise summary for the following item in this exact format:

**What**: [One sentence describing what this is, technically precise]
**Why it matters**: [One sentence on why a developer building AI products should care]
**Signal**: [One word: "Tool" or "Research" or "Tutorial" or "Release" or "Repo"]

Rules:
- Be specific and technical, not vague
- No hype words like "revolutionary" or "game-changing"
- Under 60 words total
- Return only the formatted summary, nothing else`;

async function callGroq(userContent, maxTokens = 150) {
  for (const model of GROQ_MODELS) {
    try {
      const response = await groq.chat.completions.create({
        model,
        max_tokens: maxTokens,
        temperature: 0.3,
        messages: [
          { role: "system", content: SUMMARY_PROMPT },
          { role: "user", content: userContent },
        ],
      });
      return response.choices[0].message.content.trim();
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

async function summarizeItem(item) {
  const itemDescription = `
Title: ${item.title}
Description: ${item.description || "No description"}
Source: ${item.source}
Relevance score: ${item.relevanceScore}/10
${item.metadata?.language ? `Language: ${item.metadata.language}` : ""}
${item.metadata?.starsToday ? `Stars today: ${item.metadata.starsToday}` : ""}
`.trim();

  try {
    return await callGroq(itemDescription);
  } catch (err) {
    console.warn(`  Summarization failed for "${item.title}": ${err.message}`);
    return item.description || "No summary available.";
  }
}

async function summarizeItems(items) {
  console.log(`\nSummarizing ${items.length} items...`);
  const summarizedItems = [];

  for (const item of items) {
    console.log(`  Summarizing: ${item.title.substring(0, 60)}...`);
    const summary = await summarizeItem(item);
    summarizedItems.push({ ...item, summary });
    console.log(`     Done ✓`);
  }

  console.log(`\n  ✅ All ${summarizedItems.length} items summarized`);
  return summarizedItems;
}

module.exports = { summarizeItems };
