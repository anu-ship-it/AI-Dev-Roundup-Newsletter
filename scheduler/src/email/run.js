// ============================================================
// FILE:    scheduler/src/email/run.js
// STAGE:   STAGE 3 of 3 - EMAIL (this is the stage's main file)
// ACTION:  REPLACE the existing scheduler/src/email/run.js
// PURPOSE: Sends the edition to every subscriber who has not received it yet. Safe to re-run.
// NOTE:    Depends on existing files (leave them alone): ./db.js, ./sender.js, ./models/ProcessedItem.js, ./templates/WeeklyDigest.js
// ============================================================

// email/run.js — send this edition's top items to every subscriber who hasn't had it yet.
//  * Idempotent: per-subscriber lastSentEdition, so a retry never double-sends.
//  * Items are marked sent only after at least one real delivery.
//  * Throws (exit 1) if nothing could be sent, so failures are never reported as success.

require("dotenv").config();

const { connectDB, disconnectDB } = require("./db");
const ProcessedItem = require("./models/ProcessedItem");
const Subscriber = require("./models/Subscriber");
const DeliveryRun = require("./models/DeliveryRun");
const { sendNewsletter } = require("./sender");

const MAX_ITEMS = parseInt(process.env.NEWSLETTER_MAX_ITEMS, 10) || 12;
const MAX_FAILURE_RATE = 0.3;

function getCurrentWeek() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runEmail() {
  console.log("\nStarting email delivery...");
  await connectDB();

  try {
    const edition = getCurrentWeek();

    const items = await ProcessedItem.find({ newsletterEdition: edition })
      .sort({ relevanceScore: -1 })
      .limit(MAX_ITEMS)
      .lean();
    console.log(`Edition ${edition}: ${items.length} items selected`);

    if (items.length === 0) {
      await DeliveryRun.create({ edition, status: "no_items" });
      throw new Error(`No items for edition ${edition} - the pipeline produced nothing to send`);
    }

    const subscribers = await Subscriber.find({ subscribed: true }).lean();
    const pending = subscribers.filter((s) => s.lastSentEdition !== edition);
    const alreadySent = subscribers.length - pending.length;
    console.log(
      `${subscribers.length} active subscribers, ${alreadySent} already received ${edition}, ${pending.length} pending`
    );

    let reached = 0;
    const errors = [];

    for (const sub of pending) {
      try {
        await sendNewsletter(items, edition, sub);
        await Subscriber.updateOne({ _id: sub._id }, { $set: { lastSentEdition: edition } });
        reached++;
        console.log(`  sent -> ${sub.email}`);
      } catch (err) {
        errors.push({ email: sub.email, error: String(err.message).slice(0, 200) });
        console.error(`  FAILED -> ${sub.email}: ${err.message}`);
      }
      await sleep(600); // Resend allows ~2 requests/second
    }

    const failed = errors.length;
    const delivered = reached + alreadySent;

    if (delivered > 0) {
      await ProcessedItem.updateMany({ _id: { $in: items.map((i) => i._id) } }, { $set: { sent: true } });
    }

    const status = failed === 0 ? "ok" : delivered === 0 ? "failed" : "partial";
    await DeliveryRun.create({
      edition,
      status,
      itemsIncluded: items.length,
      subscribersTotal: subscribers.length,
      alreadySent,
      reached,
      failed,
      errors: errors.slice(0, 10),
    });

    console.log(`\nDelivery: reached ${reached}, already sent ${alreadySent}, failed ${failed}`);

    if (subscribers.length > 0 && (delivered === 0 || failed / Math.max(pending.length, 1) > MAX_FAILURE_RATE)) {
      throw new Error(
        `Delivery degraded: ${failed}/${pending.length} sends failed (first error: ${errors[0] && errors[0].error})`
      );
    }
  } finally {
    await disconnectDB();
  }
}

module.exports = { runEmail };