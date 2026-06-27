require("dotenv").config({ path: "./email/.env" });
const mongoose = require("mongoose");

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME });
  
  const db = mongoose.connection.db;
  
  // Check what's in rawitems
  const rawCount = await db.collection("rawitems").countDocuments();
  const processedCount = await db.collection("processedItems").countDocuments();
  
  console.log(`Raw items: ${rawCount}`);
  console.log(`Processed items: ${processedCount}`);
  
  // Reset all raw items to unprocessed
  const r1 = await db.collection("rawitems").updateMany({}, { $set: { processed: false } });
  console.log(`Reset raw items: ${r1.modifiedCount}`);
  
  // Reset all processed items to unsent and current week
  const r2 = await db.collection("processedItems").updateMany(
    {},
    { $set: { sent: false, newsletterEdition: "2026-W27" } }
  );
  console.log(`Reset processed items: ${r2.modifiedCount}`);
  
  await mongoose.disconnect();
}

main();