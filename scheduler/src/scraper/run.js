// ============================================================
// FILE:    scheduler/src/scraper/run.js
// STAGE:   STAGE 1 of 3 - SCRAPER
// ACTION:  REPLACE the existing scheduler/src/scraper/run.js
// PURPOSE: Runs the 4 sources; one bad source degrades, zero items fails the stage.
// NOTE:    Depends on existing files (leave them alone): ./db.js, ./models/RawItem.js, ./scrapers/*.js
// ============================================================

// scraper/run.js — runs all sources; one bad source degrades, zero items fails.

require("dotenv").config();

const { connectDB, disconnectDB } = require("./db");
const RawItem = require("./models/RawItem");
const { scrapeGithubTrending } = require("./scrapers/githubTrending");
const { scrapeHackerNews } = require("./scrapers/hackerNews");
const { scrapeArxiv } = require("./scrapers/arxiv");
const { scrapeDevTo } = require("./scrapers/devto");

const SOURCES = [
  ["github", scrapeGithubTrending],
  ["hackernews", scrapeHackerNews],
  ["arxiv", scrapeArxiv],
  ["devto", scrapeDevTo],
];

async function runScraper() {
  console.log("\nStarting scraper...");
  await connectDB();

  try {
    const results = await Promise.allSettled(SOURCES.map(([, fn]) => fn()));
    const items = [];
    const failures = [];

    results.forEach((r, i) => {
      const name = SOURCES[i][0];
      if (r.status === "fulfilled") {
        items.push(...r.value);
      } else {
        failures.push(name);
        console.error(`  Source "${name}" failed: ${(r.reason && r.reason.message) || r.reason}`);
      }
    });

    console.log(`Scraped ${items.length} items (${SOURCES.length - failures.length}/${SOURCES.length} sources ok)`);
    if (items.length === 0) {
      throw new Error(`Every source failed or returned nothing (failed: ${failures.join(", ") || "none"})`);
    }

    let saved = 0;
    let skipped = 0;
    for (const item of items) {
      try {
        const res = await RawItem.updateOne({ url: item.url }, { $setOnInsert: item }, { upsert: true });
        if (res.upsertedCount === 1) saved++;
        else skipped++;
      } catch (err) {
        console.error(`  Failed to save ${item.url}: ${err.message}`);
      }
    }
    console.log(`New items saved: ${saved}, duplicates skipped: ${skipped}`);
  } finally {
    await disconnectDB();
  }
}

module.exports = { runScraper };