require("dotenv").config({ path: "./email/.env" });
const mongoose = require("mongoose");

function getCurrentWeek() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(
  ((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7
  );
  return `${now.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME });
  const db = mongoose.connection.db;
  const currentWeek = getCurrentWeek();

  console.log(`Current week: ${currentWeek}`);

  const r1 = await db.collection("processeditems").updateMany(
    { sent: false },
    { $set: { newsletterEdition: currentWeek } }
  );
  console.log(`Reassigmend unsent items to ${currentWeek}:`, r1.modifiedCount);
  const r2 = await db.collection("rawitems").updateMany(
    {},
    { $set: { processed: false } }
  );
  console.log("Reset raw items:", r2.modifiedCount);
  await mongoose.disconnect();
};
main();
