// ============================================================
// FILE:    scripts/requeue-recent.js
// STAGE:   ONE-TIME RECOVERY SCRIPT - not part of any stage
// ACTION:  NEW FILE - create scripts/requeue-recent.js in the REPO ROOT (next to the scheduler folder)
// PURPOSE: Re-queues the last 14 days of scrapes that the old pipeline silently discarded.
// NOTE:    Run once from the repo root:  node scripts/requeue-recent.js
// ============================================================

// Recovers the scrapes the old pipeline silently marked processed.
// The pipeline skips URLs it already turned into newsletter items, so this can't create duplicates.
require("dotenv").config({ path: "./email/.env" });
const mongoose = require("mongoose");

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME });
  const db = mongoose.connection.db;

  const since = new Date(Date.now() - 14 * 86400000);
  const r = await db.collection("rawitems").updateMany(
    { createdAt: { $gte: since } },
    { $set: { processed: false } }
  );
  console.log(`Re-queued ${r.modifiedCount} raw items from the last 14 days`);

  const unsent = await db.collection("processeditems").countDocuments({ sent: false });
  const subs = await db.collection("subscribers").countDocuments({ subscribed: true });
  console.log(`processeditems unsent: ${unsent} | active subscribers: ${subs}`);

  await mongoose.disconnect();
}

main();