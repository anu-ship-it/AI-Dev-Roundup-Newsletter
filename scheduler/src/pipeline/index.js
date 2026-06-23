// index.js — AI Pipeline Orchestrator
//
// Reads unprocessed items from MongoDB (processed: false)
// Runs them through: dedup → rank → summarize
// Saves results to ProcessedItem collection
// Marks original RawItems as processed: true

require("dotenv").config();

const { connectDB, disconnectDB } = require("./db");
const RawItem = require("./models/RawItem");
const ProcessedItem = require("./models/ProcessedItem");
const { deduplicateItems } = require("./dedup");
const { rankItems } = require("./ranker");
const { summarizeItems } = require("./summarizer");

// Get the current week in "YYYY-Www" format — e.g. "2024-W28"
// This groups newsletter items by week for the email builder
function getCurrentWeek() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(
    ((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7
  );
  return `${now.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

// We need RawItem model available for the pipeline
// Import it here so Mongoose knows about it even though
// we use it via ProcessedItem's rawItemId reference
require("./models/RawItem");

async function main() {
  console.log("🤖 Starting AI Dev Roundup Pipeline...\n");

  await connectDB();

  try {
    const currentWeek = getCurrentWeek();
    console.log(`📅 Processing for week: ${currentWeek}`);

    // ── Step 1: Fetch unprocessed raw items ──
    const rawItems = await RawItem.find({ processed: false }).lean();
    console.log(`\n📥 Found ${rawItems.length} unprocessed items from scraper`);

    if (rawItems.length === 0) {
      console.log("Nothing to process. Run the scraper first.");
      return;
    }

    // ── Step 2: Fetch already-processed items from this week ──
    // These are used by dedup to avoid repeating stories
    const existingThisWeek = await ProcessedItem.find({
      newsletterEdition: currentWeek,
    }).lean();

    console.log(`📚 Already processed this week: ${existingThisWeek.length} items`);

    // ── Step 3: Deduplication ──
    const uniqueItems = await deduplicateItems(rawItems, existingThisWeek);

    if (uniqueItems.length === 0) {
      console.log("\n⚠️  All items were duplicates. Marking as processed and exiting.");
      await RawItem.updateMany(
        { _id: { $in: rawItems.map((i) => i._id) } },
        { processed: true }
      );
      return;
    }

    // ── Step 4: Ranking ──
    const rankedItems = await rankItems(uniqueItems);

    if (rankedItems.length === 0) {
      console.log("\n⚠️  No items passed the relevance threshold.");
      await RawItem.updateMany(
        { _id: { $in: rawItems.map((i) => i._id) } },
        { processed: true }
      );
      return;
    }

    // ── Step 5: Summarization ──
    const summarizedItems = await summarizeItems(rankedItems);

    // ── Step 6: Save to ProcessedItem collection ──
    console.log("\n💾 Saving processed items to MongoDB...");
    let saved = 0;

    for (const item of summarizedItems) {
      try {
        await ProcessedItem.updateOne(
          { url: item.url },
          {
            $setOnInsert: {
              rawItemId: item._id,
              source: item.source,
              title: item.title,
              url: item.url,
              description: item.description,
              metadata: item.metadata,
              relevanceScore: item.relevanceScore,
              summary: item.summary,
              newsletterEdition: currentWeek,
            },
          },
          { upsert: true }
        );
        saved++;
      } catch (err) {
        console.error(`  ❌ Failed to save: ${item.title}`, err.message);
      }
    }

    // ── Step 7: Mark all raw items as processed ──
    await RawItem.updateMany(
      { _id: { $in: rawItems.map((i) => i._id) } },
      { processed: true }
    );

    // ── Summary ──
    console.log("\n── Pipeline Summary ──────────────────────────");
    console.log(`  📥 Raw items fetched       : ${rawItems.length}`);
    console.log(`  🔍 After deduplication     : ${uniqueItems.length}`);
    console.log(`  🎯 After relevance ranking : ${rankedItems.length}`);
    console.log(`  ✅ Saved to ProcessedItems : ${saved}`);
    console.log(`  📅 Newsletter edition      : ${currentWeek}`);
    console.log("──────────────────────────────────────────────\n");

  } catch (err) {
    console.error("💥 Pipeline crashed:", err);
  } finally {
    await disconnectDB();
  }
}

main();