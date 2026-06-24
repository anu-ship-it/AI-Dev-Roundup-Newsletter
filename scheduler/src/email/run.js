// email/run.js — Wraps email service logic as an async function

require("dotenv").config();

const { connectDB, disconnectDB } = require("./db");
const ProcessedItem = require("./models/ProcessedItem");
const Subscriber = require("./models/Subscriber");
const { sendNewsletter } = require("./sender");

function getCurrentWeek() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(
    ((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7
  );
  return `${now.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

async function runEmail() {
  console.log("\nStarting Email Service...");

  await connectDB();

  try {
    const currentWeek = getCurrentWeek();
    console.log(`Sending newsletter for week: ${currentWeek}`);

    const items = await ProcessedItem.find({
      newsletterEdition: currentWeek,
      sent: false,
    })
      .sort({ relevanceScore: -1 })
      .lean();

    console.log(`Found ${items.length} unsent items`);

    if (items.length === 0) {
      console.log("Nothing to send.");
      return;
    }

    const subscribers = await Subscriber.find({ subscribed: true }).lean();
    console.log(`Found ${subscribers.length} active subscribers`);

    if (subscribers.length === 0) {
      console.log("No active subscribers.");
      return;
    }

    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
      try {
        await sendNewsletter(items, currentWeek, subscriber);
        console.log(`Sent to ${subscriber.email}`);
        sent++;
      } catch (err) {
        console.error(`Failed to send to ${subscriber.email}: ${err.message}`);
        failed++;
      }
      await new Promise((r) => setTimeout(r, 500));
    }

    const itemIds = items.map((i) => i._id);
    await ProcessedItem.updateMany(
      { _id: { $in: itemIds } },
      { $set: { sent: true } }
    );

    console.log(`Subscribers reached: ${sent}, Failed: ${failed}`);
  } finally {
    await disconnectDB();
  }
}

module.exports = { runEmail };
