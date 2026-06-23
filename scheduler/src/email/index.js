// index.js — Email Service Orchestrator
//
// 1. Connects to MongoDB
// 2. Fetches processed items for current week that haven't been sent
// 3. Fetches all active subscribers
// 4. Sends the newsletter to each subscriber individually
// 5. Marks items as sent: true

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

async function main() {
  console.log("📬 Starting AI Dev Roundup Email Service...\n");

  await connectDB();

  try {
    const currentWeek = getCurrentWeek();
    console.log(`📅 Sending newsletter for week: ${currentWeek}`);

    // Fetch unsent processed items for this week
    const items = await ProcessedItem.find({
      newsletterEdition: currentWeek,
      sent: false,
    })
      .sort({ relevanceScore: -1 })
      .lean();

    console.log(`📥 Found ${items.length} unsent items for ${currentWeek}`);

    if (items.length === 0) {
      console.log("Nothing to send. Run the AI pipeline first.");
      return;
    }

    // Fetch all active subscribers
    const subscribers = await Subscriber.find({ subscribed: true }).lean();
    console.log(`👥 Found ${subscribers.length} active subscribers\n`);

    if (subscribers.length === 0) {
      console.log("No active subscribers yet. Share your signup page!");
      return;
    }

    // Send to each subscriber individually
    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
      try {
        await sendNewsletter(items, currentWeek, subscriber);
        console.log(`  ✅ Sent to ${subscriber.email}`);
        sent++;
      } catch (err) {
        console.error(`  ❌ Failed to send to ${subscriber.email}: ${err.message}`);
        failed++;
      }

      // Small delay between sends — avoids hitting Resend rate limits
      // Resend free tier: 2 emails/second
      await new Promise((r) => setTimeout(r, 500));
    }

    // Mark all items as sent
    const itemIds = items.map((i) => i._id);
    await ProcessedItem.updateMany(
      { _id: { $in: itemIds } },
      { $set: { sent: true } }
    );

    console.log(`\n── Email Summary ─────────────────────────`);
    console.log(`  ✅ Newsletter sent     : ${currentWeek}`);
    console.log(`  📧 Items included      : ${items.length}`);
    console.log(`  👥 Subscribers reached : ${sent}`);
    console.log(`  ❌ Failed sends        : ${failed}`);
    console.log(`──────────────────────────────────────────\n`);

  } catch (err) {
    console.error("💥 Email service crashed:", err);
  } finally {
    await disconnectDB();
  }
}

main();