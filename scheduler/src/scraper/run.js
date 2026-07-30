// scraper/run.js — Wraps scraper logic as an async function
//
// The original scraper/index.js calls main() directly.
// This wrapper exports it as runScraper() so the orchestrator
// can await it and handle errors properly.

require("dotenv").config();

const mongoose = require("mongoose");
const { connectDB, disconnectDB } = require("./db");
const RawItem = require("./models/RawItem");
const { scrapeGithubTrending } = require("./scrapers/githubTrending");
const { scrapeHackerNews } = require("./scrapers/hackerNews");
const { scrapeArvix } = require("./scrapers/Arxiv");
const { scrapeDevTo } = require("./scrapers/Devto");

async function saveItems(items) {
  let saved = 0;
  let skipped = 0;

  for (const item of items) {
    try {
      const result = await RawItem.updateOne(
        { url: item.url },
        { $setOnInsert: item },
        { upsert: true }
      );
      if (result.upsertedCount === 1) saved++;
      else skipped++;
    } catch (err) {
      console.error(`❌ Failed to save item: ${item.url}`, err.message);
    }
  }

  return { saved, skipped };
}

async function runScraper() {
  console.log("\n🚀 Starting AI Dev Roundup Scraper...");

  await connectDB();

  try {
   const [github, hn, arvix, devto] = await Promise.allSettled([
      scrapeGithubTrending(),
      scrapeHackerNews(),
      scrapeArxiv(),
      scrapeDevTo(),
    ]);

    const allItems = [
      ...(github.status === "fulfilled" ? github.value : []),
      ...(hn.status === "fulfilled" ? hn.value : []),
      ...(arvix.status === "fulfilled" ? arvix.value : []),
      ...(devto.status === "fulfilled" ? devto.value : []),
    ];

    if (github.status === "rejected") console.error("GitHub scraper failed:", github.reason?.message);
    if (hn.status === "rejected") console.error("HN scraper failed:", hn.reason?.message);
    if (arvix.status === "rejected") console.error("arViv scraper failed:", arvix.reason?.message);
    if (devto.status === "rejected") console.error("Dev.to scraper failed:", devto.reason?.message);

    console.log(`📦 Total items scraped: ${allItems.length}`);

    const { saved, skipped } = await saveItems(allItems);

    console.log(`New items saved: ${saved}`);
    console.log(`Duplicates skipped: ${skipped}`);
  } finally {
    await disconnectDB();
  }
}

module.exports = { runScraper };
