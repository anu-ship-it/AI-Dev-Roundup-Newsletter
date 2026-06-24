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
      console.error(`Failed to save item: ${item.url}`, err.message);
    }
  }

  return { saved, skipped };
}

async function runScraper() {
  console.log("\nStarting AI Dev Roundup Scraper...");

  await connectDB();

  try {
    const allItems = [
      ...(await scrapeGithubTrending()),
    ];

    console.log(`Total items scraped: ${allItems.length}`);

    const { saved, skipped } = await saveItems(allItems);

    console.log(`New items saved: ${saved}`);
    console.log(`Duplicates skipped: ${skipped}`);
  } finally {
    await disconnectDB();
  }
}

module.exports = { runScraper };
