// ============================================================
// FILE:    scheduler/src/pipeline/run.js
// STAGE:   STAGE 2 of 3 - AI PIPELINE (this is the stage's main file)
// ACTION:  REPLACE the existing scheduler/src/pipeline/run.js
// PURPOSE: dedup -> rank -> summarize -> save. Fails loudly if the LLM is failing.
// NOTE:    Depends on existing files (leave them alone): ./db.js, ./dedup.js, ./models/RawItem.js, ./models/ProcessedItem.js
// ============================================================

// pipeline/run.js — dedup -> rank -> summarize -> save.
// Rules:
//  * An item is marked processed ONLY if it got a real verdict (scored, duplicate, or already known).
//  * If the LLM is failing, the stage THROWS (exit 1) after saving what it can, so it can't pass silently.
//  * Work per run is capped and old backlog expires, so a bad week can't eat the daily token quota.

require("dotenv").config();

const { connectDB, disconnectDB } = require("./db");
const RawItem = require("./models/RawItem");
const ProcessedItem = require("./models/ProcessedItem");
const { deduplicateItems } = require("./dedup");
const { rankItems } = require("./ranker");
const { summarizeItems } = require("./summarizer");

const MAX_ITEMS_PER_RUN = parseInt(process.env.MAX_ITEMS_PER_RUN, 10) || 100;
const MAX_AGE_DAYS = parseInt(process.env.RAW_ITEM_MAX_AGE_DAYS, 10) || 14;
const MAX_FAILURE_RATE = 0.25;

function getCurrentWeek() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

async function runPipeline() {
  console.log("\nStarting AI pipeline...");
  await connectDB();

  try {
    const edition = getCurrentWeek();
    const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 86400000);
    console.log(`Edition: ${edition}`);

    // Housekeeping: roll unsent items forward, expire stale raw items.
    const rolled = await ProcessedItem.updateMany(
      { sent: false, newsletterEdition: { $ne: edition } },
      { $set: { newsletterEdition: edition } }
    );
    if (rolled.modifiedCount) console.log(`Rolled ${rolled.modifiedCount} unsent items into ${edition}`);

    const expired = await RawItem.updateMany(
      { processed: false, createdAt: { $lt: cutoff } },
      { $set: { processed: true } }
    );
    if (expired.modifiedCount) console.log(`Expired ${expired.modifiedCount} raw items older than ${MAX_AGE_DAYS} days`);

    // Fetch work (newest first, capped).
    const raw = await RawItem.find({ processed: false })
      .sort({ createdAt: -1 })
      .limit(MAX_ITEMS_PER_RUN)
      .lean();
    console.log(`Found ${raw.length} unprocessed items (cap ${MAX_ITEMS_PER_RUN})`);
    if (raw.length === 0) {
      console.log("Nothing new to process.");
      return;
    }

    // Skip anything already turned into a newsletter item in any edition.
    const knownDocs = await ProcessedItem.find({ url: { $in: raw.map((i) => i.url) } }, { url: 1 }).lean();
    const known = new Set(knownDocs.map((d) => d.url));
    const fresh = raw.filter((i) => !known.has(i.url));
    if (known.size) console.log(`Skipping ${known.size} items already processed in earlier editions`);

    // Dedup against this edition.
    const existing = await ProcessedItem.find({ newsletterEdition: edition }).lean();
    const unique = await deduplicateItems(fresh, existing);
    const uniqueIds = new Set(unique.map((i) => String(i._id)));
    const settledIds = [
      ...raw.filter((i) => known.has(i.url)).map((i) => i._id),
      ...fresh.filter((i) => !uniqueIds.has(String(i._id))).map((i) => i._id),
    ];

    // Rank.
    const { passed, evaluatedIds, failed, aborted, lastError } = await rankItems(unique);

    // Summarize + save what passed.
    let saved = 0;
    if (passed.length) {
      const summarized = await summarizeItems(passed);
      for (const item of summarized) {
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
              newsletterEdition: edition,
            },
          },
          { upsert: true }
        );
        saved++;
      }
    }

    // Only items with a real verdict leave the queue.
    await RawItem.updateMany(
      { _id: { $in: [...settledIds, ...evaluatedIds] } },
      { $set: { processed: true } }
    );

    console.log("\n-- Pipeline summary --");
    console.log(`  fetched ${raw.length} | duplicates/known ${settledIds.length} | scored ${evaluatedIds.length}`);
    console.log(`  passed ${passed.length} | saved ${saved} | scoring failures ${failed}`);

    if (aborted || (unique.length > 0 && failed / unique.length > MAX_FAILURE_RATE)) {
      throw new Error(
        `Ranking degraded: ${failed}/${unique.length} items could not be scored ` +
          `(last error: ${lastError}). Unscored items stay queued for the next run.`
      );
    }
  } finally {
    await disconnectDB();
  }
}

module.exports = { runPipeline };