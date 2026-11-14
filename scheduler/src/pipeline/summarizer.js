// ============================================================
// FILE:    scheduler/src/pipeline/summarizer.js
// STAGE:   STAGE 2 of 3 - AI PIPELINE
// ACTION:  REPLACE the existing scheduler/src/pipeline/summarizer.js
// PURPOSE: Writes the 3-line summary for each item that passed ranking.
// NOTE:    Imports ./llm.js (new file above).
// ============================================================

// summarizer.js — summaries for the items that passed ranking.
// A failed summary degrades to the item's own description; it never drops the item.

const { chat } = require("./llm");

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
  const user = [
    `Title: ${item.title}`,
    `Description: ${item.description || "No description"}`,
    `Source: ${item.source}`,
    `Relevance score: ${item.relevanceScore}/10`,
    item.metadata && item.metadata.language ? `Language: ${item.metadata.language}` : "",
    item.metadata && item.metadata.starsToday ? `Stars today: ${item.metadata.starsToday}` : "",
    item.metadata && item.metadata.stars ? `Total stars: ${item.metadata.stars}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    return await chat({ system: SUMMARY_PROMPT, user, maxTokens: 700, temperature: 0.3 });
  } catch (err) {
    console.warn(`  Summary failed for "${item.title.slice(0, 60)}": ${err.message}`);
    return null;
  }
}

async function summarizeItems(items) {
  console.log(`\nSummarizing ${items.length} items...`);
  const out = [];
  let failed = 0;

  for (const item of items) {
    const summary = await summarizeItem(item);
    if (!summary) failed++;
    out.push({ ...item, summary: summary || item.description || item.title, summaryFailed: !summary });
  }

  console.log(`  Summaries done (${failed} fell back to the raw description)`);
  return out;
}

module.exports = { summarizeItems };