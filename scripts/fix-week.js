require("dotenv").config({ path: "./email/.env" });
const mongoose = require("mongoose");

async function main() {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME });
    const db = mongoose.connection.db;

    const r1 = await db.collection("processeditems").updateMany(
        {sent : false },
        { $set: { newsletterEdition: "2026-W40" } }
    );
    console.log("Reassigned unsent items to W40:", r1.modifiedCount);
    const r2 = await db.collection("rawitems").updateMany(
    {},
    { $set: { processed: false } }
    );
    console.log("Reset raw items:", r2.modifiedCount);
    await mongoose.disconnect();
}

main();
