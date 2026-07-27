// index.js — Entry point for the scraper service
//
// This is the "orchestrator" — it:
// 1. Connects to MongoDB
// 2. Runs each scraper
// 3. Saves results to MongoDB (skipping duplicates)
// 4. Logs a summary
// 5. Disconnects cleanly

require("dotenv").config();

const { connectDB, disconnectDB } = require("./db");
const RawItem = require("./models/RawItem");
const { scrapeGithubTrending } = require("./scrapers/githubTrending");
const { scrapeHackerNews } = require("./scrapers/hackerNews");
const { scrapeArvix } = require("./scrapers/Arxiv");
const { scrapeDevTo } = require("./scrapers/Devto");

// saveItems() takes the array of scraped items and stores them in MongoDB.
// It uses "upsert" logic: if a URL already exists, skip it.
// If it's new, insert it. This way we never store duplicates.
async function saveItems(items) {
  let saved = 0;
  let skipped = 0;

  for (const item of items) {
    try {
      // insertOne() with the { url } filter and upsert:true means:
      // "If a document with this URL exists, do nothing (skip).
      //  If it doesn't exist, create it."
      //
      // The $setOnInsert operator ensures we only set fields
      // when we're actually inserting — not overwriting existing records
      const result = await RawItem.updateOne(
        { url: item.url },         // find by URL
        { $setOnInsert: item },    // only set fields on new insert
        { upsert: true }           // create if doesn't exist
      );

      // result.upsertedCount is 1 if a new doc was created, 0 if it was skipped
      if (result.upsertedCount === 1) {
        saved++;
      } else {
        skipped++;
      }
    } catch (err) {
      console.error(`❌ Failed to save item: ${item.url}`, err.message);
    }
  }

  return { saved, skipped };
}

async function main() {
  console.log("🚀 Starting AI Dev Roundup Scraper...\n");

  // Step 1: Connect to MongoDB
  await connectDB();

  try {
    // Step 2: Run all scrapers
    // Right now we only have GitHub Trending.
    // When we add HN, arXiv etc., we add them here.
    const [github, hn, arvix, devto] = await Promise.allSettled([
      scrapeGithubTrending(),
      scrapeHackerNews(),
      scrapeArvix(),
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

    console.log(`\n📦 Total items scraped: ${allItems.length}`);

    // Step 3: Save to MongoDB
    const { saved, skipped } = await saveItems(allItems);

    // Step 4: Summary
    console.log("\n── Summary ──────────────────────");
    console.log(`  ✅ New items saved : ${saved}`);
    console.log(`  ⏭️  Duplicates skipped: ${skipped}`);
    console.log(`  📊 Total processed: ${allItems.length}`);
    console.log("─────────────────────────────────\n");

  } catch (err) {
    console.error("💥 Scraper crashed:", err);
  } finally {
    // Step 5: Always disconnect, even if something errored
    await disconnectDB();
  }
}

// Run it
main();