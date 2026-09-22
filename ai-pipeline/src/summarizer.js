// summarizer.js — Final summaries using Groq
//
// Runs only on items that passed dedup and ranking.
// Uses llama-3.1-8b-instant — fast, free, good quality for summaries.

const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

async function summarizeItem(item) {
  const itemDescription = `
Title: ${item.title}
Description: ${item.description || "No description"}
Source: ${item.source}
Relevance score: ${item.relevanceScore}/10
${item.metadata?.language ? `Language: ${item.metadata.language}` : ""}
${item.metadata?.starsToday ? `Stars today: ${item.metadata.starsToday}` : ""}
${item.metadata?.stars ? `Total stars: ${item.metadata.stars}` : ""}
`.trim();

  try {
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      max_tokens: 150,
      temperature: 0.3,
      messages: [
        { role: "system", content: SUMMARY_PROMPT },
        { role: "user", content: itemDescription },
      ],
    });

    return response.choices[0].message.content.trim();
  } catch (err) {
    console.warn(`  ⚠️  Summarization failed for "${item.title}": ${err.message}`);
    return item.description || "No summary available.";
  }
}

async function summarizeItems(items) {
  console.log(`\n✍️  Summarizing ${items.length} items...`);

  const summarizedItems = [];

  for (const item of items) {
    console.log(`  📝 Summarizing: ${item.title.substring(0, 60)}...`);
    const summary = await summarizeItem(item);
    summarizedItems.push({ ...item, summary });
    console.log(`     Done ✓`);
  }

  console.log(`\n  ✅ All ${summarizedItems.length} items summarized`);
  return summarizedItems;
}

module.exports = { summarizeItems };