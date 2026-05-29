// index.js — Email Service Orchestrator
//
// 1. Connects to MongoDB
// 2. Fetches processed items for current week that haven't been sent
// 3. Renders and sends the newsletter via Resend
// 4. Marks items as sent: true so they don't get sent again

require("dotenv").config();

const { connectDB, disconnectDB } = require("./db");
const ProcessedItem = require("./models/ProcessedItem");
const { sendNewsletter } = require("./sender");

// Get current week in "YYYY-Www" format — must match ai-pipeline
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

    // Fetch processed items for this week that haven't been sent yet
    // Sort by relevance score — highest first
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

    // Send the newsletter
    const emailId = await sendNewsletter(items, currentWeek);

    // Mark all sent items as sent: true
    // This prevents duplicate sends if this service runs again
    const itemIds = items.map((i) => i._id);
    await ProcessedItem.updateMany(
      { _id: { $in: itemIds } },
      { $set: { sent: true } }
    );

    console.log(`\n── Email Summary ─────────────────────────`);
    console.log(`  ✅ Newsletter sent     : ${currentWeek}`);
    console.log(`  📧 Items included      : ${items.length}`);
    console.log(`  🆔 Resend email ID     : ${emailId}`);
    console.log(`  📮 Sent to             : ${process.env.TO_EMAIL}`);
    console.log(`──────────────────────────────────────────\n`);

  } catch (err) {
    console.error("💥 Email service crashed:", err);
  } finally {
    await disconnectDB();
  }
}

main();
