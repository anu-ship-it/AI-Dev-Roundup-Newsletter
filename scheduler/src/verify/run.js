// ============================================================
// FILE:    scheduler/src/verify/run.js
// STAGE:   MONITORING - separate 4th stage, runs Monday 09:00 IST on its own EventBridge rule
// ACTION:  NEW FILE - first create the folder scheduler/src/verify/ , then this file inside it
// PURPOSE: Checks the last delivery. Emails you a report if OK, alerts and exits 1 if not.
// NOTE:    Imports ../email/db.js and ../email/models/* (already exist or are created above).
// ============================================================

// verify/run.js — the independent check. Runs Monday morning on its OWN EventBridge rule
// (not through Step Functions), so it still fires if the Sunday run never started.
//  * Healthy  -> sends you a short "delivery OK" report (no report = something is wrong).
//  * Unhealthy-> emails an alert AND exits 1, which triggers the SNS alert independently of Resend.

require("dotenv").config();

const { Resend } = require("resend");
const { connectDB, disconnectDB } = require("../email/db");
const DeliveryRun = require("../email/models/DeliveryRun");
const Subscriber = require("../email/models/Subscriber");

const MAX_AGE_DAYS = parseInt(process.env.MAX_DELIVERY_AGE_DAYS, 10) || 8;

async function notify(subject, lines) {
  const to = process.env.ALERT_EMAIL;
  if (!to || !process.env.RESEND_API_KEY || !process.env.FROM_EMAIL) {
    console.warn("ALERT_EMAIL / RESEND_API_KEY / FROM_EMAIL not set - skipping notification email");
    return;
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      text: lines.join("\n"),
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error(`Could not send notification email: ${err.message}`);
  }
}

async function runVerify() {
  console.log("\nVerifying last delivery...");
  await connectDB();

  try {
    const activeSubscribers = await Subscriber.countDocuments({ subscribed: true });
    if (activeSubscribers === 0) {
      console.log("No active subscribers - nothing to verify");
      return;
    }

    const since = new Date(Date.now() - MAX_AGE_DAYS * 86400000);
    const last = await DeliveryRun.findOne({ reached: { $gt: 0 } }).sort({ createdAt: -1 }).lean();

    if (last && last.createdAt >= since) {
      const msg = `Edition ${last.edition}: reached ${last.reached}, failed ${last.failed}, ${last.itemsIncluded} items`;
      console.log(`OK - ${msg}`);
      await notify(`[AI Dev Roundup] Delivery OK - ${last.edition}`, [
        msg,
        `Active subscribers: ${activeSubscribers}`,
        `Sent at: ${last.createdAt.toISOString()}`,
      ]);
      return;
    }

    const detail = last
      ? `Last successful delivery: ${last.createdAt.toISOString()} (edition ${last.edition}).`
      : "No successful delivery has ever been recorded.";

    await notify(`[AI Dev Roundup] ALERT - nothing delivered in ${MAX_AGE_DAYS} days`, [
      detail,
      `Active subscribers: ${activeSubscribers}`,
      "Check Step Functions (ai-dev-roundup-pipeline) executions and the /ecs/ai-dev-roundup log group.",
    ]);
    throw new Error(`No successful delivery in the last ${MAX_AGE_DAYS} days. ${detail}`);
  } finally {
    await disconnectDB();
  }
}

module.exports = { runVerify };