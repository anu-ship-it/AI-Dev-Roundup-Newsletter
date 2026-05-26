// summarizer.js — Final summaries using Gemini Flash
//
// Runs LAST and ONLY on items that passed dedup and ranking.
// Each summary follows a strict 3-part format readers actually find useful.

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SUMMARY_PROMPT = `You are a technical writer for a weekly AI developer newsletter. Your summaries are read by software engineers and founders.

Write a concise summary for the following item. Follow this exact format:

**What**: [One sentence describing what this is, technically precise]
**Why it matters**: [One sentence on why a developer building AI products should care]
**Signal**: [One word or short phrase: "Tool" | "Research" | "Tutorial" | "Release" | "Repo"]

Rules:
- Be specific and technical, not vague or marketing-speak
- No hype words like "revolutionary", "game-changing", "amazing"
- Keep total length under 60 words
- Respond ONLY with the formatted summary, no other text`;

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
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 150,
      },
    });

    const result = await model.generateContent(
      `${SUMMARY_PROMPT}\n\nItem to summarize:\n${itemDescription}`
    );

    return result.response.text().trim();
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