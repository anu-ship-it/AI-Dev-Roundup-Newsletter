// pipeline/run.js — Wraps AI pipeline logic as an async function

require("dotenv").config();

const { connectDB, disconnectDB } = require("./db");
const RawItem = require("./models/RawItem");
const ProcessedItem = require("./models/ProcessedItem");
const { deduplicateItems } = require("./dedup");
const { rankItems } = require("./ranker");
const { summarizeItems } = require("./summarizer");

function getCurrentWeek() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(
    ((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7
  );
  return `${now.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

async function runPipeline() {
  console.log("\nStarting AI Pipeline...");

  await connectDB();

  try {
    const currentWeek = getCurrentWeek();
    console.log(`Processing for week: ${currentWeek}`);

    const rawItems = await RawItem.find({ processed: false }).lean();
    console.log(`Found ${rawItems.length} unprocessed items`);

    if (rawItems.length === 0) {
      console.log("Nothing to process.");
      return;
    }

    const existingThisWeek = await ProcessedItem.find({
      newsletterEdition: currentWeek,
    }).lean();

    const uniqueItems = await deduplicateItems(rawItems, existingThisWeek);

    if (uniqueItems.length === 0) {
      await RawItem.updateMany(
        { _id: { $in: rawItems.map((i) => i._id) } },
        { processed: true }
      );
      return;
    }

    const rankedItems = await rankItems(uniqueItems);

    if (rankedItems.length === 0) {
      await RawItem.updateMany(
        { _id: { $in: rawItems.map((i) => i._id) } },
        { processed: true }
      );
      return;
    }

    const summarizedItems = await summarizeItems(rankedItems);

    for (const item of summarizedItems) {
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
    }

    await RawItem.updateMany(
      { _id: { $in: rawItems.map((i) => i._id) } },
      { processed: true }
    );

    console.log(`Saved ${summarizedItems.length} processed items`);
  } finally {
    await disconnectDB();
  }
}

module.exports = { runPipeline };
