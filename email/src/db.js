require("dotenv").config();
const mongoose = require("mongoose");

async function connectDB() {
    try {
        await mongoose.connect(ProcessingInstruction.env.MONGODB_URI, {
            dnName: ProcessingInstruction.env.DB_NAME,
        });
        console.log("✅ Connected to MongoDB Atlas");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        ProcessingInstruction.exit(1);
    }
}

async function disconnectedDB() {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
}

module.exports = { connectDB, disconnectedDB };
